use serde::{Deserialize, Serialize};

use crate::agent::models::{
    AssessmentPlan,
    AssessmentRequest,
    AssessmentTarget,
    AssessmentTargetType,
};
use crate::agent::planner;
use crate::agent::runtime::AgentRuntime;

#[derive(Debug, Clone, Deserialize)]
pub struct AgentReasonRequest {
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentReasonResponse {
    pub model: String,
    pub response: String,
    pub plan: Option<AssessmentPlan>,
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

    let agent_prompt = build_agent_prompt(prompt);

    let response = runtime
        .reason(&agent_prompt)
        .await?;

    let assessment_request = AssessmentRequest {
        target: AssessmentTarget {
            target_type: AssessmentTargetType::Custom,
            value: "user-supplied-target".to_string(),
        },
        objective: prompt.to_string(),
    };

    let plan = planner::create_plan(
        &assessment_request,
        &response,
    )?;

    Ok(AgentReasonResponse {
        model: runtime.model().to_string(),
        response,
        plan: Some(plan),
    })
}

fn build_agent_prompt(
    user_prompt: &str,
) -> String {
    format!(
        r#"
You are the planning component of Heimdall,
an authorized security assessment platform.

Your job is to create a structured assessment plan.

You MUST return ONLY valid JSON.

Do not return Markdown.
Do not return code fences.
Do not return explanations outside the JSON object.

The JSON must follow this exact structure:

{{
  "objective": "string",
  "actions": [
    {{
      "action_id": "string",
      "tool_id": "string",
      "reason": "string",
      "target": "string or null",
      "inputs": [
        {{
          "name": "string",
          "value": "string"
        }}
      ]
    }}
  ]
}}

Rules:

1. action_id must uniquely identify the action.
2. tool_id must contain the identifier of a security tool.
3. reason must explain why the tool is appropriate.
4. target may contain the target supplied by the user.
5. inputs contain tool-specific parameters.
6. Never invent shell commands.
7. Never return executable command strings.
8. Never assume authorization that was not supplied by Heimdall.
9. You are proposing actions only. Heimdall will validate them before execution.
10. If the request does not contain enough information for a safe assessment plan,
    return an empty actions array.

User assessment request:

{}
"#,
        user_prompt
    )
}