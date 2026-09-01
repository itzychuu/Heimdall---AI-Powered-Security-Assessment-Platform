use super::ollama::OllamaClient;

#[derive(Debug, Clone)]
pub struct AgentRuntime {
    ollama: OllamaClient,
    model: String,
}

impl AgentRuntime {
    pub fn new(
        ollama_url: impl Into<String>,
        model: impl Into<String>,
    ) -> Self {
        Self {
            ollama: OllamaClient::new(ollama_url),
            model: model.into(),
        }
    }

    pub async fn reason(
        &self,
        prompt: &str,
    ) -> Result<String, String> {
        self.ollama
            .generate(
                &self.model,
                prompt,
            )
            .await
    }

    pub fn model(&self) -> &str {
        &self.model
    }
}