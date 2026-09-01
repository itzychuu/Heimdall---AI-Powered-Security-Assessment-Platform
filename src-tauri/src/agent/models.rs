use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssessmentTargetType {
    WebApplication,
    Api,
    Network,
    SourceCode,
    ProjectDirectory,
    GitRepository,
    Container,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentTarget {
    pub target_type: AssessmentTargetType,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentRequest {
    pub target: AssessmentTarget,
    pub objective: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentPlan {
    pub objective: String,
    pub actions: Vec<AgentAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentAction {
    pub action_id: String,
    pub tool_id: String,
    pub reason: String,
    pub target: Option<String>,
    pub inputs: Vec<AgentActionInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentActionInput {
    pub name: String,
    pub value: String,
}