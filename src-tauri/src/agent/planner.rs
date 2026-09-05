use serde_json::from_str;

use super::context::AgentContext;
use super::models::{AssessmentPlan, AssessmentRequest};

pub fn create_plan(
    request: &AssessmentRequest,
    agent_response: &str,
    context: &AgentContext,
) -> Result<AssessmentPlan, String> {
    validate_request(request)?;

    let response = extract_json(agent_response)?;

    let plan: AssessmentPlan = from_str(response)
        .map_err(|error| {
            format!("Failed to deserialize Agent plan: {}", error)
        })?;

    validate_plan(&plan, context)?;

    Ok(plan)
}

fn validate_request(
    request: &AssessmentRequest,
) -> Result<(), String> {
    if request.target.value.trim().is_empty() {
        return Err(
            "Assessment target cannot be empty.".to_string()
        );
    }

    if request.objective.trim().is_empty() {
        return Err(
            "Assessment objective cannot be empty.".to_string()
        );
    }

    Ok(())
}

fn extract_json(response: &str) -> Result<&str, String> {
    let trimmed = response.trim();

    if trimmed.is_empty() {
        return Err(
            "Agent returned an empty response.".to_string()
        );
    }

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        return Ok(trimmed);
    }

    let start = trimmed.find('{');
    let end = trimmed.rfind('}');

    match (start, end) {
        (Some(start), Some(end)) if start < end => {
            Ok(&trimmed[start..=end])
        }

        _ => Err(
            "Agent response did not contain a valid JSON object."
                .to_string()
        ),
    }
}

fn validate_plan(
    plan: &AssessmentPlan,
    context: &AgentContext,
) -> Result<(), String> {
    if plan.objective.trim().is_empty() {
        return Err(
            "Agent plan objective cannot be empty.".to_string()
        );
    }

    for action in &plan.actions {
        if action.action_id.trim().is_empty() {
            return Err(
                "Agent action ID cannot be empty.".to_string()
            );
        }

        if action.tool_id.trim().is_empty() {
            return Err(
                "Agent action tool ID cannot be empty.".to_string()
            );
        }

        if action.reason.trim().is_empty() {
            return Err(format!(
                "Agent action '{}' must include a reason.",
                action.action_id
            ));
        }

        let tool = context
            .tools
            .iter()
            .find(|tool| tool.tool_id == action.tool_id)
            .ok_or_else(|| {
                format!(
                    "Agent proposed unknown or unavailable tool '{}'.",
                    action.tool_id
                )
            })?;

        if let Some(target) = &action.target {
            if target.trim().is_empty() {
                return Err(format!(
                    "Agent action '{}' contains an empty target.",
                    action.action_id
                ));
            }
        }

        for input in &action.inputs {
            if input.name.trim().is_empty() {
                return Err(format!(
                    "Agent action '{}' contains an input with an empty name.",
                    action.action_id
                ));
            }

            let supported = tool
                .inputs
                .iter()
                .any(|known_input| known_input.name == input.name);

            if !supported {
                return Err(format!(
                    "Agent action '{}' uses unsupported input '{}' for tool '{}'.",
                    action.action_id,
                    input.name,
                    action.tool_id
                ));
            }
        }
    }

    Ok(())
}