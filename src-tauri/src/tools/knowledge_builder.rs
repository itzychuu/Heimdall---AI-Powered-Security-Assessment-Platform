use super::discovery::ToolDiscoveryResult;
use super::knowledge::{
    DiscoveredCapability,
    DiscoveredInput,
    ToolKnowledge,
};
use super::profiles;

pub fn build(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
) -> ToolKnowledge {
    if let Some(profile) =
        profiles::get_profile(tool_id)
    {
        return build_from_profile(
            tool_id,
            name,
            discovery,
            profile,
        );
    }

    build_from_discovery(
        tool_id,
        name,
        discovery,
    )
}

fn build_from_profile(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
    profile: &super::profile::ToolProfile,
) -> ToolKnowledge {
    let inputs = profile
        .inputs
        .iter()
        .map(|input| {
            let flag = match &input.argument_style {
                Some(
                    super::profile::ArgumentStyle::Flag(
                        flag,
                    ),
                ) => Some((*flag).to_string()),

                Some(
                    super::profile::ArgumentStyle::Value(
                        flag,
                    ),
                ) => Some((*flag).to_string()),

                Some(
                    super::profile::ArgumentStyle::FlagValue(
                        flag,
                    ),
                ) => Some((*flag).to_string()),

                None => None,
            };

            DiscoveredInput {
                name: input.id.to_string(),
                input_type: input.input_type.clone(),
                required: input.required,
                description: input.description.to_string(),
                flag,
            }
        })
        .collect();

    let capabilities = profile
        .capabilities
        .iter()
        .map(|capability| {
            DiscoveredCapability {
                name: capability.name.to_string(),
                description: capability.description.to_string(),
            }
        })
        .collect();

    ToolKnowledge {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable.clone(),
        version: discovery.version.clone(),
        capabilities,
        inputs,
        raw_help: discovery.help.clone(),
    }
}

fn build_from_discovery(
    tool_id: &str,
    name: &str,
    discovery: &ToolDiscoveryResult,
) -> ToolKnowledge {
    let mut capabilities = Vec::new();

    if discovery.help.is_some() {
        capabilities.push(
            DiscoveredCapability {
                name: "command-line-tool".to_string(),
                description:
                    "Command-line tool discovered through executable help information."
                        .to_string(),
            },
        );
    }

    ToolKnowledge {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable.clone(),
        version: discovery.version.clone(),
        capabilities,
        inputs: Vec::new(),
        raw_help: discovery.help.clone(),
    }
}