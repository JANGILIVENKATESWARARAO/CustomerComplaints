import type { ReactNode } from "react";
import type { Status, DateRange } from "./types";
import * as Icons from "./services/iconService";

// Chart data constants
export const STATUS_LINE_COLORS: Record<string, string> = {
  new: "#1d4ed8",
  inProgress: "#6366f1",
  pending: "#f59e0b",
  awaitingCustomer: "#8b5cf6",
  resolved: "#10b981",
  closed: "#6b7280",
};

export const PIE_COLORS = [
  "#1d4ed8",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export const CATEGORY_DATA = [
  { name: "Vehicle Quality", count: 34 },
  { name: "Service Quality", count: 27 },
  { name: "Billing", count: 19 },
  { name: "Customer Exp.", count: 15 },
  { name: "Parts", count: 12 },
  { name: "Warranty", count: 9 },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
export const getXAxisInterval = (len: number) => {
  if (len <= 10) return 0;
  if (len <= 20) return 1;
  if (len <= 31) return 2;
  return Math.floor(len / 6);
};

export const nowStamp = () => {
  const d = new Date();
  return `${d.getDate()} Jul, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// ─── Status Styles ────────────────────────────────────────────────────────────
export const STATUS_STYLES: Record<Status, string> = {
  New: "bg-blue-50 text-blue-700 border border-blue-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  "Awaiting Customer": "bg-purple-50 text-purple-700 border border-purple-200",
  Resolved: "bg-green-50 text-green-700 border border-green-200",
  Closed: "bg-gray-100 text-gray-600 border border-gray-200",
};

// ─── Timeline Configuration ───────────────────────────────────────────────────
export const TIMELINE_CFG: Record<
  string,
  {
    iconName: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  note: {
    iconName: "MessageSquare",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  call: {
    iconName: "Phone",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  phone: {
    iconName: "Phone",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  email: {
    iconName: "Mail",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  status: {
    iconName: "Activity",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  reopen: {
    iconName: "RefreshCcwDot",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  resolved: {
    iconName: "CheckCircle2",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  closed: {
    iconName: "X",
    iconBg: "bg-gray-200",
    iconColor: "text-gray-700",
  },
  created: {
    iconName: "PlusCircle",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
  },
  assigned: {
    iconName: "UserCheck",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
};

// ─── Lookup Lists ─────────────────────────────────────────────────────────────
export const ALL_STATUSES: Status[] = [
  "New",
  "In Progress",
  "Pending",
  "Awaiting Customer",
  "Resolved",
  "Closed",
];

export const ALL_CATEGORIES = [
  "Vehicle Quality",
  "Service Quality",
  "Billing",
  "Customer Experience",
  "Parts & Accessories",
  "Warranty",
];

export const ALL_AGENTS = [
  "Sarah Wilson",
  "James Patterson",
  "Emma Clarke",
  "David Hughes",
];
