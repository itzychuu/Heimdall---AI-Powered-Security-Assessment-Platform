use serde::{Deserialize, Serialize};

use crate::agent::context::AgentContext;
use crate::agent::loop_runner::{AssessmentLoop, AssessmentLoopOptions};
use crate::agent::models::{
    AgentAction,
    AgentActionInput,
    AssessmentPlan,
    AssessmentRequest,
    AssessmentState,
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
use crate::scans::store;

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

#[derive(Debug, Clone, Deserialize)]
pub struct RunAssessmentLoopRequest {
    pub target: String,
    pub objective: String,
    pub max_iterations: Option<usize>,
}

#[tauri::command]
pub async fn run_assessment_loop(
    request: RunAssessmentLoopRequest,
) -> Result<AssessmentState, String> {
    if request.target.trim().is_empty() {
        return Err("Assessment target cannot be empty.".to_string());
    }

    if request.objective.trim().is_empty() {
        return Err("Assessment objective cannot be empty.".to_string());
    }

    let loop_options = AssessmentLoopOptions {
        ollama_url: "http://127.0.0.1:11434".to_string(),
        model: "qwen3:4b-instruct".to_string(),
        max_iterations: request.max_iterations.unwrap_or(5),
    };

    let assessment_loop = AssessmentLoop::new(loop_options);

    let assessment_req = AssessmentRequest {
        target: AssessmentTarget {
            target_type: AssessmentTargetType::Custom,
            value: request.target.trim().to_string(),
        },
        objective: request.objective.trim().to_string(),
    };

    assessment_loop.run_loop(assessment_req).await
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
        .map(|action| action_builder::build_action_with_context(action, Some(&context)))
        .collect::<Result<Vec<_>, _>>()?;

    let action_arguments = actions
        .iter()
        .map(|action| action_builder::build_arguments_with_context(action, Some(&context)))
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
    app: tauri::AppHandle,
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
    let context = AgentContext::discover_installed_tools();

    let rebuilt_action = action_builder::build_action_with_context(
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
        Some(&context),
    )?;

    let arguments =
        action_builder::build_arguments_with_context(
            &rebuilt_action,
            Some(&context),
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

    store::save_scan(&app, &result)?;

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

STRICT RULES:
1. Reason ONLY from the supplied Heimdall tool context. Do NOT invent tools, input names, or capabilities.
2. OBJECTIVE ADHERENCE: Adhere strictly to the requested objective scope. Do NOT add unrequested scan types (such as OS detection, scripts, or intrusive probes) unless explicitly requested in the objective.
3. You MUST return ONLY valid JSON matching the exact schema below.
4. Do NOT return Markdown code fences or explanations outside the JSON object.
5. Never return executable command strings (e.g. "nmap -p 80 target"). Return ONLY structured actions.
6. tool_id MUST refer to a tool present in the Heimdall tool context.
7. inputs MUST use input names (or flag names) present in the selected tool's input list.

Schema:

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