use serde::Serialize;

use super::discovery::ToolDiscoveryResult;
use super::profile::ToolProfile;
use super::profiles;

#[derive(Debug, Clone, Serialize)]
pub struct ToolIntelligence {
    pub tool_id: String,
    pub name: String,
    pub executable: String,
    pub version: Option<String>,
    pub help: Option<String>,
    pub known_profile: bool,
}

impl ToolIntelligence {
    pub fn has_discovery_data(&self) -> bool {
        self.version.is_some() || self.help.is_some()
    }

    pub fn discovery_summary(&self) -> String {
        let mut summary = String::new();

        if let Some(version) = &self.version {
            summary.push_str("VERSION:\n");
            summary.push_str(version);
            summary.push_str("\n\n");
        }

        if let Some(help) = &self.help {
            summary.push_str("HELP:\n");
            summary.push_str(help);
        }

        summary
    }
}

pub fn build(
    tool_id: &str,
    name: &str,
    discovery: ToolDiscoveryResult,
) -> ToolIntelligence {
    ToolIntelligence {
        tool_id: tool_id.to_string(),
        name: name.to_string(),
        executable: discovery.executable,
        version: discovery.version,
        help: discovery.help,
        known_profile: profiles::get_profile(tool_id).is_some(),
    }
}

pub fn get_known_profile(
    tool_id: &str,
) -> Option<&'static ToolProfile> {
    profiles::get_profile(tool_id)
}