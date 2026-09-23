use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ParsedCliOption {
    pub flag: String,
    pub value_hint: Option<String>,
    pub requires_value: bool,
    pub description: String,
}

pub fn parse_help(help: &str) -> Vec<ParsedCliOption> {
    let mut options = Vec::new();
    let mut current: Option<ParsedCliOption> = None;

    for line in help.lines() {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            if let Some(previous) = current.take() {
                options.push(previous);
            }
            continue;
        }

        if let Some(option) = parse_option_line(line) {
            if let Some(previous) = current.take() {
                options.push(previous);
            }

            current = Some(option);
            continue;
        }

        if is_section_heading(line) {
            if let Some(previous) = current.take() {
                options.push(previous);
            }
            continue;
        }

        if let Some(option) = current.as_mut() {
            let description = trimmed;

            if !description.is_empty() {
                if !option.description.is_empty() {
                    option.description.push(' ');
                }

                option.description.push_str(description);
            }
        }
    }

    if let Some(option) = current {
        options.push(option);
    }

    options
}

fn is_section_heading(line: &str) -> bool {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return true;
    }

    // Option lines start with '-'
    if trimmed.starts_with('-') {
        return false;
    }

    let indentation = line.len() - line.trim_start().len();

    // Lines with 0 indentation that don't start with '-' are section headers or top-level text
    if indentation == 0 {
        return true;
    }

    // Lines ending with ':' that look like section titles (e.g. "Options:", "SCAN TECHNIQUES:")
    if trimmed.ends_with(':') && !trimmed.contains('=') {
        return true;
    }

    // Upper-case section titles (e.g. "HOST DISCOVERY")
    if trimmed.len() > 3
        && trimmed
            .chars()
            .all(|c| c.is_ascii_uppercase() || c.is_whitespace() || c == '/' || c == '-' || c == '&')
    {
        return true;
    }

    false
}

fn parse_option_line(line: &str) -> Option<ParsedCliOption> {
    let trimmed = line.trim();

    if trimmed.is_empty() || !trimmed.starts_with('-') {
        return None;
    }

    let first_space = trimmed.find(char::is_whitespace);
    let equals_pos = trimmed.find('=');
    let bracket_pos = trimmed.find(|c| matches!(c, '<' | '[' | '{'));

    // Case 1: Equals syntax (e.g., --script=<Lua scripts>, --script-args-file=filename:)
    if let Some(eq_idx) = equals_pos {
        if first_space.map_or(true, |sp_idx| eq_idx < sp_idx) {
            let flag_raw = &trimmed[..eq_idx];
            let flag = normalize_flag(flag_raw);
            let rest = &trimmed[eq_idx + 1..];

            if let Some((value_hint, remainder)) = extract_bracketed_hint(rest) {
                let description = strip_description_prefix(remainder);
                return Some(ParsedCliOption {
                    flag,
                    value_hint: Some(value_hint.to_string()),
                    requires_value: true,
                    description,
                });
            } else {
                let val_end = rest.find(char::is_whitespace).unwrap_or(rest.len());
                let value_hint = rest[..val_end].trim().trim_end_matches(':').trim();
                let description = strip_description_prefix(&rest[val_end..]);
                return Some(ParsedCliOption {
                    flag,
                    value_hint: if value_hint.is_empty() {
                        None
                    } else {
                        Some(value_hint.to_string())
                    },
                    requires_value: !value_hint.is_empty(),
                    description,
                });
            }
        }
    }

    // Case 2: Embedded bracket in flag token (e.g., -T<0-5>, -PO[protocol list])
    if let Some(br_idx) = bracket_pos {
        if first_space.map_or(true, |sp_idx| br_idx < sp_idx) {
            let flag_raw = &trimmed[..br_idx];
            let flag = normalize_flag(flag_raw);
            let rest = &trimmed[br_idx..];

            if let Some((value_hint, remainder)) = extract_bracketed_hint(rest) {
                let description = strip_description_prefix(remainder);
                return Some(ParsedCliOption {
                    flag,
                    value_hint: Some(value_hint.to_string()),
                    requires_value: true,
                    description,
                });
            }
        }
    }

    // Case 3: Space-separated flag and value hint (e.g., -p <port ranges>, -sI <zombie host[:probeport]>)
    // or flag without value hint (e.g., -Pn)
    let (flag_raw, remainder) = match first_space {
        Some(index) => (&trimmed[..index], trimmed[index..].trim_start()),
        None => (trimmed, ""),
    };

    let flag = normalize_flag(flag_raw);

    // If remainder starts with another option flag (e.g. "-f; --mtu <val>"), do not steal the value hint of the second option.
    if !remainder.starts_with('-') {
        if let Some((value_hint, rest)) = extract_bracketed_hint(remainder) {
            let description = strip_description_prefix(rest);
            return Some(ParsedCliOption {
                flag,
                value_hint: Some(value_hint.to_string()),
                requires_value: true,
                description,
            });
        }
    }

    let description = strip_description_prefix(remainder);

    Some(ParsedCliOption {
        flag,
        value_hint: None,
        requires_value: false,
        description,
    })
}

