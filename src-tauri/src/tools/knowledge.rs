use serde::Serialize;

use super::help_parser::ParsedCliOption;
use super::profile::InputType;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub enum KnowledgeSource {
    BuiltInProfile,
    ExecutableDiscovery,
    ParsedHelp,
    AiInterpretation,
}

#[derive(Debug, Clone, Serialize)]
pub struct DiscoveredInput {
    pub name: String,
    pub input_type: InputType,
    pub required: bool,
    pub description: String,
    pub flag: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DiscoveredCapability {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolKnowledge {
    pub tool_id: String,
    pub name: String,
    pub executable: String,
    pub version: Option<String>,
    pub source: KnowledgeSource,
    pub parsed_options: Vec<ParsedCliOption>,
    pub capabilities: Vec<DiscoveredCapability>,
    pub inputs: Vec<DiscoveredInput>,
    pub raw_help: Option<String>,
}