use super::discovery::ToolDiscoveryResult;
use super::knowledge::{
    DiscoveredCapability,
    DiscoveredInput,
    ToolKnowledge,
};
use super::profiles;

pub fn build(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
) -> ToolKnowledge {
    if let Some(profile) = profiles::get_profile(tool_id) {
        return build_from_profile(
            tool_id,
            name,
            discovery,
            profile,
        );
    }

    build_from_discovery(
        tool_id,
        name,
        discovery,
    )
}

fn build_from_profile(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
    profile: &super::profile::ToolProfile,
) -> ToolKnowledge {
    let inputs = profile
        .inputs
        .iter()
        .map(|input| DiscoveredInput {
            name: input.id.to_string(),
            input_type: input.input_type.clone(),
            required: input.required,
            description: input.description.to_string(),
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
        capabilities,
        inputs,
    }
}

fn build_from_discovery(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
) -> ToolKnowledge {
    let mut capabilities = Vec::new();

    if discovery.help.is_some() {
        capabilities.push(
            DiscoveredCapability {
                name: "command-line-tool".to_string(),
                description:
                    "Command-line tool discovered through executable help information."
                        .to_string(),
            },
        );
    }

    ToolKnowledge {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable.clone(),
        version: discovery.version.clone(),
        capabilities,
        inputs: Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_known_profile() {
        let discovery = ToolDiscoveryResult {
            executable: "nmap".to_string(),
            version: Some("test-version".to_string()),
            help: Some("test-help".to_string()),
        };

        let knowledge = build(
            "nmap",
            "Nmap",
            &discovery,
        );

        assert_eq!(
            knowledge.tool_id,
            "nmap"
        );

        assert_eq!(
            knowledge.name,
            "Nmap"
        );

        assert!(
            !knowledge.inputs.is_empty()
        );

        assert!(
            !knowledge.capabilities.is_empty()
        );
    }

    #[test]
    fn builds_unknown_tool_from_discovery() {
        let discovery = ToolDiscoveryResult {
            executable: "example-tool".to_string(),
            version: Some("1.0".to_string()),
            help: Some("Usage: example-tool".to_string()),
        };

        let knowledge = build(
            "example-tool",
            "Example Tool",
            &discovery,
        );

        assert_eq!(
            knowledge.tool_id,
            "example-tool"
        );

        assert_eq!(
            knowledge.version,
            Some("1.0".to_string())
        );

        assert!(
            !knowledge.capabilities.is_empty()
        );
    }
}