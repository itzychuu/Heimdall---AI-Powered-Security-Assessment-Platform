use std::time::Instant;

use crate::agent::context::AgentContext;
use crate::agent::models::{
    AssessmentActionResult, AssessmentObservation, AssessmentPlan, AssessmentRequest,
    AssessmentState, AssessmentStatus,
};
use crate::agent::planner;
use crate::agent::runtime::AgentRuntime;
use crate::process::executor;
use crate::tools::action_builder;

pub struct AssessmentLoopOptions {
    pub ollama_url: String,
    pub model: String,
    pub max_iterations: usize,
}

impl Default for AssessmentLoopOptions {
    fn default() -> Self {
        Self {
            ollama_url: "http://127.0.0.1:11434".to_string(),
            model: "qwen3:4b-instruct".to_string(),
            max_iterations: 5,
        }
    }
}

pub struct AssessmentLoop {
    runtime: AgentRuntime,
    context: AgentContext,
    options: AssessmentLoopOptions,
}

impl AssessmentLoop {
    pub fn new(options: AssessmentLoopOptions) -> Self {
        let runtime = AgentRuntime::new(&options.ollama_url, &options.model);
        let context = AgentContext::discover_installed_tools();
        Self {
            runtime,
            context,
            options,
        }
    }

    pub fn with_context(options: AssessmentLoopOptions, context: AgentContext) -> Self {
        let runtime = AgentRuntime::new(&options.ollama_url, &options.model);
        Self {
            runtime,
            context,
            options,
        }
    }