fn extract_bracketed_hint(text: &str) -> Option<(&str, &str)> {
    let trimmed = text.trim_start();
    if trimmed.is_empty() {
        return None;
    }

    let bytes = trimmed.as_bytes();
    let opening = bytes[0];
    let closing = match opening {
        b'<' => b'>',
        b'[' => b']',
        b'{' => b'}',
        _ => return None,
    };

    let mut depth = 0usize;
    for (index, &byte) in bytes.iter().enumerate() {
        if byte == opening {
            depth += 1;
        } else if byte == closing {
            depth = depth.saturating_sub(1);
            if depth == 0 {
                let end = index + 1;
                let hint = &trimmed[..end];
                let remainder = &trimmed[end..];
                return Some((hint, remainder));
            }
        }
    }

    None
}

fn normalize_flag(flag: &str) -> String {
    flag.trim()
        .trim_end_matches(':')
        .trim_end_matches(';')
        .to_string()
}

fn strip_description_prefix(text: &str) -> String {
    text.trim()
        .trim_start_matches(':')
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_boolean_option() {
        let help = r#"
-Pn
    Treat all hosts as online -- skip host discovery
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-Pn");
        assert!(!options[0].requires_value);
        assert_eq!(
            options[0].description,
            "Treat all hosts as online -- skip host discovery"
        );
    }

    #[test]
    fn parses_value_option() {
        let help = r#"
-p <port ranges>
    Only scan specified ports
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-p");
        assert!(options[0].requires_value);
        assert_eq!(options[0].value_hint.as_deref(), Some("<port ranges>"));
        assert_eq!(options[0].description, "Only scan specified ports");
    }

    #[test]
    fn parses_multiple_options() {
        let help = r#"
-Pn
    Treat all hosts as online

-p <port ranges>
    Only scan specified ports

-sV
    Probe open ports to determine service/version information
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 3);
        assert_eq!(options[0].flag, "-Pn");
        assert_eq!(options[1].flag, "-p");
        assert_eq!(options[2].flag, "-sV");
    }

    #[test]
    fn parses_embedded_value() {
        let help = r#"
--script=<Lua scripts>
    Select NSE scripts
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "--script");
        assert!(options[0].requires_value);
        assert_eq!(options[0].value_hint.as_deref(), Some("<Lua scripts>"));
        assert_eq!(options[0].description, "Select NSE scripts");
    }

    #[test]
    fn parses_embedded_bracket_value() {
        let help = r#"
-T<0-5>
    Set timing template
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-T");
        assert!(options[0].requires_value);
        assert_eq!(options[0].value_hint.as_deref(), Some("<0-5>"));
        assert_eq!(options[0].description, "Set timing template");
    }

    #[test]
    fn parses_bracket_value() {
        let help = r#"
-PO[protocol list]
    IP Protocol Ping
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-PO");
        assert!(options[0].requires_value);
        assert_eq!(options[0].value_hint.as_deref(), Some("[protocol list]"));
    }

    #[test]
    fn parses_colon_inside_value_hint() {
        let help = r#"
-sI <zombie host[:probeport]>
    Idle scan
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-sI");
        assert!(options[0].requires_value);
        assert_eq!(
            options[0].value_hint.as_deref(),
            Some("<zombie host[:probeport]>")
        );
        assert_eq!(options[0].description, "Idle scan");
    }

    #[test]
    fn normalizes_trailing_punctuation() {
        let help = r#"
-sV:
    Detect service versions
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-sV");
        assert_eq!(options[0].description, "Detect service versions");
    }

    #[test]
    fn does_not_include_section_heading_in_description() {
        let help = r#"
PORT SPECIFICATION AND SCAN ORDER:
  --top-ports <number>: Scan <number> most common ports
SERVICE/VERSION DETECTION:
  -sV: Probe open ports to determine service/version info
"#;

        let options = parse_help(help);

        assert_eq!(options.len(), 2);
        assert_eq!(options[0].flag, "--top-ports");
        assert_eq!(options[0].value_hint.as_deref(), Some("<number>"));
        assert_eq!(options[0].description, "Scan <number> most common ports");
        assert_eq!(options[1].flag, "-sV");
        assert_eq!(
            options[1].description,
            "Probe open ports to determine service/version info"
        );
    }

    #[test]
    fn parses_real_nmap_help_when_available() {
        use std::process::Command;

        let output = Command::new("D:\\Pentesting Tools\\nmap.exe")
            .arg("--help")
            .output();

        let output = match output {
            Ok(output) => output,
            Err(_) => return,
        };

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let help = format!("{}{}", stdout, stderr);

        let options = parse_help(&help);

        println!("\n===== PARSED NMAP OPTIONS =====");

        for option in &options {
            println!(
                "FLAG: {} | VALUE: {:?} | REQUIRES VALUE: {} | DESCRIPTION: {}",
                option.flag, option.value_hint, option.requires_value, option.description
            );
        }

        println!("===== TOTAL OPTIONS: {} =====\n", options.len());

        assert!(
            !options.is_empty(),
            "Nmap help should produce parsed options"
        );

        // Verify that section headers like "SERVICE/VERSION DETECTION:" were not attached to option descriptions
        for option in &options {
            assert!(
                !option.description.contains("SERVICE/VERSION DETECTION:"),
                "Option {} description contained section header",
                option.flag
            );
            assert!(
                !option.description.contains("PORT SPECIFICATION"),
                "Option {} description contained section header",
                option.flag
            );
        }
    }
}