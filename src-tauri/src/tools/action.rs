use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolAction {
    pub tool_id: String,
    pub target: Option<String>,
    pub inputs: Vec<ToolActionInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolActionInput {
    pub name: String,
    pub value: String,
}