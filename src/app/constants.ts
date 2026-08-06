import type { ReactNode } from "react";
import type { UserRole, Screen } from "./types";

// ─── SSO & Authentication ──────────────────────────────────────────────────────
export const SSO_USER = {
  id: "USR-001",
  name: "Jangili Rao",
  initials: "JR",
  email: "j.rao@parkway.co.uk",
  role: "Admin" as UserRole,
  dealer: "All Centres",
};

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    canManageCategories: boolean;
    canManageUsers: boolean;
    canManageDealers: boolean;
    canViewSettings: boolean;
  }
> = {
  Admin: {
    canManageCategories: true,
    canManageUsers: true,
    canManageDealers: true,
    canViewSettings: true,
  },
  "Service Manager": {
    canManageCategories: true,
    canManageUsers: false,
    canManageDealers: false,
    canViewSettings: true,
  },
  "Service Advisor": {
    canManageCategories: false,
    canManageUsers: false,
    canManageDealers: false,
    canViewSettings: false,
  },
  "Customer Relations": {
    canManageCategories: false,
    canManageUsers: false,
    canManageDealers: false,
    canViewSettings: false,
  },
};

// ─── Navigation Item Keys ─────────────────────────────────────────────────────
export const NAV_KEYS: Screen[] = [
  "dashboard",
  "complaints",
  "reports",
  "settings",
];
export const NAV_LABELS: Record<Screen, string> = {
  dashboard: "Dashboard",
  complaints: "Complaints",
  reports: "Reports",
  settings: "Settings",
  "new-complaint": "New Complaint",
  "complaint-details": "Complaint Details",
};

// ─── Screen Metadata ───────────────────────────────────────────────────────────
export const SCREEN_LABELS: Record<Screen, string> = {
  dashboard: "Dashboard",
  complaints: "Complaints",
  "new-complaint": "New Complaint",
  "complaint-details": "Complaint Details",
  reports: "Reports",
  settings: "Settings",
};
