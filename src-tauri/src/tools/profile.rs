use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum InputType {
    Target,
    Url,
    Ip,
    Domain,
    Port,
    Ports,
    File,
    HashFile,
    Wordlist,
    Text,
    Number,
    Boolean,
    Select,
}

#[derive(Debug, Clone, Serialize)]
pub enum ArgumentStyle {
    Flag(&'static str),
    Value(&'static str),
    FlagValue(&'static str),
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolInput {
    pub id: &'static str,
    pub label: &'static str,
    pub input_type: InputType,
    pub required: bool,
    pub description: &'static str,
    pub argument_style: Option<ArgumentStyle>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolCapability {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolProfile {
    pub tool_id: &'static str,
    pub inputs: &'static [ToolInput],
    pub capabilities: &'static [ToolCapability],
}