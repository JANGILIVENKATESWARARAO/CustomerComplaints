import { useCallback, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import type { Screen, Notification } from "./types";

// Import modular screen components
import { DashboardScreen } from "./modules/dashboard/DashboardScreen";
import { ComplaintsScreen } from "./modules/complaints/ComplaintsScreen";
import { NewComplaintScreen } from "./modules/complaints/NewComplaintScreen";
import { ComplaintDetailsScreen } from "./modules/complaints/ComplaintDetailsScreen";
import { ReportsScreen } from "./modules/reports/ReportsScreen";
import { SettingsScreen } from "./modules/settings/SettingsScreen";

// Import layout components
import { Sidebar } from "./modules/layout/Sidebar";
import { TopBar } from "./modules/layout/TopBar";

// Import data
import { COMPLAINTS, INITIAL_NOTIFICATIONS } from "./data";
import { SSO_USER } from "./constants";

// ─── Screen Meta ──────────────────────────────────────────────────────────────
const SCREEN_META: Record<Screen, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of complaints activity",
  },
  complaints: {
    title: "Complaints",
    subtitle: "Manage and track all customer complaints",
  },
  "new-complaint": {
    title: "New Complaint",
    subtitle: "Register a new customer complaint",
  },
  "complaint-details": {
    title: "Complaint Details",
    subtitle: "View and manage complaint information",
  },
  reports: {
    title: "Reports & Analytics",
    subtitle: "Performance insights and trends",
  },
  settings: {
    title: "Settings",
    subtitle: `${SSO_USER.name} · ${SSO_USER.role}`,
  },
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [activeComplaintId, setActiveId] = useState<string>("CC-1024");
  const [sidebarCollapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useCallback((s: Screen, id?: string) => {
    if (s === "complaint-details" && id) setActiveId(id);
    setScreen(s);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const meta = SCREEN_META[screen];

  return (
    <div
      className={`flex h-screen overflow-hidden bg-background ${darkMode ? "dark" : ""}`}
    >
      <Toaster position="top-right" richColors closeButton />
      <Sidebar
        screen={screen}
        collapsed={sidebarCollapsed}
        onCollapse={() => setCollapsed((c) => !c)}
        onNavigate={navigate}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          notifications={notifications}
          onNavigate={navigate}
          onMarkRead={markRead}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
        />
        {screen === "dashboard" && (
          <DashboardScreen complaints={COMPLAINTS} onNavigate={navigate} />
        )}
        {screen === "complaints" && (
          <ComplaintsScreen complaints={COMPLAINTS} onNavigate={navigate} />
        )}
        {screen === "new-complaint" && (
          <NewComplaintScreen onNavigate={navigate} />
        )}
        {screen === "complaint-details" && (
          <ComplaintDetailsScreen
            complaintId={activeComplaintId}
            onNavigate={navigate}
          />
        )}
        {screen === "reports" && <ReportsScreen />}
        {screen === "settings" && <SettingsScreen />}
      </div>
    </div>
  );
}
