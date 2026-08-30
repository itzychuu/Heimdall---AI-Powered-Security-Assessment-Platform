use std::process::Command;

#[derive(Debug)]
pub struct ProcessOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

pub fn execute(
    executable: &str,
    args: &[String],
) -> Result<ProcessOutput, String> {
    let output = Command::new(executable)
        .args(args)
        .output()
        .map_err(|error| {
            format!(
                "Failed to start '{}': {}",
                executable, error
            )
        })?;

    Ok(ProcessOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}