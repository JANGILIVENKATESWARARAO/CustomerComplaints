import { useEffect, useRef, useState } from "react";
import type { Screen, Notification } from "../../types";
import * as Icons from "../../services/iconService";

interface TopBarProps {
  title: string;
  subtitle: string;
  notifications: Notification[];
  onNavigate: (s: Screen, id?: string) => void;
  onMarkRead: (id: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

function NotificationPanel({
  notifications,
  onMarkRead,
  onNavigate,
  onClose,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onNavigate: (s: Screen, id?: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const iconColor = {
    warning: "text-amber-500",
    info: "text-blue-500",
    success: "text-green-500",
  };
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-40 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Notifications</h3>
        <span className="text-xs text-muted-foreground">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {notifications.map((n) => (
          <button
            key={n.id}
            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted text-left transition-colors ${!n.read ? "bg-blue-50/50" : ""}`}
            onClick={() => {
              onMarkRead(n.id);
              if (n.complaintId) {
                onNavigate("complaint-details", n.complaintId);
                onClose();
              }
            }}
          >
            <div
              className={`mt-0.5 flex-shrink-0 ${iconColor[n.type]}`}
            >
              {n.type === "warning" ? (
                <Icons.AlertTriangle size={13} />
              ) : n.type === "success" ? (
                <Icons.CheckCircle2 size={13} />
              ) : (
                <Icons.Info size={13} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  {n.title}
                </p>
                {!n.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {n.body}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  notifications,
  onNavigate,
  onMarkRead,
  darkMode,
  onToggleDark,
}: TopBarProps) {
  const [showPanel, setShowPanel] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-sm font-bold text-foreground leading-tight">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={darkMode ? "Switch to Light" : "Switch to Dark"}
        >
          {darkMode ? (
            <Icons.Sun size={16} className="text-amber-500" />
          ) : (
            <Icons.Moon size={16} className="text-muted-foreground" />
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowPanel((p) => !p)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Icons.Bell size={16} className="text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">
                {unread}
              </span>
            )}
          </button>
          {showPanel && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={onMarkRead}
              onNavigate={onNavigate}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
