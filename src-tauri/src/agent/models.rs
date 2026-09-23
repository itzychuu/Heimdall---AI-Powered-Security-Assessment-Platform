use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AssessmentTarget {
    pub target_type: AssessmentTargetType,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AssessmentRequest {
    pub target: AssessmentTarget,
    pub objective: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AssessmentPlan {
    pub objective: String,
    pub actions: Vec<AgentAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AgentAction {
    pub action_id: String,
    pub tool_id: String,
    pub reason: String,
    pub target: Option<String>,
    pub inputs: Vec<AgentActionInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AgentActionInput {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AssessmentStatus {
    Created,
    Planning,
    ActionProposed,
    Validating,
    Executing,
    Analyzing,
    Continuing,
    Completed,
    Failed,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentActionResult {
    pub action_id: String,
    pub tool_id: String,
    pub target: Option<String>,
    pub arguments: Vec<String>,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub duration_ms: u128,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentObservation {
    pub source_action_id: String,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentScope {
    pub allowed_target: String,
    pub allowed_subnets: Vec<String>,
    pub allowed_ports: Vec<u16>,
}

impl AssessmentScope {
    pub fn new(allowed_target: impl Into<String>) -> Self {
        Self {
            allowed_target: allowed_target.into(),
            allowed_subnets: Vec::new(),
            allowed_ports: Vec::new(),
        }
    }

    pub fn is_target_allowed(&self, target: &str) -> bool {
        let target = target.trim();
        if target.is_empty() {
            return false;
        }

        if target.eq_ignore_ascii_case(&self.allowed_target) {
            return true;
        }

        // Handle URL prefix matching if allowed_target is a URL or domain
        if self.allowed_target.starts_with("http://") || self.allowed_target.starts_with("https://") {
            if target.starts_with(&self.allowed_target) {
                return true;
            }
        }

        false
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentState {
    pub assessment_id: String,
    pub objective: String,
    pub target: AssessmentTarget,
    pub scope: AssessmentScope,
    pub status: AssessmentStatus,
    pub available_tools: Vec<String>,
    pub actions: Vec<AgentAction>,
    pub results: Vec<AssessmentActionResult>,
    pub observations: Vec<AssessmentObservation>,
    pub iteration: usize,
    pub max_iterations: usize,
    pub current_action: Option<AgentAction>,
    pub termination_reason: Option<String>,
}

impl AssessmentState {
    pub fn new(
        assessment_id: impl Into<String>,
        request: AssessmentRequest,
        max_iterations: usize,
    ) -> Self {
        let allowed = request.target.value.clone();
        Self {
            assessment_id: assessment_id.into(),
            objective: request.objective,
            target: request.target,
            scope: AssessmentScope::new(allowed),
            status: AssessmentStatus::Created,
            available_tools: Vec::new(),
            actions: Vec::new(),
            results: Vec::new(),
            observations: Vec::new(),
            iteration: 0,
            max_iterations,
            current_action: None,
            termination_reason: None,
        }
    }

    pub fn can_continue(&self) -> bool {
        if matches!(
            self.status,
            AssessmentStatus::Completed | AssessmentStatus::Failed | AssessmentStatus::Stopped
        ) {
            return false;
        }
        self.iteration < self.max_iterations
    }
}