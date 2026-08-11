import type { Screen } from "../../types";
import * as Icons from "../../services/iconService";
import { SSO_USER, ROLE_PERMISSIONS } from "../../constants";

interface SidebarProps {
  screen: Screen;
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate: (s: Screen) => void;
}

const NAV_ITEMS: {
  key: Screen;
  label: string;
  icon: (p: { size: number; className: string }) => React.ReactNode;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (p) => <Icons.LayoutDashboard {...p} />,
  },
  {
    key: "complaints",
    label: "Complaints",
    icon: (p) => <Icons.ListFilter {...p} />,
  },
  { key: "reports", label: "Reports", icon: (p) => <Icons.BarChart2 {...p} /> },
  {
    key: "settings",
    label: "Settings",
    icon: (p) => <Icons.Settings {...p} />,
  },
];

export function Sidebar({
  screen,
  collapsed,
  onCollapse,
  onNavigate,
}: SidebarProps) {
  const perm = ROLE_PERMISSIONS[SSO_USER.role];
  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 flex-shrink-0 ${collapsed ? "w-14" : "w-56"}`}
      style={{ background: "#1D1D1D" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {collapsed ? (
          <button
            onClick={onCollapse}
            className="mx-auto p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Expand sidebar"
          >
            <Icons.ChevronRight size={13} className="text-white/60" />
          </button>
        ) : (
          <>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#14b8a6" }}
            >
              <Icons.Inbox size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold leading-tight tracking-wide">
                exsto
              </p>
              <p
                style={{ color: "#7fa8c9", fontSize: "10px" }}
                className="leading-tight"
              >
                Complaints
              </p>
            </div>
            <button
              onClick={onCollapse}
              className="ml-auto p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
              title="Collapse sidebar"
            >
              <Icons.ChevronLeft size={13} className="text-white/60" />
            </button>
          </>
        )}
      </div>
      <div className="px-3 py-3">
        <button
          onClick={() => onNavigate("new-complaint")}
          className={`w-full flex items-center gap-2 rounded-lg py-2.5 font-semibold text-xs text-white transition-colors ${collapsed ? "justify-center" : "px-3"}`}
          style={{ background: "#14b8a6" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0d9488")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#14b8a6")}
        >
          <Icons.PlusCircle size={14} className="flex-shrink-0" />
          {!collapsed && "New Complaint"}
        </button>
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto py-1">
        {NAV_ITEMS.map((item) => {
          if (item.key === "settings" && !perm.canViewSettings) return null;
          const active =
            screen === item.key ||
            (item.key === "complaints" && screen === "complaint-details");
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 rounded-lg py-2 text-xs font-medium transition-colors ${collapsed ? "justify-center" : "px-3"} ${active ? "text-white" : "text-white/55 hover:text-white/85 hover:bg-white/8"}`}
              style={
                active
                  ? {
                      background: "rgba(255,255,255,0.1)",
                      borderLeft: "2px solid #14b8a6",
                      paddingLeft: collapsed ? undefined : "10px",
                    }
                  : {}
              }
            >
              {item.icon({
                size: 15,
                className: active ? "text-teal-400" : "text-white/55",
              })}
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>
      <div
        className="border-t px-3 py-3"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: "#14b8a6" }}
          >
            {SSO_USER.initials}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold leading-tight truncate">
                  {SSO_USER.name}
                </p>
                <p
                  style={{ color: "#7fa8c9", fontSize: "10px" }}
                  className="leading-tight truncate"
                >
                  {SSO_USER.role}
                </p>
              </div>
              <button
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <Icons.LogOut size={12} className="text-white/40" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