    pub async fn run_loop(
        &self,
        request: AssessmentRequest,
    ) -> Result<AssessmentState, String> {
        let mut state = AssessmentState::new(
            format!("assess-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis()),
            request,
            self.options.max_iterations,
        );

        state.available_tools = self.context.tools.iter().map(|t| t.tool_id.clone()).collect();
        state.status = AssessmentStatus::Planning;

        loop {
            if state.iteration >= state.max_iterations {
                state.status = AssessmentStatus::Stopped;
                state.termination_reason = Some(format!(
                    "Reached maximum allowed iterations limit ({}).",
                    state.max_iterations
                ));
                break;
            }

            state.iteration += 1;
            state.status = AssessmentStatus::Planning;

            let prompt = build_loop_prompt(&state, &self.context);
            let response = match self.runtime.reason(&prompt).await {
                Ok(res) => res,
                Err(err) => {
                    state.status = AssessmentStatus::Failed;
                    state.termination_reason = Some(format!("LLM reasoning failed: {}", err));
                    break;
                }
            };

            let plan: AssessmentPlan = match planner::create_plan(
                &AssessmentRequest {
                    target: state.target.clone(),
                    objective: state.objective.clone(),
                },
                &response,
                &self.context,
            ) {
                Ok(plan) => plan,
                Err(err) => {
                    state.status = AssessmentStatus::Failed;
                    state.termination_reason = Some(format!("Plan creation or validation failed: {}", err));
                    break;
                }
            };

            if plan.actions.is_empty() {
                state.status = AssessmentStatus::Completed;
                state.termination_reason = Some("AI determined objective is completed (no further actions proposed).".to_string());
                break;
            }

            let next_action = &plan.actions[0];
            state.current_action = Some(next_action.clone());
            state.status = AssessmentStatus::ActionProposed;

            state.status = AssessmentStatus::Validating;
            if let Err(err) = planner::validate_action(next_action, &self.context, &state.scope) {
                state.status = AssessmentStatus::Failed;
                state.termination_reason = Some(format!("Action validation failed: {}", err));
                break;
            }

            let tool_action = match action_builder::build_action_with_context(next_action, Some(&self.context)) {
                Ok(act) => act,
                Err(err) => {
                    state.status = AssessmentStatus::Failed;
                    state.termination_reason = Some(format!("Tool action build failed: {}", err));
                    break;
                }
            };

            let args = match action_builder::build_arguments_with_context(&tool_action, Some(&self.context)) {
                Ok(a) => a,
                Err(err) => {
                    state.status = AssessmentStatus::Failed;
                    state.termination_reason = Some(format!("Argument build failed: {}", err));
                    break;
                }
            };

            state.status = AssessmentStatus::Executing;
            let start_time = Instant::now();
            let exec_result = executor::execute(&tool_action.tool_id, &args);
            let duration = start_time.elapsed().as_millis();

            let action_result = match exec_result {
                Ok(res) => AssessmentActionResult {
                    action_id: next_action.action_id.clone(),
                    tool_id: next_action.tool_id.clone(),
                    target: next_action.target.clone(),
                    arguments: args,
                    stdout: res.stdout,
                    stderr: res.stderr,
                    exit_code: res.exit_code,
                    duration_ms: duration,
                    success: res.exit_code == Some(0),
                },
                Err(err) => AssessmentActionResult {
                    action_id: next_action.action_id.clone(),
                    tool_id: next_action.tool_id.clone(),
                    target: next_action.target.clone(),
                    arguments: args,
                    stdout: String::new(),
                    stderr: err,
                    exit_code: None,
                    duration_ms: duration,
                    success: false,
                },
            };

            state.actions.push(next_action.clone());
            state.results.push(action_result.clone());

            state.status = AssessmentStatus::Analyzing;
            let observation = analyze_result(&action_result);
            state.observations.push(observation);

            state.status = AssessmentStatus::Continuing;
        }

        Ok(state)
    }
}

pub fn analyze_result(result: &AssessmentActionResult) -> AssessmentObservation {
    let mut summary = format!(
        "Tool '{}' exited with code {:?}.",
        result.tool_id, result.exit_code
    );

    if !result.stdout.is_empty() {
        let lines: Vec<&str> = result.stdout.lines().take(5).collect();
        summary.push_str(&format!(" Output snippet: {}", lines.join(" | ")));
    } else if !result.stderr.is_empty() {
        let lines: Vec<&str> = result.stderr.lines().take(5).collect();
        summary.push_str(&format!(" Error snippet: {}", lines.join(" | ")));
    }

    AssessmentObservation {
        source_action_id: result.action_id.clone(),
        summary,
    }
}

fn build_loop_prompt(state: &AssessmentState, context: &AgentContext) -> String {
    let tool_context = serde_json::to_string_pretty(context).unwrap_or_else(|_| "{\"tools\":[]}".to_string());
    let observations = serde_json::to_string_pretty(&state.observations).unwrap_or_else(|_| "[]".to_string());

    format!(
        r#"
You are the autonomous adaptive planner component of Heimdall, an authorized security platform.

ASSESSMENT GOAL:
Objective: {}
Authorized Target: {}
Iteration: {} of {}

AUTHORIZED SCOPE:
Target: {} (Do NOT propose actions against any other IP, domain, or host)

AVAILABLE TOOL KNOWLEDGE:
{}

PREVIOUS OBSERVATIONS & EVIDENCE:
{}

INSTRUCTIONS:
1. Reason step-by-step from the available tool knowledge and previous observations.
2. If the assessment objective is satisfied or no further tools are needed, return an empty actions array: "actions": [].
3. Propose AT MOST ONE next action in the "actions" array.
4. Target MUST strictly match the authorized target.
5. You MUST return ONLY valid JSON matching the exact schema below.

JSON Schema:
{{
  "objective": "string",
  "actions": [
    {{
      "action_id": "string",
      "tool_id": "string",
      "reason": "string",
      "target": "string or null",
      "inputs": [
        {{
          "name": "string",
          "value": "string"
        }}
      ]
    }}
  ]
}}
"#,
        state.objective,
        state.scope.allowed_target,
        state.iteration,
        state.max_iterations,
        state.scope.allowed_target,
        tool_context,
        observations
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::context::AgentToolContext;
    use crate::agent::models::{AssessmentTarget, AssessmentTargetType};
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
    fn test_assessment_loop_state_initialization() {
        let request = AssessmentRequest {
            target: AssessmentTarget {
                target_type: AssessmentTargetType::Network,
                value: "127.0.0.1".to_string(),
            },
            objective: "Scan ports 80,443".to_string(),
        };

        let state = AssessmentState::new("test-loop-1", request, 5);
        assert_eq!(state.status, AssessmentStatus::Created);
        assert_eq!(state.scope.allowed_target, "127.0.0.1");
        assert_eq!(state.max_iterations, 5);
        assert!(state.can_continue());
    }

    #[test]
    fn test_assessment_loop_with_mock_context() {
        let ctx = mock_context();
        let loop_runner = AssessmentLoop::with_context(
            AssessmentLoopOptions {
                ollama_url: "http://127.0.0.1:11434".to_string(),
                model: "qwen3:4b-instruct".to_string(),
                max_iterations: 3,
            },
            ctx,
        );

        assert_eq!(loop_runner.context.tools.len(), 1);
        assert_eq!(loop_runner.context.tools[0].tool_id, "nmap");
    }

    #[test]
    fn test_assessment_scope_rejection() {
        let scope = crate::agent::models::AssessmentScope::new("127.0.0.1");
        assert!(scope.is_target_allowed("127.0.0.1"));
        assert!(!scope.is_target_allowed("192.168.1.100"));
        assert!(!scope.is_target_allowed("google.com"));
    }

    #[test]
    fn test_analyze_result_creates_observation() {
        let res = AssessmentActionResult {
            action_id: "act-1".to_string(),
            tool_id: "nmap".to_string(),
            target: Some("127.0.0.1".to_string()),
            arguments: vec!["-p".to_string(), "80".to_string(), "127.0.0.1".to_string()],
            stdout: "PORT 80/tcp open http".to_string(),
            stderr: String::new(),
            exit_code: Some(0),
            duration_ms: 120,
            success: true,
        };

        let obs = analyze_result(&res);
        assert_eq!(obs.source_action_id, "act-1");
        assert!(obs.summary.contains("PORT 80/tcp open http"));
    }

    #[test]
    fn test_action_limit_enforcement() {
        let request = AssessmentRequest {
            target: AssessmentTarget {
                target_type: AssessmentTargetType::Network,
                value: "127.0.0.1".to_string(),
            },
            objective: "Test limit".to_string(),
        };

        let mut state = AssessmentState::new("test-limit", request, 2);
        state.iteration = 2; // Simulated reaching max_iterations
        if state.iteration >= state.max_iterations {
            state.status = AssessmentStatus::Stopped;
            state.termination_reason = Some("Reached maximum allowed iterations limit (2).".to_string());
        }

        assert_eq!(state.status, AssessmentStatus::Stopped);
        assert_eq!(
            state.termination_reason.as_deref(),
            Some("Reached maximum allowed iterations limit (2).")
        );
        assert!(!state.can_continue());
    }

    #[test]
    fn test_execution_failure_captured_properly() {
        let res = AssessmentActionResult {
            action_id: "act-failed".to_string(),
            tool_id: "non_existent_tool".to_string(),
            target: Some("127.0.0.1".to_string()),
            arguments: vec![],
            stdout: String::new(),
            stderr: "Failed to start executable: System cannot find file specified".to_string(),
            exit_code: None,
            duration_ms: 15,
            success: false,
        };

        assert!(!res.success);
        assert!(res.exit_code.is_none());
        assert!(res.stderr.contains("Failed to start executable"));

        let obs = analyze_result(&res);
        assert_eq!(obs.source_action_id, "act-failed");
        assert!(obs.summary.contains("exited with code None"));
        assert!(obs.summary.contains("Error snippet:"));
    }

    #[test]
    fn test_raw_result_preservation() {
        let res = AssessmentActionResult {
            action_id: "act-raw".to_string(),
            tool_id: "nmap".to_string(),
            target: Some("127.0.0.1".to_string()),
            arguments: vec!["-Pn".to_string(), "127.0.0.1".to_string()],
            stdout: "Nmap scan report for localhost (127.0.0.1)\nHost is up (0.00010s latency).".to_string(),
            stderr: "Warning: File nmap-services was not found".to_string(),
            exit_code: Some(0),
            duration_ms: 350,
            success: true,
        };

        let obs = analyze_result(&res);

        // Assert that raw output remains completely intact on res after observation extraction
        assert_eq!(res.action_id, "act-raw");
        assert_eq!(res.tool_id, "nmap");
        assert_eq!(res.arguments, vec!["-Pn", "127.0.0.1"]);
        assert!(res.stdout.contains("Host is up"));
        assert!(res.stderr.contains("nmap-services"));
        assert_eq!(res.exit_code, Some(0));
        assert_eq!(res.duration_ms, 350);
        assert!(res.success);

        // Observation summary is derived without altering res
        assert_eq!(obs.source_action_id, "act-raw");
        assert!(obs.summary.contains("Host is up"));
    }
}
