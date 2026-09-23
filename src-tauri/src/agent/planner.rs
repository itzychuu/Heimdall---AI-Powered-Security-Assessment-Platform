use serde_json::from_str;

use super::context::AgentContext;
use super::models::{AgentAction, AssessmentPlan, AssessmentRequest, AssessmentScope};

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

    let scope = AssessmentScope::new(&request.target.value);
    validate_plan_with_scope(&plan, context, &scope)?;

    Ok(plan)
}

fn validate_request(
    request: &AssessmentRequest,
) -> Result<(), String> {
    if request.target.value.trim().is_empty() {
        return Err("Assessment target cannot be empty.".to_string());
    }

    if request.objective.trim().is_empty() {
        return Err("Assessment objective cannot be empty.".to_string());
    }

    Ok(())
}

pub fn extract_json(response: &str) -> Result<&str, String> {
    let trimmed = response.trim();

    if trimmed.is_empty() {
        return Err("Agent returned an empty response.".to_string());
    }

    let text = if let Some(after_fence) = trimmed.strip_prefix("```") {
        let after_lang = after_fence
            .trim_start_matches("json")
            .trim_start_matches("JSON")
            .trim_start();
        if let Some(end_fence) = after_lang.rfind("```") {
            after_lang[..end_fence].trim()
        } else {
            after_lang.trim()
        }
    } else {
        trimmed
    };

    let start = text.find('{');
    let end = text.rfind('}');

    match (start, end) {
        (Some(start), Some(end)) if start < end => Ok(&text[start..=end]),
        _ => Err("Agent response did not contain a valid JSON object.".to_string()),
    }
}

pub fn validate_plan(
    plan: &AssessmentPlan,
    context: &AgentContext,
) -> Result<(), String> {
    let dummy_scope = AssessmentScope::new("");
    validate_plan_internal(plan, context, Some(&dummy_scope), false)
}

pub fn validate_plan_with_scope(
    plan: &AssessmentPlan,
    context: &AgentContext,
    scope: &AssessmentScope,
) -> Result<(), String> {
    validate_plan_internal(plan, context, Some(scope), true)
}

fn validate_plan_internal(
    plan: &AssessmentPlan,
    context: &AgentContext,
    scope: Option<&AssessmentScope>,
    check_scope: bool,
) -> Result<(), String> {
    if plan.objective.trim().is_empty() {
        return Err("Agent plan objective cannot be empty.".to_string());
    }

    for action in &plan.actions {
        validate_action_internal(action, context, scope, check_scope)?;
    }

    Ok(())
}

pub fn validate_action(
    action: &AgentAction,
    context: &AgentContext,
    scope: &AssessmentScope,
) -> Result<(), String> {
    validate_action_internal(action, context, Some(scope), true)
}

