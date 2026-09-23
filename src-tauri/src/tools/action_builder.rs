use crate::agent::context::AgentContext;
use crate::agent::models::AgentAction;

use super::action::{ToolAction, ToolActionInput};
use super::profiles;
use super::registry;

pub fn build_action(action: &AgentAction) -> Result<ToolAction, String> {
    build_action_with_context(action, None)
}

pub fn build_action_with_context(
    action: &AgentAction,
    context: Option<&AgentContext>,
) -> Result<ToolAction, String> {
    let profile = profiles::get_profile(&action.tool_id);

    let mut target = action.target.clone();
    let mut inputs = Vec::new();

    if let Some(profile) = profile {
        for input in &action.inputs {
            if input.name == "target" {
                if target.is_none() {
                    target = Some(input.value.clone());
                }
                continue;
            }

            let supported = profile
                .inputs
                .iter()
                .any(|known| known.id == input.name);

            if !supported {
                return Err(format!(
                    "Input '{}' is not supported by tool '{}'.",
                    input.name, action.tool_id
                ));
            }

            inputs.push(ToolActionInput {
                name: input.name.clone(),
                value: input.value.clone(),
            });
        }

        if profile
            .inputs
            .iter()
            .any(|input| input.id == "target" && input.required)
            && target
                .as_ref()
                .map(|value| value.trim().is_empty())
                .unwrap_or(true)
        {
            return Err(format!("Tool '{}' requires a target.", action.tool_id));
        }
    } else if let Some(context) = context {
        let tool_context = context
            .tools
            .iter()
            .find(|t| t.tool_id == action.tool_id)
            .ok_or_else(|| {
                format!("Cannot build action for unknown tool '{}'.", action.tool_id)
            })?;

        for input in &action.inputs {
            if input.name == "target" {
                if target.is_none() {
                    target = Some(input.value.clone());
                }
                continue;
            }

            let supported = tool_context
                .inputs
                .iter()
                .any(|known| known.name == input.name || known.flag.as_deref() == Some(&input.name));

            if !supported {
                return Err(format!(
                    "Input '{}' is not supported by tool '{}'.",
                    input.name, action.tool_id
                ));
            }

            inputs.push(ToolActionInput {
                name: input.name.clone(),
                value: input.value.clone(),
            });
        }
    } else {
        return Err(format!(
            "Cannot build action for unknown tool '{}'.",
            action.tool_id
        ));
    }

    Ok(ToolAction {
        tool_id: action.tool_id.clone(),
        target,
        inputs,
    })
}

pub fn build_arguments(action: &ToolAction) -> Result<Vec<String>, String> {
    build_arguments_with_context(action, None)
}

