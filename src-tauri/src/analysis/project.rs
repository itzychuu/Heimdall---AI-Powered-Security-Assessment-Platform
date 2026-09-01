use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use super::models::{
    ProjectContext,
    ProjectFile,
};

pub fn analyze(
    root: &str,
) -> Result<ProjectContext, String> {
    let root_path = PathBuf::from(root);

    if !root_path.exists() {
        return Err(format!(
            "Project path does not exist: {}",
            root
        ));
    }

    if !root_path.is_dir() {
        return Err(format!(
            "Project path is not a directory: {}",
            root
        ));
    }

    let mut files = Vec::new();
    collect_files(
        &root_path,
        &root_path,
        &mut files,
    )?;

    let languages =
        detect_languages(&files);

    let manifests =
        detect_manifests(&files);

    let frameworks =
        detect_frameworks(&files);

    let security_relevant_files =
        detect_security_files(&files);

    Ok(ProjectContext {
        root: root_path
            .canonicalize()
            .unwrap_or(root_path)
            .to_string_lossy()
            .to_string(),

        files,
        languages,
        frameworks,
        manifests,
        security_relevant_files,
    })
}

fn collect_files(
    root: &Path,
    current: &Path,
    files: &mut Vec<ProjectFile>,
) -> Result<(), String> {
    let entries = fs::read_dir(current)
        .map_err(|error| {
            format!(
                "Failed to read directory '{}': {}",
                current.display(),
                error
            )
        })?;

    for entry in entries {
        let entry = entry.map_err(|error| {
            format!(
                "Failed to read directory entry: {}",
                error
            )
        })?;

        let path = entry.path();

        if should_ignore(&path) {
            continue;
        }

        if path.is_dir() {
            collect_files(
                root,
                &path,
                files,
            )?;

            continue;
        }

        if !path.is_file() {
            continue;
        }

        let metadata = fs::metadata(&path)
            .map_err(|error| {
                format!(
                    "Failed to read metadata for '{}': {}",
                    path.display(),
                    error
                )
            })?;

        let relative_path = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string();

        let extension = path
            .extension()
            .map(|value| {
                value
                    .to_string_lossy()
                    .to_lowercase()
            });

        files.push(ProjectFile {
            path: path
                .to_string_lossy()
                .to_string(),

            relative_path,

            extension,

            size: metadata.len(),
        });
    }

    Ok(())
}

fn should_ignore(path: &Path) -> bool {
    let ignored = [
        ".git",
        "node_modules",
        "target",
        "dist",
        "build",
        ".next",
        ".nuxt",
        "coverage",
        "__pycache__",
    ];

    path.file_name()
        .map(|name| {
            let name = name.to_string_lossy();

            ignored
                .iter()
                .any(|item| *item == name)
        })
        .unwrap_or(false)
}

fn detect_languages(
    files: &[ProjectFile],
) -> Vec<String> {
    let mut languages = BTreeSet::new();

    for file in files {
        match file.extension.as_deref() {
            Some("rs") => {
                languages.insert("Rust");
            }

            Some("ts") | Some("tsx") => {
                languages.insert("TypeScript");
            }

            Some("js") | Some("jsx") => {
                languages.insert("JavaScript");
            }

            Some("py") => {
                languages.insert("Python");
            }

            Some("java") => {
                languages.insert("Java");
            }

            Some("go") => {
                languages.insert("Go");
            }

            Some("cs") => {
                languages.insert("C#");
            }

            Some("cpp") | Some("cc") | Some("cxx") => {
                languages.insert("C++");
            }

            Some("c") => {
                languages.insert("C");
            }

            Some("php") => {
                languages.insert("PHP");
            }

            Some("rb") => {
                languages.insert("Ruby");
            }

            Some("swift") => {
                languages.insert("Swift");
            }

            Some("kt") => {
                languages.insert("Kotlin");
            }

            _ => {}
        }
    }

    languages
        .into_iter()
        .map(String::from)
        .collect()
}

fn detect_manifests(
    files: &[ProjectFile],
) -> Vec<String> {
    let mut manifests = BTreeSet::new();

    for file in files {
        let path = file
            .relative_path
            .replace('\\', "/");

        let filename = Path::new(&path)
            .file_name()
            .map(|value| {
                value
                    .to_string_lossy()
                    .to_lowercase()
            });

        match filename.as_deref() {
            Some("package.json")
            | Some("cargo.toml")
            | Some("requirements.txt")
            | Some("pyproject.toml")
            | Some("pom.xml")
            | Some("go.mod")
            | Some("composer.json")
            | Some("gemfile")
            | Some("dockerfile")
            | Some("docker-compose.yml")
            | Some("docker-compose.yaml") => {
                manifests.insert(path);
            }

            _ => {}
        }
    }

    manifests
        .into_iter()
        .collect()
}

fn detect_frameworks(
    files: &[ProjectFile],
) -> Vec<String> {
    let mut frameworks = BTreeSet::new();

    for file in files {
        let path = file
            .relative_path
            .replace('\\', "/")
            .to_lowercase();

        match path.as_str() {
            value if value.ends_with("next.config.js")
                || value.ends_with("next.config.ts")
                || value.ends_with("next.config.mjs") =>
            {
                frameworks.insert("Next.js");
            }

            value if value.ends_with("vite.config.js")
                || value.ends_with("vite.config.ts") =>
            {
                frameworks.insert("Vite");
            }

            value if value.ends_with("angular.json") => {
                frameworks.insert("Angular");
            }

            value if value.ends_with("manage.py") => {
                frameworks.insert("Django");
            }

            value if value.ends_with("artisan") => {
                frameworks.insert("Laravel");
            }

            _ => {}
        }
    }

    frameworks
        .into_iter()
        .map(String::from)
        .collect()
}

fn detect_security_files(
    files: &[ProjectFile],
) -> Vec<String> {
    let keywords = [
        ".env",
        "dockerfile",
        "docker-compose",
        "auth",
        "login",
        "security",
        "config",
        "secret",
        "token",
        "credential",
        "password",
        "middleware",
    ];

    files
        .iter()
        .filter(|file| {
            let path = file
                .relative_path
                .to_lowercase();

            keywords
                .iter()
                .any(|keyword| {
                    path.contains(keyword)
                })
        })
        .map(|file| file.relative_path.clone())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ignores_common_generated_directories() {
        assert!(
            should_ignore(
                Path::new("node_modules")
            )
        );

        assert!(
            should_ignore(
                Path::new("target")
            )
        );

        assert!(
            !should_ignore(
                Path::new("src")
            )
        );
    }
}