export type UserRole =
  | "Admin"
  | "Service Manager"
  | "Service Advisor"
  | "Customer Relations";

export type Screen =
  | "dashboard"
  | "complaints"
  | "new-complaint"
  | "complaint-details"
  | "reports"
  | "settings";

export type Status =
  | "New"
  | "In Progress"
  | "Pending"
  | "Awaiting Customer"
  | "Resolved"
  | "Closed";

export type DateRange =
  | "Yesterday"
  | "WTD"
  | "MTD"
  | "28 Days"
  | "Prev Month"
  | "QTD"
  | "YTD";

export type SortKey =
  | "id"
  | "customer"
  | "subject"
  | "category"
  | "dealer"
  | "assignedTo"
  | "status"
  | "created";

export type SortDir = "asc" | "desc";

export interface TimelineEntry {
  id: string;
  type:
    | "note"
    | "call"
    | "email"
    | "status"
    | "created"
    | "assigned"
    | "reopen";
  text: string;
  author: string;
  timestamp: string;
  emailId?: string;
  emailSubject?: string;
  emailHtml?: string;
  emailTo?: string;
  emailAttachments?: { name: string; size: number; type: string }[];
}

export interface Complaint {
  id: string;
  customer: { name: string; email: string; mobile: string };
  subject: string;
  category: string;
  dealer: string;
  vehicle: string;
  status: Status;
  assignedTo: string;
  created: string;
  updated: string;
  createdDays: number;
  description: string;
  timeline: TimelineEntry[];
  source?: string;
}

export interface Notification {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  body: string;
  time: string;
  read: boolean;
  complaintId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  vehicles: string[];
  postcode?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  body: string;
  isOutgoing: boolean;
}

export type DashboardPeriod = {
  kpis: {
    total: number;
    newC: number;
    awaiting: number;
    avgResolution: string;
    totalDelta: string;
    newDelta: string;
    awaitingDelta: string;
    resDelta: string;
  };
  categoryData: { name: string; count: number }[];
  agingBrackets: {
    label: string;
    count: number;
    text: string;
    bg: string;
  }[];
};

export type ReportsKpi = {
  value: string;
  delta: string;
  trendUp: boolean;
  trendGood: boolean;
};

export type ReportsPeriod = {
  kpis: {
    firstResponse: ReportsKpi;
    resolutionTime: ReportsKpi;
    resolutionRate: ReportsKpi;
  };
  areaData: { label: string; complaints: number; resolved: number }[];
  categoryData: { name: string; count: number }[];
  dealerData: {
    name: string;
    New: number;
    inProgress: number;
    pending: number;
    awaitingCustomer: number;
    resolved: number;
    closed: number;
  }[];
  resolutionData: { dealer: string; days: number }[];
  agentData: {
    name: string;
    new: number;
    resolved: number;
    avgDays: number;
    sla: number;
  }[];
};