pub fn build_arguments_with_context(
    action: &ToolAction,
    context: Option<&AgentContext>,
) -> Result<Vec<String>, String> {
    let mut args = Vec::new();
    let profile = profiles::get_profile(&action.tool_id);

    if let Some(profile) = profile {
        for input in &action.inputs {
            let definition = profile
                .inputs
                .iter()
                .find(|known| known.id == input.name)
                .ok_or_else(|| {
                    format!(
                        "Input '{}' is not supported by tool '{}'.",
                        input.name, action.tool_id
                    )
                })?;

            if input.value.trim().is_empty() {
                continue;
            }

            match &definition.argument_style {
                Some(super::profile::ArgumentStyle::Flag(flag)) => {
                    if input.value.eq_ignore_ascii_case("true") {
                        args.push((*flag).to_string());
                    }
                }
                Some(super::profile::ArgumentStyle::Value(flag)) => {
                    args.push((*flag).to_string());
                    args.push(input.value.clone());
                }
                Some(super::profile::ArgumentStyle::FlagValue(flag)) => {
                    args.push((*flag).to_string());
                    args.push(input.value.clone());
                }
                None => {}
            }
        }
    } else if let Some(context) = context {
        let tool_context = context
            .tools
            .iter()
            .find(|t| t.tool_id == action.tool_id)
            .ok_or_else(|| {
                format!(
                    "Cannot build arguments for unknown tool '{}'.",
                    action.tool_id
                )
            })?;

        for input in &action.inputs {
            let input_def = tool_context
                .inputs
                .iter()
                .find(|known| known.name == input.name || known.flag.as_deref() == Some(&input.name))
                .ok_or_else(|| {
                    format!(
                        "Input '{}' is not supported by tool '{}'.",
                        input.name, action.tool_id
                    )
                })?;

            if input.value.trim().is_empty() {
                continue;
            }

            let flag = input_def
                .flag
                .clone()
                .unwrap_or_else(|| input.name.clone());

            if input.value.eq_ignore_ascii_case("true") {
                args.push(flag);
            } else if flag.contains('=') {
                let eq_pos = flag.find('=').unwrap();
                let flag_name = &flag[..eq_pos];
                args.push(format!("{}={}", flag_name, input.value));
            } else {
                args.push(flag);
                args.push(input.value.clone());
            }
        }
    } else {
        return Err(format!(
            "Cannot build arguments for unknown tool '{}'.",
            action.tool_id
        ));
    }

    if let Some(target) = &action.target {
        let registered_tool = registry::TOOLS
            .iter()
            .find(|tool| tool.id == action.tool_id);

        match registered_tool.map(|t| &t.target_strategy) {
            Some(registry::TargetStrategy::Flag(flag)) => {
                args.push(flag.to_string());
                args.push(target.clone());
            }
            _ => {
                args.push(target.clone());
            }
        }
    }

    Ok(args)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::context::AgentToolContext;
    use crate::tools::knowledge::DiscoveredInput;

    #[test]
    fn test_known_tool_action_and_arguments() {
        let action = AgentAction {
            action_id: "act-1".to_string(),
            tool_id: "nmap".to_string(),
            reason: "Scan target ports".to_string(),
            target: Some("127.0.0.1".to_string()),
            inputs: vec![
                crate::agent::models::AgentActionInput {
                    name: "ports".to_string(),
                    value: "80,443".to_string(),
                },
                crate::agent::models::AgentActionInput {
                    name: "service_detection".to_string(),
                    value: "true".to_string(),
                },
            ],
        };

        let tool_action = build_action(&action).expect("Should build action for Nmap");
        assert_eq!(tool_action.tool_id, "nmap");
        assert_eq!(tool_action.target.as_deref(), Some("127.0.0.1"));

        let args = build_arguments(&tool_action).expect("Should build arguments for Nmap");
        assert_eq!(args, vec!["-p", "80,443", "-sV", "127.0.0.1"]);
    }

    #[test]
    fn test_unknown_tool_action_and_arguments() {
        let context = AgentContext {
            tools: vec![AgentToolContext {
                tool_id: "synthfuzz".to_string(),
                name: "Synthetic Fuzzer".to_string(),
                version: Some("1.0".to_string()),
                capabilities: vec![],
                inputs: vec![
                    DiscoveredInput {
                        name: "-t".to_string(),
                        input_type: crate::tools::profile::InputType::Number,
                        required: false,
                        description: "Threads".to_string(),
                        flag: Some("-t".to_string()),
                    },
                    DiscoveredInput {
                        name: "--json".to_string(),
                        input_type: crate::tools::profile::InputType::Boolean,
                        required: false,
                        description: "JSON".to_string(),
                        flag: Some("--json".to_string()),
                    },
                ],
                raw_help: None,
            }],
        };

        let action = AgentAction {
            action_id: "act-2".to_string(),
            tool_id: "synthfuzz".to_string(),
            reason: "Fuzz target".to_string(),
            target: Some("http://127.0.0.1:8080".to_string()),
            inputs: vec![
                crate::agent::models::AgentActionInput {
                    name: "-t".to_string(),
                    value: "10".to_string(),
                },
                crate::agent::models::AgentActionInput {
                    name: "--json".to_string(),
                    value: "true".to_string(),
                },
            ],
        };

        let tool_action = build_action_with_context(&action, Some(&context))
            .expect("Should build action for synthfuzz");

        let args = build_arguments_with_context(&tool_action, Some(&context))
            .expect("Should build arguments for synthfuzz");

        assert_eq!(args, vec!["-t", "10", "--json", "http://127.0.0.1:8080"]);
    }

    #[test]
    fn test_unsupported_input_rejection() {
        let action = AgentAction {
            action_id: "act-3".to_string(),
            tool_id: "nmap".to_string(),
            reason: "Invalid".to_string(),
            target: Some("127.0.0.1".to_string()),
            inputs: vec![crate::agent::models::AgentActionInput {
                name: "random_shell_command".to_string(),
                value: "rm -rf /".to_string(),
            }],
        };

        let result = build_action(&action);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not supported by tool"));
    }
}