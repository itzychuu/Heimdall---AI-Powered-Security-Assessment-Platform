use crate::agent::models::AgentAction;

use super::action::{ToolAction, ToolActionInput};
use super::profiles;
use super::registry;

pub fn build_action(
    action: &AgentAction,
) -> Result<ToolAction, String> {
    let profile = profiles::get_profile(&action.tool_id)
        .ok_or_else(|| {
            format!(
                "Cannot build action for unknown tool '{}'.",
                action.tool_id
            )
        })?;

    let mut target = action.target.clone();
    let mut inputs = Vec::new();

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
                input.name,
                action.tool_id
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
        return Err(format!(
            "Tool '{}' requires a target.",
            action.tool_id
        ));
    }

    Ok(ToolAction {
        tool_id: action.tool_id.clone(),
        target,
        inputs,
    })
}

pub fn build_arguments(
    action: &ToolAction,
) -> Result<Vec<String>, String> {
    let profile = profiles::get_profile(&action.tool_id)
        .ok_or_else(|| {
            format!(
                "Cannot build arguments for unknown tool '{}'.",
                action.tool_id
            )
        })?;

    let mut args = Vec::new();

    for input in &action.inputs {
        let definition = profile
            .inputs
            .iter()
            .find(|known| known.id == input.name)
            .ok_or_else(|| {
                format!(
                    "Input '{}' is not supported by tool '{}'.",
                    input.name,
                    action.tool_id
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

    if let Some(target) = &action.target {
        let tool = registry::TOOLS
            .iter()
            .find(|tool| tool.id == action.tool_id)
            .ok_or_else(|| {
                format!(
                    "Tool '{}' is not registered.",
                    action.tool_id
                )
            })?;

        match tool.target_strategy {
            registry::TargetStrategy::Append => {
                args.push(target.clone());
            }

            registry::TargetStrategy::Flag(flag) => {
                args.push(flag.to_string());
                args.push(target.clone());
            }
        }
    }

    Ok(args)
}