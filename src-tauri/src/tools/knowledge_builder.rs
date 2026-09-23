use super::discovery::ToolDiscoveryResult;
use super::help_parser::{self, ParsedCliOption};
use super::knowledge::{
    DiscoveredCapability,
    DiscoveredInput,
    KnowledgeSource,
    ToolKnowledge,
};
use super::profile::InputType;
use super::profiles;

pub fn build(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
) -> ToolKnowledge {
    let parsed_options = match &discovery.help {
        Some(help) => help_parser::parse_help(help),
        None => Vec::new(),
    };

    if let Some(profile) = profiles::get_profile(tool_id) {
        return build_from_profile(
            tool_id,
            name,
            discovery,
            profile,
            parsed_options,
        );
    }

    build_from_discovery(
        tool_id,
        name,
        discovery,
        parsed_options,
    )
}

fn build_from_profile(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
    profile: &super::profile::ToolProfile,
    parsed_options: Vec<ParsedCliOption>,
) -> ToolKnowledge {
    let inputs = profile
        .inputs
        .iter()
        .map(|input| {
            let flag = match &input.argument_style {
                Some(super::profile::ArgumentStyle::Flag(flag)) => {
                    Some((*flag).to_string())
                }
                Some(super::profile::ArgumentStyle::Value(flag)) => {
                    Some((*flag).to_string())
                }
                Some(super::profile::ArgumentStyle::FlagValue(flag)) => {
                    Some((*flag).to_string())
                }
                None => None,
            };

            DiscoveredInput {
                name: input.id.to_string(),
                input_type: input.input_type.clone(),
                required: input.required,
                description: input.description.to_string(),
                flag,
            }
        })
        .collect();

    let capabilities = profile
        .capabilities
        .iter()
        .map(|capability| DiscoveredCapability {
            name: capability.name.to_string(),
            description: capability.description.to_string(),
        })
        .collect();

    ToolKnowledge {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable.clone(),
        version: discovery.version.clone(),
        source: KnowledgeSource::BuiltInProfile,
        parsed_options,
        capabilities,
        inputs,
        raw_help: discovery.help.clone(),
    }
}

fn build_from_discovery(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
    parsed_options: Vec<ParsedCliOption>,
) -> ToolKnowledge {
    let mut capabilities = Vec::new();
    let mut inputs = Vec::new();

    if discovery.help.is_some() {
        capabilities.push(DiscoveredCapability {
            name: "command-line-tool".to_string(),
            description:
                "Command-line tool discovered through executable help information."
                    .to_string(),
        });

        if !parsed_options.is_empty() {
            capabilities.push(DiscoveredCapability {
                name: "cli-options".to_string(),
                description: format!(
                    "Supports {} parsed command-line options from help text.",
                    parsed_options.len()
                ),
            });
        }
    }

    if discovery.version.is_some() {
        capabilities.push(DiscoveredCapability {
            name: "version-reporting".to_string(),
            description: format!(
                "Executable version: {}",
                discovery.version.as_deref().unwrap_or("")
            ),
        });
    }

    for opt in &parsed_options {
        let input_type = infer_input_type(opt);

        inputs.push(DiscoveredInput {
            name: opt.flag.clone(),
            input_type,
            required: false,
            description: opt.description.clone(),
            flag: Some(opt.flag.clone()),
        });
    }

    let source = if discovery.help.is_some() {
        KnowledgeSource::ParsedHelp
    } else {
        KnowledgeSource::ExecutableDiscovery
    };

    ToolKnowledge {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable.clone(),
        version: discovery.version.clone(),
        source,
        parsed_options,
        capabilities,
        inputs,
        raw_help: discovery.help.clone(),
    }
}

