use serde::{Deserialize, Serialize};

use crate::agent::context::AgentContext;
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

    let context =
        AgentContext::discover_installed_tools();

    let agent_prompt =
        build_agent_prompt(prompt, &context);

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
    context: &AgentContext,
) -> String {
    let tool_context =
        serde_json::to_string_pretty(context)
            .unwrap_or_else(|_| {
                "{\"tools\":[]}".to_string()
            });

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
2. tool_id MUST refer to a tool present in the Heimdall tool context.
3. reason must explain why the selected tool is appropriate.
4. target may contain the target supplied by the user.
5. inputs MUST use input names supported by the selected tool.
6. Do not invent tool capabilities.
7. Do not invent tool inputs.
8. Never invent shell commands.
9. Never return executable command strings.
10. Never assume authorization that was not supplied by Heimdall.
11. You are proposing actions only. Heimdall will validate them before execution.
12. If the request does not contain enough information for a safe assessment plan,
    return an empty actions array.
13. If no installed tool is appropriate, return an empty actions array.

Heimdall tool context:

{}

User assessment request:

{}
"#,
        tool_context,
        user_prompt
    )
}