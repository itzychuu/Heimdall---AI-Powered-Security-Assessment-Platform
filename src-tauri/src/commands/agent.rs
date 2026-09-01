use serde::{Deserialize, Serialize};

use crate::agent::runtime::AgentRuntime;

#[derive(Debug, Clone, Deserialize)]
pub struct AgentReasonRequest {
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentReasonResponse {
    pub model: String,
    pub response: String,
}

#[tauri::command]
pub async fn agent_reason(
    request: AgentReasonRequest,
) -> Result<AgentReasonResponse, String> {
    let prompt = request.prompt.trim();

    if prompt.is_empty() {
        return Err(
            "Agent prompt cannot be empty."
                .to_string(),
        );
    }

    let runtime = AgentRuntime::new(
        "http://127.0.0.1:11434",
        "qwen3:4b-instruct",
    );

    let response = runtime
        .reason(prompt)
        .await?;

    Ok(AgentReasonResponse {
        model: runtime.model().to_string(),
        response,
    })
}