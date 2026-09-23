use serde::{Deserialize, Serialize};

use super::discovery::ToolDiscoveryResult;
use super::help_parser::ParsedCliOption;
use super::knowledge::{KnowledgeSource, ToolKnowledge};
use super::profile::ToolProfile;
use super::profiles;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AiToolInterpretation {
    pub purpose: String,
    pub relevant_capabilities: Vec<String>,
    pub relevant_inputs: Vec<String>,
    pub recommended_options: Vec<String>,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolIntelligence {
    pub tool_id: String,
    pub name: String,
    pub executable: String,
    pub version: Option<String>,
    pub help: Option<String>,
    pub known_profile: bool,
    pub source: KnowledgeSource,
    pub parsed_options: Vec<ParsedCliOption>,
    pub ai_interpretation: Option<AiToolInterpretation>,
}

impl ToolIntelligence {
    pub fn from_knowledge(knowledge: &ToolKnowledge) -> Self {
        Self {
            tool_id: knowledge.tool_id.clone(),
            name: knowledge.name.clone(),
            executable: knowledge.executable.clone(),
            version: knowledge.version.clone(),
            help: knowledge.raw_help.clone(),
            known_profile: profiles::get_profile(&knowledge.tool_id).is_some(),
            source: knowledge.source.clone(),
            parsed_options: knowledge.parsed_options.clone(),
            ai_interpretation: None,
        }
    }

    pub fn with_interpretation(mut self, interpretation: AiToolInterpretation) -> Self {
        self.ai_interpretation = Some(interpretation);
        self
    }

    pub fn has_discovery_data(&self) -> bool {
        self.version.is_some() || self.help.is_some() || !self.parsed_options.is_empty()
    }

    pub fn discovery_summary(&self) -> String {
        let mut summary = String::new();

        if let Some(version) = &self.version {
            summary.push_str("VERSION:\n");
            summary.push_str(version);
            summary.push_str("\n\n");
        }

        if !self.parsed_options.is_empty() {
            summary.push_str(&format!(
                "PARSED CLI OPTIONS ({}):\n",
                self.parsed_options.len()
            ));
            for opt in &self.parsed_options {
                summary.push_str(&format!(
                    "  {} (requires_value: {}, hint: {:?}): {}\n",
                    opt.flag, opt.requires_value, opt.value_hint, opt.description
                ));
            }
            summary.push_str("\n");
        } else if let Some(help) = &self.help {
            summary.push_str("RAW HELP:\n");
            summary.push_str(help);
        }

        summary
    }
}

pub fn build(
    tool_id: &str,
    name: &str,
    discovery: ToolDiscoveryResult,
) -> ToolIntelligence {
    let knowledge = super::knowledge_builder::build(tool_id, name, &discovery);
    ToolIntelligence::from_knowledge(&knowledge)
}

pub fn get_known_profile(tool_id: &str) -> Option<&'static ToolProfile> {
    profiles::get_profile(tool_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tools::knowledge::KnowledgeSource;

    #[test]
    fn test_intelligence_from_knowledge() {
        let discovery = ToolDiscoveryResult {
            executable: "nmap".to_string(),
            version: Some("7.99".to_string()),
            help: Some("-Pn\n  Skip host discovery".to_string()),
        };

        let knowledge = super::super::knowledge_builder::build("nmap", "Nmap", &discovery);
        let intel = ToolIntelligence::from_knowledge(&knowledge);

        assert_eq!(intel.tool_id, "nmap");
        assert_eq!(intel.source, KnowledgeSource::BuiltInProfile);
        assert!(intel.known_profile);
        assert!(intel.has_discovery_data());
    }

    #[test]
    fn test_intelligence_with_ai_interpretation() {
        let discovery = ToolDiscoveryResult {
            executable: "synthtool".to_string(),
            version: Some("1.0".to_string()),
            help: Some("-t <threads>\n  Threads".to_string()),
        };

        let knowledge = super::super::knowledge_builder::build("synthtool", "Synth Tool", &discovery);
        let interpretation = AiToolInterpretation {
            purpose: "Web Fuzzing".to_string(),
            relevant_capabilities: vec!["fuzzing".to_string()],
            relevant_inputs: vec!["-t".to_string()],
            recommended_options: vec!["-t 10".to_string()],
            reasoning: "User requested thread speed".to_string(),
        };

        let intel = ToolIntelligence::from_knowledge(&knowledge).with_interpretation(interpretation.clone());

        assert_eq!(intel.ai_interpretation, Some(interpretation));
    }
}