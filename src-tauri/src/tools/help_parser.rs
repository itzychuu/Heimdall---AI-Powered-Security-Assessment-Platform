use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ParsedCliOption {
    pub flag: String,
    pub value_hint: Option<String>,
    pub requires_value: bool,
    pub description: String,
}

pub fn parse_help(help: &str) -> Vec<ParsedCliOption> {
    let mut options = Vec::new();

    for line in help.lines() {
        if let Some(option) =
            parse_option_line(line)
        {
            options.push(option);
        }
    }

    options
}

fn parse_option_line(
    line: &str,
) -> Option<ParsedCliOption> {
    let trimmed = line.trim();

    if trimmed.is_empty()
        || !trimmed.starts_with('-')
    {
        return None;
    }

    let colon_position =
        trimmed.find(':');

    let syntax;
    let description;

    if let Some(position) = colon_position {
        syntax =
            trimmed[..position].trim();

        description =
            trimmed[position + 1..]
                .trim()
                .to_string();
    } else {
        let mut parts =
            trimmed.splitn(2, char::is_whitespace);

        syntax =
            parts.next()?.trim();

        description =
            parts
                .next()
                .unwrap_or("")
                .trim()
                .to_string();
    }

    if syntax.is_empty() {
        return None;
    }

    let mut parts =
        syntax.split_whitespace();

    let flag =
        parts.next()?.trim();

    if !flag.starts_with('-') {
        return None;
    }

    let remainder =
        parts.collect::<Vec<_>>();

    let value_hint =
        if remainder.is_empty() {
            extract_embedded_value(flag)
        } else {
            Some(remainder.join(" "))
        };

    let normalized_flag =
        remove_embedded_value(flag);

    Some(ParsedCliOption {
        flag: normalized_flag,
        requires_value: value_hint.is_some(),
        value_hint,
        description,
    })
}

fn extract_embedded_value(
    flag: &str,
) -> Option<String> {
    let equals =
        flag.find('=');

    if let Some(position) = equals {
        let value =
            flag[position + 1..].trim();

        if !value.is_empty() {
            return Some(
                value.to_string()
            );
        }
    }

    None
}

fn remove_embedded_value(
    flag: &str,
) -> String {
    if let Some(position) =
        flag.find('=')
    {
        return flag[..position]
            .to_string();
    }

    flag.trim_end_matches(':')
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

        let options =
            parse_help(help);

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

        let options =
            parse_help(help);

        assert_eq!(options.len(), 1);
        assert_eq!(options[0].flag, "-p");
        assert!(options[0].requires_value);
        assert_eq!(
            options[0].value_hint.as_deref(),
            Some("<port ranges>")
        );
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

        let options =
            parse_help(help);

        assert_eq!(options.len(), 3);
        assert_eq!(options[0].flag, "-Pn");
        assert_eq!(options[1].flag, "-p");
        assert_eq!(options[2].flag, "-sV");
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

        let stdout =
            String::from_utf8_lossy(&output.stdout);

        let stderr =
            String::from_utf8_lossy(&output.stderr);

        let help =
            format!("{}{}", stdout, stderr);

        let options =
            parse_help(&help);

        println!(
            "\n===== PARSED NMAP OPTIONS ====="
        );

        for option in &options {
            println!(
                "FLAG: {} | VALUE: {:?} | REQUIRES VALUE: {} | DESCRIPTION: {}",
                option.flag,
                option.value_hint,
                option.requires_value,
                option.description
            );
        }

        println!(
            "===== TOTAL OPTIONS: {} =====\n",
            options.len()
        );

        assert!(
            !options.is_empty(),
            "Nmap help should produce parsed options"
        );
    }
}