fn infer_input_type(opt: &ParsedCliOption) -> InputType {
    if !opt.requires_value {
        return InputType::Boolean;
    }

    if let Some(hint) = &opt.value_hint {
        let hint_lower = hint.to_lowercase();
        if hint_lower.contains("num")
            || hint_lower.contains("count")
            || hint_lower.contains("size")
            || hint_lower.contains("level")
            || hint_lower.contains("port")
            || hint_lower.contains("tries")
            || hint_lower.contains("0-5")
            || hint_lower.contains("ratio")
            || hint_lower.contains("threads")
        {
            return InputType::Number;
        }

        if hint_lower.contains("wordlist") {
            return InputType::Wordlist;
        }

        if hint_lower.contains("file")
            || hint_lower.contains("path")
            || hint_lower.contains("dir")
        {
            return InputType::File;
        }
    }

    InputType::Text
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_h_known_tool_with_profile() {
        let discovery = ToolDiscoveryResult {
            executable: "nmap".to_string(),
            version: Some("7.99".to_string()),
            help: Some("-Pn\n  Treat all hosts as online\n-p <port ranges>\n  Scan specified ports".to_string()),
        };

        let knowledge = build("nmap", "Nmap", &discovery);
        assert_eq!(knowledge.source, KnowledgeSource::BuiltInProfile);
        assert!(!knowledge.inputs.is_empty());
        assert!(!knowledge.parsed_options.is_empty());
        assert_eq!(knowledge.tool_id, "nmap");
    }

    #[test]
    fn test_i_unknown_tool_without_profile() {
        let help = "-v\n  Enable verbose logging\n-u <target url>\n  Specify target URL";
        let discovery = ToolDiscoveryResult {
            executable: "unknown_scanner".to_string(),
            version: Some("1.2.3".to_string()),
            help: Some(help.to_string()),
        };

        let knowledge = build("unknown_scanner", "UnknownScanner", &discovery);
        assert_eq!(knowledge.source, KnowledgeSource::ParsedHelp);
        assert_eq!(knowledge.parsed_options.len(), 2);
        assert_eq!(knowledge.inputs.len(), 2);
        assert_eq!(knowledge.inputs[0].name, "-v");
        assert_eq!(knowledge.inputs[0].flag.as_deref(), Some("-v"));
        assert!(matches!(knowledge.inputs[0].input_type, InputType::Boolean));
        assert_eq!(knowledge.inputs[1].name, "-u");
        assert_eq!(knowledge.inputs[1].flag.as_deref(), Some("-u"));
        assert!(matches!(knowledge.inputs[1].input_type, InputType::Text));
    }

    #[test]
    fn test_j_tool_with_version_but_no_help() {
        let discovery = ToolDiscoveryResult {
            executable: "minimal_tool".to_string(),
            version: Some("0.0.1".to_string()),
            help: None,
        };

        let knowledge = build("minimal_tool", "MinimalTool", &discovery);
        assert_eq!(knowledge.source, KnowledgeSource::ExecutableDiscovery);
        assert_eq!(knowledge.version.as_deref(), Some("0.0.1"));
        assert!(knowledge.parsed_options.is_empty());
        assert!(knowledge.inputs.is_empty());
        assert!(knowledge.capabilities.iter().any(|c| c.name == "version-reporting"));
    }

    #[test]
    fn test_k_tool_with_help_but_no_version() {
        let discovery = ToolDiscoveryResult {
            executable: "no_ver_tool".to_string(),
            version: None,
            help: Some("-h\n  Display help".to_string()),
        };

        let knowledge = build("no_ver_tool", "NoVerTool", &discovery);
        assert_eq!(knowledge.source, KnowledgeSource::ParsedHelp);
        assert!(knowledge.version.is_none());
        assert_eq!(knowledge.parsed_options.len(), 1);
        assert_eq!(knowledge.inputs.len(), 1);
    }

    #[test]
    fn test_l_empty_invalid_help() {
        let discovery = ToolDiscoveryResult {
            executable: "dummy".to_string(),
            version: None,
            help: Some("   \n\n   ".to_string()),
        };

        let knowledge = build("dummy", "Dummy", &discovery);
        assert!(knowledge.parsed_options.is_empty());
        assert!(knowledge.inputs.is_empty());
    }

    #[test]
    fn test_m_real_nmap_help_if_available() {
        let discovery_res = crate::tools::discovery::discover("D:\\Pentesting Tools\\nmap.exe")
            .or_else(|_| crate::tools::discovery::discover("nmap"));

        if let Ok(discovery) = discovery_res {
            let knowledge = build("nmap", "Nmap", &discovery);
            assert_eq!(knowledge.source, KnowledgeSource::BuiltInProfile);
            assert!(!knowledge.parsed_options.is_empty());
            assert!(!knowledge.inputs.is_empty());
        }
    }

    #[test]
    fn test_n_synthetic_unknown_tool() {
        let help = r#"
Synthetic Fuzzer v3.0

USAGE:
  synthfuzz [options]

OPTIONS:
  -t <threads>
      Set number of worker threads
  --wordlist=<path>
      Path to input wordlist file
  --json
      Output results in JSON format
"#;

        let discovery = ToolDiscoveryResult {
            executable: "synthfuzz".to_string(),
            version: Some("3.0".to_string()),
            help: Some(help.to_string()),
        };

        let knowledge = build("synthfuzz", "Synthetic Fuzzer", &discovery);
        assert_eq!(knowledge.source, KnowledgeSource::ParsedHelp);
        assert_eq!(knowledge.parsed_options.len(), 3);
        assert_eq!(knowledge.inputs.len(), 3);

        assert_eq!(knowledge.inputs[0].flag.as_deref(), Some("-t"));
        assert!(matches!(knowledge.inputs[0].input_type, InputType::Number));

        assert_eq!(knowledge.inputs[1].flag.as_deref(), Some("--wordlist"));
        assert!(matches!(knowledge.inputs[1].input_type, InputType::Wordlist | InputType::File));

        assert_eq!(knowledge.inputs[2].flag.as_deref(), Some("--json"));
        assert!(matches!(knowledge.inputs[2].input_type, InputType::Boolean));
    }
}