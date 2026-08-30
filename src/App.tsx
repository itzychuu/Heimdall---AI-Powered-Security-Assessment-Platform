import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/scans.css";

import AppShell from "./components/layout/AppShell";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Targets from "./pages/Targets";
import TargetDetails from "./pages/TargetDetails";
import Scans from "./pages/Scans";
import ScanDetails from "./pages/ScanDetails";
import Findings from "./pages/Findings";
import FindingDetails from "./pages/FindingDetails";
import Tools from "./pages/Tools";
import ToolDetails from "./pages/ToolDetails";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
          />
          <Route path="/targets" element={<Targets />} />
          <Route
            path="/targets/:targetId"
            element={<TargetDetails />}
          />
          <Route
            path="/scans/:scanId"
            element={<ScanDetails />}
          />
          <Route path="/scans" element={<Scans />} />
          <Route
            path="/findings/:findingId"
            element={<FindingDetails />}
          />
          <Route path="/findings" element={<Findings />} />
          <Route path="/tools" element={<Tools />} />
          <Route
            path="/tools/:toolId"
            element={<ToolDetails />}
          />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;