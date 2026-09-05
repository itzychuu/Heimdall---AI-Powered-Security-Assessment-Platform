use serde::Serialize;

use crate::tools::detector;
use crate::tools::knowledge::{
    DiscoveredCapability,
    DiscoveredInput,
    ToolKnowledge,
};
use crate::tools::knowledge_builder;
use crate::tools::registry;

#[derive(Debug, Clone, Serialize)]
pub struct AgentToolContext {
    pub tool_id: String,
    pub name: String,
    pub version: Option<String>,
    pub capabilities: Vec<DiscoveredCapability>,
    pub inputs: Vec<DiscoveredInput>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AgentContext {
    pub tools: Vec<AgentToolContext>,
}

impl AgentContext {
    pub fn from_tool_knowledge(
        knowledge: Vec<ToolKnowledge>,
    ) -> Self {
        let tools = knowledge
            .into_iter()
            .map(|tool| AgentToolContext {
                tool_id: tool.tool_id,
                name: tool.name,
                version: tool.version,
                capabilities: tool.capabilities,
                inputs: tool.inputs,
            })
            .collect();

        Self { tools }
    }

    pub fn discover_installed_tools() -> Self {
        let mut knowledge = Vec::new();

        for tool in registry::TOOLS {
            let detected = detector::detect(tool);

            if !detected.installed {
                continue;
            }

            let executable = match detected.executable {
                Some(executable) => executable,
                None => continue,
            };

            let discovery =
                match crate::tools::discovery::discover(
                    &executable,
                ) {
                    Ok(discovery) => discovery,
                    Err(_) => continue,
                };

            let tool_knowledge =
                knowledge_builder::build(
                    tool.id,
                    tool.name,
                    &discovery,
                );

            knowledge.push(tool_knowledge);
        }

        Self::from_tool_knowledge(knowledge)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_context_from_tool_knowledge() {
        let knowledge = ToolKnowledge {
            tool_id: "test-tool".to_string(),
            name: "Test Tool".to_string(),
            executable: "test-tool".to_string(),
            version: Some("1.0".to_string()),
            capabilities: vec![
                DiscoveredCapability {
                    name: "test-capability".to_string(),
                    description: "Test capability.".to_string(),
                },
            ],
            inputs: vec![
                DiscoveredInput {
                    name: "target".to_string(),
                    input_type: crate::tools::profile::InputType::Target,
                    required: true,
                    description: "Test target.".to_string(),
                },
            ],
        };

        let context =
            AgentContext::from_tool_knowledge(
                vec![knowledge],
            );

        assert_eq!(context.tools.len(), 1);
        assert_eq!(
            context.tools[0].tool_id,
            "test-tool"
        );
        assert_eq!(
            context.tools[0].name,
            "Test Tool"
        );
        assert_eq!(
            context.tools[0].capabilities.len(),
            1
        );
        assert_eq!(
            context.tools[0].inputs.len(),
            1
        );
    }
}