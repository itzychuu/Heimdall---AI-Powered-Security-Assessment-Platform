import { useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  FolderOpen,
  Info,
  Monitor,
  Palette,
  RefreshCw,
  Settings as SettingsIcon,
  Shield,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import "../styles/settings.css";

type SettingsSection =
  | "General"
  | "Security Tools"
  | "AI Assistant"
  | "Workspace"
  | "About";

const sections: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: typeof SettingsIcon;
}> = [
  {
    id: "General",
    label: "General",
    description: "Application preferences",
    icon: SlidersHorizontal,
  },
  {
    id: "Security Tools",
    label: "Security Tools",
    description: "Tool detection and paths",
    icon: Wrench,
  },
  {
    id: "AI Assistant",
    label: "AI Assistant",
    description: "AI provider and model",
    icon: Bot,
  },
  {
    id: "Workspace",
    label: "Workspace",
    description: "Data and storage",
    icon: FolderOpen,
  },
  {
    id: "About",
    label: "About",
    description: "Heimdall information",
    icon: Info,
  },
];

function SectionIcon({
  section,
}: {
  section: SettingsSection;
}) {
  const item = sections.find(
    (entry) => entry.id === section,
  );

  if (!item) {
    return <SettingsIcon size={18} />;
  }

  const Icon = item.icon;

  return <Icon size={18} />;
}

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("General");

  const [theme, setTheme] = useState("Dark");

  const [launchOnStartup, setLaunchOnStartup] =
    useState(false);

  const [autoDetectTools, setAutoDetectTools] =
    useState(true);

  const [aiProvider, setAiProvider] =
    useState("Local");

  function renderGeneralSettings() {
    return (
      <>
        <div className="settings-section-header">
          <div>
            <h2>General</h2>

            <p>
              Configure general Heimdall application
              preferences.
            </p>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">
            Appearance
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <Palette size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Theme</strong>

              <span>
                Choose how Heimdall appears on your system.
              </span>
            </div>

            <select
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value)
              }
              className="settings-select"
            >
              <option value="Dark">Dark</option>
              <option value="Light">Light</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">
            Application
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <Monitor size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Launch on startup</strong>

              <span>
                Start Heimdall automatically when you sign
                in to your system.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                launchOnStartup
                  ? "settings-toggle-active"
                  : ""
              }`}
              onClick={() =>
                setLaunchOnStartup(
                  !launchOnStartup,
                )
              }
              aria-label="Toggle launch on startup"
              aria-pressed={launchOnStartup}
            >
              <span />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <RefreshCw size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Automatic tool detection</strong>

              <span>
                Check for installed security tools when
                Heimdall starts.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                autoDetectTools
                  ? "settings-toggle-active"
                  : ""
              }`}
              onClick={() =>
                setAutoDetectTools(
                  !autoDetectTools,
                )
              }
              aria-label="Toggle automatic tool detection"
              aria-pressed={autoDetectTools}
            >
              <span />
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderSecurityToolsSettings() {
    return (
      <>
        <div className="settings-section-header">
          <div>
            <h2>Security Tools</h2>

            <p>
              Manage how Heimdall discovers and uses
              security tools.
            </p>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">
            Tool Management
          </div>

          <button
            type="button"
            className="settings-action-row"
          >
            <div className="settings-row-icon">
              <Shield size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Detect installed tools</strong>

              <span>
                Scan your system for supported security
                tools.
              </span>
            </div>

            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="settings-action-row"
          >
            <div className="settings-row-icon">
              <Wrench size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Manage custom tools</strong>

              <span>
                Add tools installed outside the standard
                system paths.
              </span>
            </div>

            <ChevronRight size={18} />
          </button>
        </div>

        <div className="settings-info-box">
          <Shield size={17} />

          <div>
            <strong>Tool installation</strong>

            <p>
              Heimdall can use supported system package
              managers where available. You can also
              configure manually installed tools.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderAISettings() {
    return (
      <>
        <div className="settings-section-header">
          <div>
            <h2>AI Assistant</h2>

            <p>
              Configure the AI provider used by Heimdall.
            </p>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">
            Provider
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <Bot size={18} />
            </div>

            <div className="settings-row-content">
              <strong>AI provider</strong>

              <span>
                Choose where Heimdall's AI assistant gets
                its responses.
              </span>
            </div>

            <select
              value={aiProvider}
              onChange={(event) =>
                setAiProvider(event.target.value)
              }
              className="settings-select"
            >
              <option value="Local">Local</option>
              <option value="Remote">
                Remote provider
              </option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <Bot size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Model</strong>

              <span>
                The model that will power the AI Assistant.
              </span>
            </div>

            <button
              type="button"
              className="settings-value-button"
            >
              Not configured
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="settings-info-box">
          <Bot size={17} />

          <div>
            <strong>Local AI</strong>

            <p>
              Local models can eventually be connected
              through providers such as Ollama, keeping
              supported AI workloads on your machine.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderWorkspaceSettings() {
    return (
      <>
        <div className="settings-section-header">
          <div>
            <h2>Workspace</h2>

            <p>
              Configure where Heimdall stores application
              data.
            </p>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">
            Storage
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <FolderOpen size={18} />
            </div>

            <div className="settings-row-content">
              <strong>Workspace location</strong>

              <span>
                Location used for projects, scans, reports,
                and application data.
              </span>
            </div>

            <button
              type="button"
              className="settings-value-button"
            >
              Default
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="settings-info-box">
          <FolderOpen size={17} />

          <div>
            <strong>Workspace data</strong>

            <p>
              This location will eventually contain
              Heimdall's local project and assessment data.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderAboutSettings() {
    return (
      <>
        <div className="settings-section-header">
          <div>
            <h2>About</h2>

            <p>
              Information about this Heimdall installation.
            </p>
          </div>
        </div>

        <div className="settings-about">
          <div className="settings-about-logo">
            <SettingsIcon size={25} />
          </div>

          <h3>HEIMDALL</h3>

          <span className="settings-about-tagline">
            THE SENTINEL
          </span>

          <p>
            Security assessment and intelligence platform
            designed to bring your security workflow into
            one place.
          </p>

          <div className="settings-version">
            <span>Version</span>
            <strong>0.1.0</strong>
          </div>

          <div className="settings-about-status">
            <span className="settings-status-dot" />

            <span>
              Development build
            </span>
          </div>
        </div>
      </>
    );
  }

  function renderContent() {
    switch (activeSection) {
      case "Security Tools":
        return renderSecurityToolsSettings();

      case "AI Assistant":
        return renderAISettings();

      case "Workspace":
        return renderWorkspaceSettings();

      case "About":
        return renderAboutSettings();

      case "General":
      default:
        return renderGeneralSettings();
    }
  }

  return (
    <div className="page settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>

          <p>
            Configure Heimdall.
          </p>
        </div>
      </div>

      <section className="card settings-card">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">
            <SettingsIcon size={16} />
            <span>Configuration</span>
          </div>

          <nav className="settings-navigation">
            {sections.map((section) => {
              const Icon = section.icon;
              const active =
                activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={`settings-nav-item ${
                    active
                      ? "settings-nav-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveSection(section.id)
                  }
                >
                  <div className="settings-nav-icon">
                    <Icon size={17} />
                  </div>

                  <div className="settings-nav-content">
                    <strong>
                      {section.label}
                    </strong>

                    <span>
                      {section.description}
                    </span>
                  </div>

                  {active && (
                    <Check
                      className="settings-nav-check"
                      size={15}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="settings-content">
          <div className="settings-content-icon">
            <SectionIcon section={activeSection} />
          </div>

          {renderContent()}
        </main>
      </section>
    </div>
  );
}