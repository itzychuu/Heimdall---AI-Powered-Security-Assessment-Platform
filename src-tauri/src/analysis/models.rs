use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ProjectFile {
    pub path: String,
    pub relative_path: String,
    pub extension: Option<String>,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProjectContext {
    pub root: String,
    pub files: Vec<ProjectFile>,
    pub languages: Vec<String>,
    pub frameworks: Vec<String>,
    pub manifests: Vec<String>,
    pub security_relevant_files: Vec<String>,
}