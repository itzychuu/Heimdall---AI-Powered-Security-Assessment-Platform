use super::profile::{
    ArgumentStyle,
    InputType,
    ToolCapability,
    ToolInput,
    ToolProfile,
};

/*
 * Nmap
 *
 * Network-oriented scanner.
 */
const NMAP_INPUTS: &[ToolInput] = &[
    ToolInput {
        id: "target",
        label: "Target",
        input_type: InputType::Target,
        required: true,
        description: "IP address, hostname, or network range to scan.",
        argument_style: None,
    },
    ToolInput {
        id: "ports",
        label: "Ports",
        input_type: InputType::Ports,
        required: false,
        description: "Specific ports or port ranges to scan.",
        argument_style: Some(ArgumentStyle::FlagValue("-p")),
    },
    ToolInput {
        id: "service_detection",
        label: "Service Detection",
        input_type: InputType::Boolean,
        required: false,
        description: "Detect services and their versions.",
        argument_style: Some(ArgumentStyle::Flag("-sV")),
    },
    ToolInput {
        id: "os_detection",
        label: "OS Detection",
        input_type: InputType::Boolean,
        required: false,
        description: "Attempt operating system detection.",
        argument_style: Some(ArgumentStyle::Flag("-O")),
    },
];

const NMAP_CAPABILITIES: &[ToolCapability] = &[
    ToolCapability {
        id: "network-discovery",
        name: "Network Discovery",
        description: "Discover hosts and exposed network services.",
    },
    ToolCapability {
        id: "port-scanning",
        name: "Port Scanning",
        description: "Scan selected ports and port ranges.",
    },
    ToolCapability {
        id: "service-detection",
        name: "Service Detection",
        description: "Identify services and versions running on discovered ports.",
    },
    ToolCapability {
        id: "os-detection",
        name: "Operating System Detection",
        description: "Attempt to identify the operating system of a target.",
    },
];

pub static NMAP_PROFILE: ToolProfile = ToolProfile {
    tool_id: "nmap",
    inputs: NMAP_INPUTS,
    capabilities: NMAP_CAPABILITIES,
};


/*
 * FFUF
 *
 * Web fuzzing tool.
 */
const FFUF_INPUTS: &[ToolInput] = &[
    ToolInput {
        id: "target",
        label: "Target URL",
        input_type: InputType::Url,
        required: true,
        description: "URL containing the fuzzing position.",
        argument_style: Some(ArgumentStyle::FlagValue("-u")),
    },
    ToolInput {
        id: "wordlist",
        label: "Wordlist",
        input_type: InputType::Wordlist,
        required: true,
        description: "Wordlist used for fuzzing.",
        argument_style: Some(ArgumentStyle::FlagValue("-w")),
    },
    ToolInput {
        id: "extensions",
        label: "Extensions",
        input_type: InputType::Text,
        required: false,
        description: "File extensions to include during fuzzing.",
        argument_style: Some(ArgumentStyle::FlagValue("-e")),
    },
    ToolInput {
        id: "threads",
        label: "Threads",
        input_type: InputType::Number,
        required: false,
        description: "Number of concurrent threads.",
        argument_style: Some(ArgumentStyle::FlagValue("-t")),
    },
];

const FFUF_CAPABILITIES: &[ToolCapability] = &[
    ToolCapability {
        id: "directory-fuzzing",
        name: "Directory Fuzzing",
        description: "Discover directories and files on web applications.",
    },
    ToolCapability {
        id: "parameter-fuzzing",
        name: "Parameter Fuzzing",
        description: "Test URL parameters and request values.",
    },
    ToolCapability {
        id: "virtual-host-fuzzing",
        name: "Virtual Host Fuzzing",
        description: "Discover virtual hosts using fuzzing.",
    },
];

pub static FFUF_PROFILE: ToolProfile = ToolProfile {
    tool_id: "ffuf",
    inputs: FFUF_INPUTS,
    capabilities: FFUF_CAPABILITIES,
};


/*
 * John the Ripper
 *
 * Password auditing / recovery tool.
 */
const JOHN_INPUTS: &[ToolInput] = &[
    ToolInput {
        id: "hash_file",
        label: "Hash File",
        input_type: InputType::HashFile,
        required: true,
        description: "File containing password hashes.",
        argument_style: None,
    },
    ToolInput {
        id: "wordlist",
        label: "Wordlist",
        input_type: InputType::Wordlist,
        required: false,
        description: "Wordlist used for password auditing.",
        argument_style: Some(ArgumentStyle::FlagValue("--wordlist")),
    },
    ToolInput {
        id: "format",
        label: "Hash Format",
        input_type: InputType::Select,
        required: false,
        description: "Hash format to use.",
        argument_style: Some(ArgumentStyle::FlagValue("--format")),
    },
];

const JOHN_CAPABILITIES: &[ToolCapability] = &[
    ToolCapability {
        id: "password-auditing",
        name: "Password Auditing",
        description: "Audit password hashes using supported cracking modes.",
    },
    ToolCapability {
        id: "wordlist-mode",
        name: "Wordlist Mode",
        description: "Use a wordlist for password auditing.",
    },
    ToolCapability {
        id: "hash-format",
        name: "Hash Format Selection",
        description: "Select a specific supported hash format.",
    },
];

pub static JOHN_PROFILE: ToolProfile = ToolProfile {
    tool_id: "john",
    inputs: JOHN_INPUTS,
    capabilities: JOHN_CAPABILITIES,
};


/*
 * All currently defined profiles.
 */
pub static PROFILES: &[&ToolProfile] = &[
    &NMAP_PROFILE,
    &FFUF_PROFILE,
    &JOHN_PROFILE,
];

pub fn get_profile(tool_id: &str) -> Option<&'static ToolProfile> {
    PROFILES
        .iter()
        .copied()
        .find(|profile| profile.tool_id == tool_id)
}