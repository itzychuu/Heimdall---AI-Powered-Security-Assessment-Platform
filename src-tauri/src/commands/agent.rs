use serde::{Deserialize, Serialize};

use crate::agent::context::AgentContext;
use crate::agent::models::{
    AgentAction,
    AgentActionInput,
    AssessmentPlan,
    AssessmentRequest,
    AssessmentTarget,
    AssessmentTargetType,
};
use crate::agent::planner;
use crate::agent::runtime::AgentRuntime;

use crate::scans::models::{
    ScanConfig,
    ScanResult,
    ScanType,
};
use crate::scans::runner;

use crate::tools::action_builder;
use crate::tools::action::ToolAction;

#[derive(Debug, Clone, Deserialize)]
pub struct AgentReasonRequest {
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentReasonResponse {
    pub model: String,
    pub response: String,
    pub plan: Option<AssessmentPlan>,
    pub action_arguments: Vec<Vec<String>>,
    pub actions: Vec<ToolAction>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AgentExecuteRequest {
    pub action: ToolAction,
    pub name: String,
    pub project: String,
}

#[tauri::command]
pub async fn agent_reason(
    request: AgentReasonRequest,
) -> Result<AgentReasonResponse, String> {
    let prompt = request.prompt.trim();

    if prompt.is_empty() {
        return Err(
            "Agent prompt cannot be empty.".to_string()
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
        &context,
    )?;

    let actions = plan
        .actions
        .iter()
        .map(action_builder::build_action)
        .collect::<Result<Vec<_>, _>>()?;

    let action_arguments = actions
        .iter()
        .map(action_builder::build_arguments)
        .collect::<Result<Vec<_>, _>>()?;

    Ok(AgentReasonResponse {
        model: runtime.model().to_string(),
        response,
        plan: Some(plan),
        action_arguments,
        actions,
    })
}

#[tauri::command]
pub async fn agent_execute(
    request: AgentExecuteRequest,
) -> Result<ScanResult, String> {
    if request.name.trim().is_empty() {
        return Err(
            "Assessment name cannot be empty.".to_string()
        );
    }

    if request.project.trim().is_empty() {
        return Err(
            "Assessment project cannot be empty.".to_string()
        );
    }

    let action = request.action;

    let rebuilt_action = action_builder::build_action(
        &AgentAction {
            action_id: "approved-action".to_string(),
            tool_id: action.tool_id.clone(),
            reason: "Approved by user.".to_string(),
            target: action.target.clone(),
            inputs: action
                .inputs
                .iter()
                .map(|input| AgentActionInput {
                    name: input.name.clone(),
                    value: input.value.clone(),
                })
                .collect(),
        },
    )?;

    let arguments =
        action_builder::build_arguments(
            &rebuilt_action,
        )?;

    let target = rebuilt_action
        .target
        .clone()
        .ok_or_else(|| {
            "Approved action requires a target.".to_string()
        })?;

    let target_type =
        infer_scan_type(&rebuilt_action.tool_id);

    let scan_options = arguments
        .into_iter()
        .filter(|argument| argument != &target)
        .collect::<Vec<_>>();

    let config = ScanConfig {
        name: request.name,
        target,
        target_type,
        project: request.project,
        tool_id: rebuilt_action.tool_id,
        scan_options,
    };

    let result =
        tauri::async_runtime::spawn_blocking(
            move || runner::run(&config),
        )
        .await
        .map_err(|error| {
            format!(
                "Agent execution task failed: {}",
                error
            )
        })??;

    Ok(result)
}

fn infer_scan_type(
    tool_id: &str,
) -> ScanType {
    match tool_id {
        "nmap" => ScanType::Network,

        "ffuf" => ScanType::WebApplication,

        "nikto" => ScanType::WebApplication,

        "nuclei" => ScanType::WebApplication,

        _ => ScanType::Network,
    }
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