fn validate_action_internal(
    action: &AgentAction,
    context: &AgentContext,
    scope: Option<&AssessmentScope>,
    check_scope: bool,
) -> Result<(), String> {
    if action.action_id.trim().is_empty() {
        return Err("Agent action ID cannot be empty.".to_string());
    }

    if action.tool_id.trim().is_empty() {
        return Err("Agent action tool ID cannot be empty.".to_string());
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
        .find(|t| t.tool_id == action.tool_id)
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

        if check_scope {
            if let Some(scope) = scope {
                if !scope.allowed_target.is_empty() && !scope.is_target_allowed(target) {
                    return Err(format!(
                        "Agent action '{}' target '{}' is outside authorized assessment scope '{}'.",
                        action.action_id,
                        target,
                        scope.allowed_target
                    ));
                }
            }
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
            .any(|known_input| known_input.name == input.name || known_input.flag.as_deref() == Some(&input.name));

        if !supported {
            return Err(format!(
                "Agent action '{}' uses unsupported input '{}' for tool '{}'.",
                action.action_id,
                input.name,
                action.tool_id
            ));
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::context::AgentToolContext;
    use crate::agent::models::{AgentAction, AgentActionInput};
    use crate::tools::knowledge::DiscoveredInput;

    fn mock_context() -> AgentContext {
        AgentContext {
            tools: vec![AgentToolContext {
                tool_id: "nmap".to_string(),
                name: "Nmap".to_string(),
                version: Some("7.99".to_string()),
                capabilities: vec![],
                inputs: vec![
                    DiscoveredInput {
                        name: "target".to_string(),
                        input_type: crate::tools::profile::InputType::Target,
                        required: true,
                        description: "Target".to_string(),
                        flag: None,
                    },
                    DiscoveredInput {
                        name: "ports".to_string(),
                        input_type: crate::tools::profile::InputType::Ports,
                        required: false,
                        description: "Ports".to_string(),
                        flag: Some("-p".to_string()),
                    },
                ],
                raw_help: None,
            }],
        }
    }

    #[test]
    fn test_extract_json_plain() {
        let raw = r#"{"objective": "Scan target", "actions": []}"#;
        let json = extract_json(raw).expect("Should extract plain JSON");
        assert_eq!(json, raw);
    }

    #[test]
    fn test_extract_json_markdown_fence() {
        let raw = "Here is your plan:\n```json\n{\"objective\": \"Scan target\", \"actions\": []}\n```\nHope that helps!";
        let json = extract_json(raw).expect("Should extract JSON inside code fence");
        assert_eq!(json, r#"{"objective": "Scan target", "actions": []}"#);
    }

    #[test]
    fn test_extract_json_malformed_fails() {
        let raw = "No JSON here!";
        let res = extract_json(raw);
        assert!(res.is_err());
    }

    #[test]
    fn test_validate_plan_success() {
        let ctx = mock_context();
        let plan = AssessmentPlan {
            objective: "Port scan".to_string(),
            actions: vec![AgentAction {
                action_id: "a1".to_string(),
                tool_id: "nmap".to_string(),
                reason: "Recon".to_string(),
                target: Some("127.0.0.1".to_string()),
                inputs: vec![AgentActionInput {
                    name: "ports".to_string(),
                    value: "80,443".to_string(),
                }],
            }],
        };

        assert!(validate_plan(&plan, &ctx).is_ok());
    }

    #[test]
    fn test_validate_plan_unknown_tool_rejected() {
        let ctx = mock_context();
        let plan = AssessmentPlan {
            objective: "Exploit".to_string(),
            actions: vec![AgentAction {
                action_id: "a1".to_string(),
                tool_id: "metasploit".to_string(),
                reason: "Attack".to_string(),
                target: Some("127.0.0.1".to_string()),
                inputs: vec![],
            }],
        };

        let err = validate_plan(&plan, &ctx).unwrap_err();
        assert!(err.contains("unknown or unavailable tool"));
    }

    #[test]
    fn test_validate_plan_unsupported_input_rejected() {
        let ctx = mock_context();
        let plan = AssessmentPlan {
            objective: "Scan".to_string(),
            actions: vec![AgentAction {
                action_id: "a1".to_string(),
                tool_id: "nmap".to_string(),
                reason: "Recon".to_string(),
                target: Some("127.0.0.1".to_string()),
                inputs: vec![AgentActionInput {
                    name: "random_shell_command".to_string(),
                    value: "whoami".to_string(),
                }],
            }],
        };

        let err = validate_plan(&plan, &ctx).unwrap_err();
        assert!(err.contains("unsupported input"));
    }

    #[test]
    fn test_validate_plan_out_of_scope_target_rejected() {
        let ctx = mock_context();
        let scope = AssessmentScope::new("127.0.0.1");
        let plan = AssessmentPlan {
            objective: "Out of scope scan".to_string(),
            actions: vec![AgentAction {
                action_id: "a1".to_string(),
                tool_id: "nmap".to_string(),
                reason: "Recon".to_string(),
                target: Some("192.168.1.1".to_string()),
                inputs: vec![],
            }],
        };

        let err = validate_plan_with_scope(&plan, &ctx, &scope).unwrap_err();
        assert!(err.contains("outside authorized assessment scope"));
    }
}