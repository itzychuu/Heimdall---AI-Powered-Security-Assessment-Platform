use serde::Serialize;

use super::profile::InputType;

#[derive(Debug, Clone, Serialize)]
pub struct DiscoveredInput {
    pub name: String,
    pub input_type: InputType,
    pub required: bool,
    pub description: String,
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
    pub capabilities: Vec<DiscoveredCapability>,
    pub inputs: Vec<DiscoveredInput>,
}