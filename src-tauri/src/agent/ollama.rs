use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct OllamaClient {
    base_url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct OllamaRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
    pub format: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct OllamaResponse {
    pub response: String,
}

impl OllamaClient {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
        }
    }

    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<String, String> {
        let client = reqwest::Client::new();

        let request = OllamaRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
            format: "json".to_string(),
        };

        let url = format!(
            "{}/api/generate",
            self.base_url.trim_end_matches('/')
        );

        let response = client
            .post(url)
            .json(&request)
            .send()
            .await
            .map_err(|error| {
                format!(
                    "Failed to connect to Ollama: {}",
                    error
                )
            })?;

        if !response.status().is_success() {
            return Err(format!(
                "Ollama returned HTTP status {}.",
                response.status()
            ));
        }

        let result =
            response
                .json::<OllamaResponse>()
                .await
                .map_err(|error| {
                    format!(
                        "Failed to parse Ollama response: {}",
                        error
                    )
                })?;

        Ok(result.response)
    }
}