import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Toaster, toast } from "sonner";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  ListFilter,
  PlusCircle,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Check,
  Phone,
  Mail,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  User,
  Building2,
  Car,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Shield,
  Users,
  Inbox,
  TrendingUp,
  TrendingDown,
  Activity,
  Timer,
  RefreshCcwDot,
  MessageSquare,
  Send,
  Mic,
  UserCheck,
  ArrowLeft,
  Plus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Reply,
  PencilLine,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Table as TableIcon,
  Quote,
  Link as LinkIcon,
  Paperclip,
  Undo2,
  Redo2,
  Minus,
  ChevronUp,
  Type,
  Highlighter,
  RemoveFormatting,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  Table as TableExt,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";
import Strike from "@tiptap/extension-strike";

// ─── SSO Context ──────────────────────────────────────────────────────────────
type UserRole =
  | "Admin"
  | "Service Manager"
  | "Service Advisor"
  | "Customer Relations";

const SSO_USER = {
  id: "USR-001",
  name: "Jangili Rao",
  initials: "JR",
  email: "j.rao@parkway.co.uk",
  role: "Admin" as UserRole,
  dealer: "All Centres",
};

const ROLE_PERMISSIONS: Record<
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

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "dashboard"
  | "complaints"
  | "new-complaint"
  | "complaint-details"
  | "reports"
  | "settings";
type Status =
  | "New"
  | "In Progress"
  | "Pending"
  | "Awaiting Customer"
  | "Resolved"
  | "Closed";
type DateRange =
  | "Yesterday"
  | "WTD"
  | "MTD"
  | "28 Days"
  | "Prev Month"
  | "QTD"
  | "YTD";
type SortKey =
  | "id"
  | "customer"
  | "subject"
  | "category"
  | "dealer"
  | "assignedTo"
  | "status"
  | "created";
type SortDir = "asc" | "desc";

interface TimelineEntry {
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

interface Complaint {
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

interface Notification {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  body: string;
  time: string;
  read: boolean;
  complaintId?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  vehicles: string[];
  postcode?: string;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  body: string;
  isOutgoing: boolean;
}

// ─── Customer DB ──────────────────────────────────────────────────────────────
const CUSTOMER_DB: Customer[] = [
  {
    id: "CUST-4421",
    name: "John Smith",
    email: "j.smith@email.com",
    mobile: "07700 900123",
    vehicles: ["AB12 XYZ", "DE45 RST"],
    postcode: "DE1 3AT",
  },
  {
    id: "CUST-3891",
    name: "Michael Brown",
    email: "m.brown@outlook.com",
    mobile: "07700 900789",
    vehicles: ["UV67 WXY"],
    postcode: "S1 2BQ",
  },
  {
    id: "CUST-2210",
    name: "Robert Davis",
    email: "r.davis@email.com",
    mobile: "07700 900654",
    vehicles: [],
    postcode: "LS1 4DW",
  },
  {
    id: "CUST-5103",
    name: "Amanda White",
    email: "a.white@gmail.com",
    mobile: "07700 900987",
    vehicles: ["CD34 MNO"],
    postcode: "M1 5EF",
  },
  {
    id: "CUST-1892",
    name: "Paul Martin",
    email: "p.martin@business.co.uk",
    mobile: "07700 900111",
    vehicles: ["EF56 PQR", "GH78 STU"],
    postcode: "DE1 2HG",
  },
  {
    id: "CUST-6201",
    name: "James Clarke",
    email: "j.clarke@email.com",
    mobile: "07700 900333",
    vehicles: ["JK90 VWX"],
    postcode: "S2 4LK",
  },
  {
    id: "CUST-6202",
    name: "Sarah Thompson",
    email: "s.thompson@gmail.com",
    mobile: "07700 900444",
    vehicles: ["LM12 YZA"],
    postcode: "LS2 7MN",
  },
  {
    id: "CUST-6203",
    name: "David Wilson",
    email: "d.wilson@outlook.com",
    mobile: "07700 900555",
    vehicles: ["NO34 BCD"],
    postcode: "M2 3PQ",
  },
  {
    id: "CUST-6204",
    name: "Emma Johnson",
    email: "e.johnson@email.com",
    mobile: "07700 900666",
    vehicles: [],
    postcode: "DE3 8RS",
  },
  {
    id: "CUST-6205",
    name: "Thomas Hughes",
    email: "t.hughes@business.co.uk",
    mobile: "07700 900777",
    vehicles: ["PQ56 EFG", "RS78 HIJ"],
    postcode: "S3 9TU",
  },
  {
    id: "CUST-6206",
    name: "Laura Mitchell",
    email: "l.mitchell@email.com",
    mobile: "07700 900888",
    vehicles: ["TU90 KLM"],
    postcode: "LS3 1VW",
  },
  {
    id: "CUST-6207",
    name: "Christopher Lee",
    email: "c.lee@outlook.com",
    mobile: "07700 900999",
    vehicles: ["VW12 NOP"],
    postcode: "M4 6XY",
  },
  {
    id: "CUST-6208",
    name: "Rachel Green",
    email: "r.green@gmail.com",
    mobile: "07700 901010",
    vehicles: ["XY34 QRS"],
    postcode: "DE4 2ZA",
  },
];

// ─── Dealer → Agent mapping ───────────────────────────────────────────────────
const DEALER_AGENTS: Record<string, string[]> = {
  "Parkway Derby": ["Sarah Wilson", "Emma Clarke"],
  "Parkway Sheffield": ["James Patterson"],
  "Parkway Leeds": ["Emma Clarke", "David Hughes"],
  "Parkway Manchester": ["David Hughes", "Sarah Wilson"],
};

// ─── Email Threads ────────────────────────────────────────────────────────────
const EMAIL_THREADS: Record<string, EmailMessage[]> = {
  "CC-1024": [
    {
      id: "em-3",
      isOutgoing: true,
      from: "Sarah Wilson <support@parkwayderby.co.uk>",
      to: "j.smith@email.com",
      subject: "Re: Complaint CC-1024 — Vehicle repair delay",
      date: "24 Jul 2026, 09:14",
      body: "Dear Mr Smith,\n\nThank you for your continued patience. I have spoken with the workshop manager and can confirm that the parts required are due to arrive tomorrow morning. We will prioritize your vehicle and aim to complete the work by end of day.\n\nPlease accept our sincere apologies for the delay.\n\nKind regards,\nSarah Wilson\nCustomer Relations Manager | Parkway Derby",
    },
    {
      id: "em-2",
      isOutgoing: false,
      from: "j.smith@email.com",
      to: "support@parkwayderby.co.uk",
      subject: "Re: Complaint CC-1024 — Vehicle repair delay",
      date: "22 Jul 2026, 18:30",
      body: "Good evening,\n\nI am still waiting for an update on my vehicle. It has been over a week and I have had no communication whatsoever. This is completely unacceptable.\n\nI expect someone to contact me first thing tomorrow morning.\n\nJohn Smith",
    },
    {
      id: "em-1",
      isOutgoing: true,
      from: "support@parkwayderby.co.uk",
      to: "j.smith@email.com",
      subject: "Your complaint has been registered — CC-1024",
      date: "20 Jul 2026, 15:25",
      body: "Dear Mr Smith,\n\nThank you for contacting Parkway Derby. This email confirms that your complaint has been registered with reference number CC-1024.\n\nA member of our team will be in touch within 2 business days.\n\nKind regards,\nCustomer Support Team\nParkway Derby",
    },
  ],
  "CC-1022": [
    {
      id: "em-2",
      isOutgoing: true,
      from: "Emma Clarke <support@parkwayderby.co.uk>",
      to: "m.brown@outlook.com",
      subject: "Re: Complaint CC-1022 — Unauthorized charge on invoice",
      date: "23 Jul 2026, 14:10",
      body: "Dear Mr Brown,\n\nThank you for contacting us. We have reviewed your invoice and note the £180 diagnostic charge. Could you please provide a copy of any written quote or confirmation you received prior to your service visit?\n\nKind regards,\nEmma Clarke\nCustomer Relations | Parkway Derby",
    },
    {
      id: "em-1",
      isOutgoing: false,
      from: "m.brown@outlook.com",
      to: "support@parkwayderby.co.uk",
      subject: "Complaint — Unauthorised charge on invoice",
      date: "18 Jul 2026, 10:10",
      body: "Good morning,\n\nI am writing to formally complain about an unauthorised charge of £180 for a diagnostic check on my service invoice dated 16 July 2026.\n\nI was not informed of or asked to authorise this additional work. I am requesting an immediate full refund.\n\nMichael Brown",
    },
  ],
};

// ─── Complaints Data ──────────────────────────────────────────────────────────
const COMPLAINTS: Complaint[] = [
  {
    id: "CC-1024",
    status: "New",
    category: "Vehicle Quality",
    dealer: "Parkway Derby",
    vehicle: "AB12 XYZ",
    assignedTo: "Sarah Wilson",
    createdDays: 10,
    created: "20 Jul 2026",
    updated: "24 Jul 2026",
    source: "Inbound",
    customer: {
      name: "John Smith",
      email: "j.smith@email.com",
      mobile: "07700 900123",
    },
    subject: "Vehicle repair delay — brake pads and oil change",
    description:
      "Customer reports that their vehicle has been at the dealership for 10 days for a brake pad replacement and oil change. No communication has been received and the work has not been completed.",
    timeline: [
      {
        id: "t5",
        type: "email",
        author: "Sarah Wilson",
        timestamp: "24 Jul 2026, 09:14",
        text: "Follow-up email sent. Parts arriving tomorrow.",
        emailId: "CC-1024",
      },
      {
        id: "t4",
        type: "call",
        author: "Sarah Wilson",
        timestamp: "21 Jul 2026, 09:45",
        text: "Inbound call from customer. Customer frustrated, workshop unable to locate parts.",
      },
      {
        id: "t3",
        type: "email",
        author: "Sarah Wilson",
        timestamp: "20 Jul 2026, 15:25",
        text: "Auto-acknowledgement email sent to customer.",
        emailId: "CC-1024",
      },
      {
        id: "t2",
        type: "assigned",
        author: "James Patterson",
        timestamp: "20 Jul 2026, 15:22",
        text: "Assigned to Sarah Wilson.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "20 Jul 2026, 15:10",
        text: "Complaint registered via customer portal.",
      },
    ],
  },
  {
    id: "CC-1023",
    status: "In Progress",
    category: "Service Quality",
    dealer: "Parkway Sheffield",
    vehicle: "GH22 KLM",
    assignedTo: "James Patterson",
    createdDays: 7,
    created: "17 Jul 2026",
    updated: "23 Jul 2026",
    source: "Inbound",
    customer: {
      name: "Emily Turner",
      email: "e.turner@webmail.com",
      mobile: "07700 900456",
    },
    subject: "Poor customer service during MOT appointment",
    description:
      "Customer reports being kept waiting for over 2 hours beyond the scheduled MOT appointment time with no updates provided by staff.",
    timeline: [
      {
        id: "t3",
        type: "call",
        author: "James Patterson",
        timestamp: "18 Jul 2026, 10:30",
        text: "Outbound call to customer. Apologised for wait time, investigating with service team.",
      },
      {
        id: "t2",
        type: "assigned",
        author: "System",
        timestamp: "17 Jul 2026, 11:05",
        text: "Assigned to James Patterson.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "17 Jul 2026, 11:00",
        text: "Complaint registered via telephone.",
      },
    ],
  },
  {
    id: "CC-1022",
    status: "Awaiting Customer",
    category: "Billing",
    dealer: "Parkway Derby",
    vehicle: "UV67 WXY",
    assignedTo: "Emma Clarke",
    createdDays: 12,
    created: "13 Jul 2026",
    updated: "23 Jul 2026",
    source: "Online Booking",
    customer: {
      name: "Michael Brown",
      email: "m.brown@outlook.com",
      mobile: "07700 900789",
    },
    subject: "Unauthorised £180 diagnostic charge on invoice",
    description:
      "Customer disputes a £180 diagnostic charge on their service invoice, stating they were never informed of or asked to authorise this additional work.",
    timeline: [
      {
        id: "t2",
        type: "email",
        author: "Emma Clarke",
        timestamp: "23 Jul 2026, 14:10",
        text: "Requested supporting documentation from customer.",
        emailId: "CC-1022",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "13 Jul 2026, 09:00",
        text: "Complaint registered via email.",
      },
    ],
  },
  {
    id: "CC-1021",
    status: "Pending",
    category: "Parts & Accessories",
    dealer: "Parkway Leeds",
    vehicle: "CD34 MNO",
    assignedTo: "David Hughes",
    createdDays: 5,
    created: "21 Jul 2026",
    updated: "22 Jul 2026",
    source: "Inbound",
    customer: {
      name: "Amanda White",
      email: "a.white@gmail.com",
      mobile: "07700 900987",
    },
    subject: "Non-OEM parts used without prior agreement",
    description:
      "Customer states that non-original manufacturer parts were fitted during a service without their knowledge or prior written agreement.",
    timeline: [
      {
        id: "t2",
        type: "assigned",
        author: "James Patterson",
        timestamp: "21 Jul 2026, 13:15",
        text: "Assigned to David Hughes.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "21 Jul 2026, 13:00",
        text: "Complaint received via telephone.",
      },
    ],
  },
  {
    id: "CC-1020",
    status: "Resolved",
    category: "Vehicle Quality",
    dealer: "Parkway Manchester",
    vehicle: "EF56 PQR",
    assignedTo: "Sarah Wilson",
    createdDays: 19,
    created: "5 Jul 2026",
    updated: "20 Jul 2026",
    source: "Inbound",
    customer: {
      name: "Paul Martin",
      email: "p.martin@business.co.uk",
      mobile: "07700 900111",
    },
    subject: "New damage found on vehicle after service",
    description:
      "Customer discovered a scratch on the driver-side door that was not present prior to a scheduled full service. Photographic check-in was not completed.",
    timeline: [
      {
        id: "t3",
        type: "status",
        author: "Sarah Wilson",
        timestamp: "20 Jul 2026, 16:00",
        text: "Status changed to Resolved. Paintwork repair completed. Customer satisfied.",
      },
      {
        id: "t2",
        type: "call",
        author: "Sarah Wilson",
        timestamp: "6 Jul 2026, 09:00",
        text: "Outbound call to customer. Damage confirmed. Agreed to paintwork rectification.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "5 Jul 2026, 10:00",
        text: "Complaint registered.",
      },
    ],
  },
  {
    id: "CC-1019",
    status: "Closed",
    category: "Customer Experience",
    dealer: "Parkway Sheffield",
    vehicle: "GH78 STU",
    assignedTo: "James Patterson",
    createdDays: 25,
    created: "29 Jun 2026",
    updated: "15 Jul 2026",
    source: "Online Booking",
    customer: {
      name: "Karen Davies",
      email: "k.davies@email.co.uk",
      mobile: "07700 900222",
    },
    subject: "Rude behaviour from service reception staff",
    description:
      "Customer reports dismissive and disrespectful treatment from a member of the service reception team during a routine tyre change appointment.",
    timeline: [
      {
        id: "t4",
        type: "status",
        author: "James Patterson",
        timestamp: "15 Jul 2026, 15:00",
        text: "Status changed to Closed. Customer confirmed satisfaction. No further action required.",
      },
      {
        id: "t3",
        type: "status",
        author: "James Patterson",
        timestamp: "10 Jul 2026, 11:00",
        text: "Status changed to Resolved. Staff retraining scheduled.",
      },
      {
        id: "t2",
        type: "email",
        author: "James Patterson",
        timestamp: "30 Jun 2026, 09:00",
        text: "Formal apology sent to customer.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "29 Jun 2026, 14:30",
        text: "Complaint received via online form.",
      },
    ],
  },
  {
    id: "CC-1018",
    status: "In Progress",
    category: "Warranty",
    dealer: "Parkway Leeds",
    vehicle: "IJ90 VWX",
    assignedTo: "Emma Clarke",
    createdDays: 18,
    created: "7 Jul 2026",
    updated: "21 Jul 2026",
    source: "Inbound",
    customer: {
      name: "Thomas Hall",
      email: "t.hall@enterprise.com",
      mobile: "07700 900333",
    },
    subject: "Warranty claim refused without adequate explanation",
    description:
      "Customer's warranty claim for a recurring engine fault was declined. Customer states the fault was reported within the warranty period and requests a formal review.",
    timeline: [
      {
        id: "t2",
        type: "note",
        author: "Emma Clarke",
        timestamp: "9 Jul 2026, 10:00",
        text: "Reviewed warranty documentation. Fault first reported 2 days before expiry. Escalating to warranty manager.",
      },
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "7 Jul 2026, 08:45",
        text: "Complaint escalated from service team.",
      },
    ],
  },
  {
    id: "CC-1017",
    status: "New",
    category: "Billing",
    dealer: "Parkway Manchester",
    vehicle: "KL12 YZA",
    assignedTo: "David Hughes",
    createdDays: 3,
    created: "23 Jul 2026",
    updated: "23 Jul 2026",
    source: "Inbound",
    customer: {
      name: "Sandra West",
      email: "s.west@mail.com",
      mobile: "07700 900444",
    },
    subject: "Overcharged on tyre replacement — invoice error",
    description:
      "Customer was charged for four premium tyres but only two were replaced. Invoice reflects £420 more than the agreed quote.",
    timeline: [
      {
        id: "t1",
        type: "created",
        author: "System",
        timestamp: "23 Jul 2026, 09:00",
        text: "Complaint received via telephone.",
      },
    ],
  },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────
const mkPt = (label: string, b: number) => ({
  label,
  new: b,
  inProgress: Math.round(b * 0.55),
  pending: Math.round(b * 0.38),
  awaitingCustomer: Math.round(b * 0.22),
  resolved: Math.round(b * 0.78),
  closed: Math.round(b * 0.14),
});

const TREND_DATA: Record<DateRange, ReturnType<typeof mkPt>[]> = {
  Yesterday: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((h, i) =>
    mkPt(`${h}:00`, [3, 5, 4, 6, 7, 5, 8, 6, 9, 7][i]),
  ),
  WTD: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) =>
    mkPt(d, [18, 22, 19, 25, 21][i]),
  ),
  MTD: Array.from({ length: 24 }, (_, i) =>
    mkPt(`${i + 1}`, 10 + ((i * 7) % 23)),
  ),
  "28 Days": Array.from({ length: 28 }, (_, i) =>
    mkPt(`${i + 1}`, 8 + ((i * 9) % 27)),
  ),
  "Prev Month": Array.from({ length: 30 }, (_, i) =>
    mkPt(`${i + 1}`, 12 + ((i * 7) % 20)),
  ),
  QTD: Array.from({ length: 13 }, (_, i) =>
    mkPt(
      `Wk ${i + 1}`,
      [87, 92, 79, 101, 95, 88, 104, 97, 91, 98, 102, 96, 89][i],
    ),
  ),
  YTD: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) =>
    mkPt(m, [312, 289, 334, 301, 356, 328, 198][i]),
  ),
};

const STATUS_LINE_COLORS: Record<string, string> = {
  new: "#1d4ed8",
  inProgress: "#6366f1",
  pending: "#f59e0b",
  awaitingCustomer: "#8b5cf6",
  resolved: "#10b981",
  closed: "#6b7280",
};

const PIE_COLORS = [
  "#1d4ed8",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const CATEGORY_DATA = [
  { name: "Vehicle Quality", count: 34 },
  { name: "Service Quality", count: 27 },
  { name: "Billing", count: 19 },
  { name: "Customer Exp.", count: 15 },
  { name: "Parts", count: 12 },
  { name: "Warranty", count: 9 },
];

interface DashboardPeriod {
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
  agingBrackets: { label: string; count: number; text: string; bg: string }[];
}

const DASHBOARD_DATA: Record<DateRange, DashboardPeriod> = {
  Yesterday: {
    kpis: {
      total: 32,
      newC: 8,
      awaiting: 5,
      avgResolution: "3.5d",
      totalDelta: "+2 vs prev day",
      newDelta: "+1 today",
      awaitingDelta: "2+ days pending",
      resDelta: "-0.4d vs prev",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 9 },
      { name: "Service Quality", count: 7 },
      { name: "Billing", count: 5 },
      { name: "Customer Exp.", count: 4 },
      { name: "Parts", count: 4 },
      { name: "Warranty", count: 3 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 16,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 9,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 5,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 2, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  WTD: {
    kpis: {
      total: 87,
      newC: 24,
      awaiting: 14,
      avgResolution: "3.9d",
      totalDelta: "+6 vs last week",
      newDelta: "+3 this week",
      awaitingDelta: "4+ days pending",
      resDelta: "-0.2d vs prev",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 23 },
      { name: "Service Quality", count: 19 },
      { name: "Billing", count: 14 },
      { name: "Customer Exp.", count: 11 },
      { name: "Parts", count: 11 },
      { name: "Warranty", count: 9 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 38,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 26,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 16,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 7, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  MTD: {
    kpis: {
      total: 248,
      newC: 54,
      awaiting: 37,
      avgResolution: "4.8d",
      totalDelta: "+12 vs last month",
      newDelta: "+4 this week",
      awaitingDelta: "5+ days pending",
      resDelta: "-0.3d vs prev",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 34 },
      { name: "Service Quality", count: 27 },
      { name: "Billing", count: 19 },
      { name: "Customer Exp.", count: 15 },
      { name: "Parts", count: 12 },
      { name: "Warranty", count: 9 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 45,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 28,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 19,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 8, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  "28 Days": {
    kpis: {
      total: 312,
      newC: 68,
      awaiting: 44,
      avgResolution: "5.1d",
      totalDelta: "+18 vs prev 28d",
      newDelta: "+6 this period",
      awaitingDelta: "5+ days pending",
      resDelta: "+0.3d vs prev",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 44 },
      { name: "Service Quality", count: 35 },
      { name: "Billing", count: 26 },
      { name: "Customer Exp.", count: 20 },
      { name: "Parts", count: 16 },
      { name: "Warranty", count: 13 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 58,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 37,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 24,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 11, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  "Prev Month": {
    kpis: {
      total: 364,
      newC: 78,
      awaiting: 52,
      avgResolution: "5.4d",
      totalDelta: "+22 vs month before",
      newDelta: "+8 that month",
      awaitingDelta: "6+ days pending",
      resDelta: "+0.6d vs prev",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 51 },
      { name: "Service Quality", count: 41 },
      { name: "Billing", count: 30 },
      { name: "Customer Exp.", count: 23 },
      { name: "Parts", count: 19 },
      { name: "Warranty", count: 14 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 66,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 43,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 29,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 14, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  QTD: {
    kpis: {
      total: 892,
      newC: 198,
      awaiting: 127,
      avgResolution: "5.0d",
      totalDelta: "+44 vs prev Q",
      newDelta: "+19 this Q",
      awaitingDelta: "5+ days pending",
      resDelta: "-0.1d vs prev Q",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 142 },
      { name: "Service Quality", count: 115 },
      { name: "Billing", count: 83 },
      { name: "Customer Exp.", count: 64 },
      { name: "Parts", count: 51 },
      { name: "Warranty", count: 38 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 187,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 121,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 83,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 42, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
  YTD: {
    kpis: {
      total: 2118,
      newC: 467,
      awaiting: 298,
      avgResolution: "5.2d",
      totalDelta: "+134 vs last year",
      newDelta: "+41 YTD",
      awaitingDelta: "5+ days pending",
      resDelta: "+0.4d vs prev Y",
    },
    categoryData: [
      { name: "Vehicle Quality", count: 487 },
      { name: "Service Quality", count: 391 },
      { name: "Billing", count: 278 },
      { name: "Customer Exp.", count: 219 },
      { name: "Parts", count: 163 },
      { name: "Warranty", count: 118 },
    ],
    agingBrackets: [
      {
        label: "0–3 days",
        count: 521,
        text: "text-green-700",
        bg: "bg-green-100",
      },
      {
        label: "4–7 days",
        count: 338,
        text: "text-amber-700",
        bg: "bg-amber-100",
      },
      {
        label: "8–14 days",
        count: 231,
        text: "text-orange-700",
        bg: "bg-orange-100",
      },
      { label: "15+ days", count: 98, text: "text-red-700", bg: "bg-red-100" },
    ],
  },
};

interface ReportsKpi {
  value: string;
  delta: string;
  trendUp: boolean;
  trendGood: boolean;
}
interface ReportsPeriod {
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
}

const REPORTS_DATA: Record<DateRange, ReportsPeriod> = {
  Yesterday: {
    kpis: {
      firstResponse: {
        value: "2.1h",
        delta: "-0.4h vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionTime: {
        value: "3.5d",
        delta: "-0.9d vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionRate: {
        value: "88%",
        delta: "+5% vs prev",
        trendUp: true,
        trendGood: true,
      },
    },
    areaData: [
      { label: "08:00", complaints: 3, resolved: 2 },
      { label: "10:00", complaints: 7, resolved: 6 },
      { label: "12:00", complaints: 5, resolved: 5 },
      { label: "14:00", complaints: 9, resolved: 8 },
      { label: "16:00", complaints: 6, resolved: 6 },
      { label: "18:00", complaints: 2, resolved: 2 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 4 },
      { name: "Service Quality", count: 3 },
      { name: "Billing", count: 2 },
      { name: "Customer Exp.", count: 2 },
      { name: "Parts", count: 1 },
      { name: "Warranty", count: 1 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 1,
        inProgress: 2,
        pending: 1,
        awaitingCustomer: 1,
        resolved: 5,
        closed: 3,
      },
      {
        name: "Sheffield",
        New: 1,
        inProgress: 1,
        pending: 1,
        awaitingCustomer: 0,
        resolved: 4,
        closed: 2,
      },
      {
        name: "Leeds",
        New: 0,
        inProgress: 1,
        pending: 0,
        awaitingCustomer: 1,
        resolved: 3,
        closed: 2,
      },
      {
        name: "Manchester",
        New: 2,
        inProgress: 1,
        pending: 1,
        awaitingCustomer: 1,
        resolved: 4,
        closed: 2,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 3.8 },
      { dealer: "Sheffield", days: 4.5 },
      { dealer: "Leeds", days: 3.2 },
      { dealer: "Manchester", days: 5.1 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 2, resolved: 6, avgDays: 3.5, sla: 91 },
      { name: "James Patterson", new: 1, resolved: 4, avgDays: 4.2, sla: 78 },
      { name: "Emma Clarke", new: 3, resolved: 5, avgDays: 3.1, sla: 94 },
      { name: "David Hughes", new: 1, resolved: 3, avgDays: 4.8, sla: 71 },
    ],
  },
  WTD: {
    kpis: {
      firstResponse: {
        value: "2.8h",
        delta: "-0.5h vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionTime: {
        value: "4.1d",
        delta: "-0.5d vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionRate: {
        value: "85%",
        delta: "+3% vs prev",
        trendUp: true,
        trendGood: true,
      },
    },
    areaData: [
      { label: "Mon", complaints: 18, resolved: 15 },
      { label: "Tue", complaints: 22, resolved: 19 },
      { label: "Wed", complaints: 19, resolved: 17 },
      { label: "Thu", complaints: 25, resolved: 22 },
      { label: "Fri", complaints: 21, resolved: 18 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 22 },
      { name: "Service Quality", count: 18 },
      { name: "Billing", count: 13 },
      { name: "Customer Exp.", count: 10 },
      { name: "Parts", count: 8 },
      { name: "Warranty", count: 6 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 4,
        inProgress: 4,
        pending: 3,
        awaitingCustomer: 2,
        resolved: 10,
        closed: 7,
      },
      {
        name: "Sheffield",
        New: 3,
        inProgress: 3,
        pending: 2,
        awaitingCustomer: 2,
        resolved: 9,
        closed: 5,
      },
      {
        name: "Leeds",
        New: 2,
        inProgress: 3,
        pending: 2,
        awaitingCustomer: 1,
        resolved: 7,
        closed: 5,
      },
      {
        name: "Manchester",
        New: 4,
        inProgress: 3,
        pending: 3,
        awaitingCustomer: 2,
        resolved: 8,
        closed: 6,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.0 },
      { dealer: "Sheffield", days: 5.2 },
      { dealer: "Leeds", days: 3.7 },
      { dealer: "Manchester", days: 5.9 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 6, resolved: 16, avgDays: 3.9, sla: 87 },
      { name: "James Patterson", new: 5, resolved: 13, avgDays: 4.7, sla: 73 },
      { name: "Emma Clarke", new: 7, resolved: 15, avgDays: 3.6, sla: 90 },
      { name: "David Hughes", new: 4, resolved: 10, avgDays: 5.3, sla: 67 },
    ],
  },
  MTD: {
    kpis: {
      firstResponse: {
        value: "3.2h",
        delta: "-0.8h vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionTime: {
        value: "4.8d",
        delta: "-0.3d vs prev",
        trendUp: false,
        trendGood: true,
      },
      resolutionRate: {
        value: "82%",
        delta: "+2% vs prev",
        trendUp: true,
        trendGood: true,
      },
    },
    areaData: [
      { label: "1 Jul", complaints: 42, resolved: 38 },
      { label: "5 Jul", complaints: 51, resolved: 46 },
      { label: "10 Jul", complaints: 48, resolved: 44 },
      { label: "15 Jul", complaints: 55, resolved: 50 },
      { label: "20 Jul", complaints: 49, resolved: 45 },
      { label: "25 Jul", complaints: 53, resolved: 48 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 34 },
      { name: "Service Quality", count: 27 },
      { name: "Billing", count: 19 },
      { name: "Customer Exp.", count: 15 },
      { name: "Parts", count: 12 },
      { name: "Warranty", count: 9 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 8,
        inProgress: 7,
        pending: 5,
        awaitingCustomer: 4,
        resolved: 18,
        closed: 12,
      },
      {
        name: "Sheffield",
        New: 6,
        inProgress: 5,
        pending: 4,
        awaitingCustomer: 3,
        resolved: 15,
        closed: 10,
      },
      {
        name: "Leeds",
        New: 5,
        inProgress: 4,
        pending: 3,
        awaitingCustomer: 3,
        resolved: 13,
        closed: 9,
      },
      {
        name: "Manchester",
        New: 7,
        inProgress: 6,
        pending: 4,
        awaitingCustomer: 4,
        resolved: 14,
        closed: 11,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.2 },
      { dealer: "Sheffield", days: 5.8 },
      { dealer: "Leeds", days: 3.9 },
      { dealer: "Manchester", days: 6.4 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 12, resolved: 34, avgDays: 4.2, sla: 85 },
      { name: "James Patterson", new: 9, resolved: 28, avgDays: 5.1, sla: 71 },
      { name: "Emma Clarke", new: 14, resolved: 31, avgDays: 3.9, sla: 88 },
      { name: "David Hughes", new: 7, resolved: 22, avgDays: 5.8, sla: 64 },
    ],
  },
  "28 Days": {
    kpis: {
      firstResponse: {
        value: "3.5h",
        delta: "+0.2h vs prev",
        trendUp: true,
        trendGood: false,
      },
      resolutionTime: {
        value: "5.1d",
        delta: "+0.4d vs prev",
        trendUp: true,
        trendGood: false,
      },
      resolutionRate: {
        value: "79%",
        delta: "-1% vs prev",
        trendUp: false,
        trendGood: false,
      },
    },
    areaData: [
      { label: "Jun 30", complaints: 38, resolved: 33 },
      { label: "Jul 4", complaints: 45, resolved: 39 },
      { label: "Jul 8", complaints: 52, resolved: 47 },
      { label: "Jul 12", complaints: 48, resolved: 43 },
      { label: "Jul 16", complaints: 56, resolved: 50 },
      { label: "Jul 20", complaints: 51, resolved: 46 },
      { label: "Jul 24", complaints: 47, resolved: 42 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 58 },
      { name: "Service Quality", count: 47 },
      { name: "Billing", count: 33 },
      { name: "Customer Exp.", count: 26 },
      { name: "Parts", count: 21 },
      { name: "Warranty", count: 15 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 14,
        inProgress: 12,
        pending: 9,
        awaitingCustomer: 7,
        resolved: 31,
        closed: 21,
      },
      {
        name: "Sheffield",
        New: 11,
        inProgress: 9,
        pending: 7,
        awaitingCustomer: 6,
        resolved: 26,
        closed: 18,
      },
      {
        name: "Leeds",
        New: 9,
        inProgress: 8,
        pending: 6,
        awaitingCustomer: 5,
        resolved: 23,
        closed: 16,
      },
      {
        name: "Manchester",
        New: 12,
        inProgress: 10,
        pending: 8,
        awaitingCustomer: 7,
        resolved: 25,
        closed: 19,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.5 },
      { dealer: "Sheffield", days: 6.1 },
      { dealer: "Leeds", days: 4.1 },
      { dealer: "Manchester", days: 6.8 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 21, resolved: 58, avgDays: 4.4, sla: 83 },
      { name: "James Patterson", new: 16, resolved: 47, avgDays: 5.4, sla: 69 },
      { name: "Emma Clarke", new: 24, resolved: 54, avgDays: 4.0, sla: 86 },
      { name: "David Hughes", new: 13, resolved: 38, avgDays: 6.1, sla: 62 },
    ],
  },
  "Prev Month": {
    kpis: {
      firstResponse: {
        value: "4.0h",
        delta: "+0.8h vs prev",
        trendUp: true,
        trendGood: false,
      },
      resolutionTime: {
        value: "5.1d",
        delta: "+0.3d vs prev",
        trendUp: true,
        trendGood: false,
      },
      resolutionRate: {
        value: "80%",
        delta: "-2% vs prev",
        trendUp: false,
        trendGood: false,
      },
    },
    areaData: [
      { label: "1 Jun", complaints: 45, resolved: 40 },
      { label: "5 Jun", complaints: 52, resolved: 47 },
      { label: "10 Jun", complaints: 49, resolved: 44 },
      { label: "15 Jun", complaints: 58, resolved: 53 },
      { label: "20 Jun", complaints: 53, resolved: 48 },
      { label: "25 Jun", complaints: 56, resolved: 50 },
      { label: "30 Jun", complaints: 51, resolved: 46 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 41 },
      { name: "Service Quality", count: 33 },
      { name: "Billing", count: 24 },
      { name: "Customer Exp.", count: 18 },
      { name: "Parts", count: 14 },
      { name: "Warranty", count: 11 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 10,
        inProgress: 9,
        pending: 7,
        awaitingCustomer: 5,
        resolved: 22,
        closed: 16,
      },
      {
        name: "Sheffield",
        New: 8,
        inProgress: 7,
        pending: 5,
        awaitingCustomer: 4,
        resolved: 19,
        closed: 13,
      },
      {
        name: "Leeds",
        New: 7,
        inProgress: 6,
        pending: 5,
        awaitingCustomer: 4,
        resolved: 17,
        closed: 12,
      },
      {
        name: "Manchester",
        New: 9,
        inProgress: 8,
        pending: 6,
        awaitingCustomer: 5,
        resolved: 18,
        closed: 14,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.8 },
      { dealer: "Sheffield", days: 6.3 },
      { dealer: "Leeds", days: 4.4 },
      { dealer: "Manchester", days: 7.1 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 15, resolved: 42, avgDays: 4.6, sla: 81 },
      { name: "James Patterson", new: 11, resolved: 35, avgDays: 5.7, sla: 68 },
      { name: "Emma Clarke", new: 17, resolved: 39, avgDays: 4.3, sla: 84 },
      { name: "David Hughes", new: 9, resolved: 29, avgDays: 6.4, sla: 60 },
    ],
  },
  QTD: {
    kpis: {
      firstResponse: {
        value: "3.4h",
        delta: "-0.3h vs prev Q",
        trendUp: false,
        trendGood: true,
      },
      resolutionTime: {
        value: "4.9d",
        delta: "-0.2d vs prev Q",
        trendUp: false,
        trendGood: true,
      },
      resolutionRate: {
        value: "81%",
        delta: "+1% vs prev Q",
        trendUp: true,
        trendGood: true,
      },
    },
    areaData: [
      { label: "W1 Apr", complaints: 88, resolved: 79 },
      { label: "W3 Apr", complaints: 97, resolved: 87 },
      { label: "W1 May", complaints: 104, resolved: 96 },
      { label: "W3 May", complaints: 112, resolved: 103 },
      { label: "W1 Jun", complaints: 99, resolved: 91 },
      { label: "W3 Jun", complaints: 108, resolved: 98 },
      { label: "W1 Jul", complaints: 74, resolved: 67 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 112 },
      { name: "Service Quality", count: 89 },
      { name: "Billing", count: 64 },
      { name: "Customer Exp.", count: 51 },
      { name: "Parts", count: 38 },
      { name: "Warranty", count: 28 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 24,
        inProgress: 20,
        pending: 15,
        awaitingCustomer: 12,
        resolved: 58,
        closed: 42,
      },
      {
        name: "Sheffield",
        New: 19,
        inProgress: 16,
        pending: 12,
        awaitingCustomer: 9,
        resolved: 48,
        closed: 35,
      },
      {
        name: "Leeds",
        New: 16,
        inProgress: 14,
        pending: 11,
        awaitingCustomer: 9,
        resolved: 42,
        closed: 31,
      },
      {
        name: "Manchester",
        New: 21,
        inProgress: 18,
        pending: 14,
        awaitingCustomer: 11,
        resolved: 50,
        closed: 38,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.3 },
      { dealer: "Sheffield", days: 5.9 },
      { dealer: "Leeds", days: 4.0 },
      { dealer: "Manchester", days: 6.6 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 38, resolved: 108, avgDays: 4.3, sla: 84 },
      { name: "James Patterson", new: 29, resolved: 87, avgDays: 5.3, sla: 70 },
      { name: "Emma Clarke", new: 43, resolved: 98, avgDays: 4.0, sla: 87 },
      { name: "David Hughes", new: 23, resolved: 71, avgDays: 5.9, sla: 63 },
    ],
  },
  YTD: {
    kpis: {
      firstResponse: {
        value: "3.8h",
        delta: "+0.4h vs prev Y",
        trendUp: true,
        trendGood: false,
      },
      resolutionTime: {
        value: "5.3d",
        delta: "+0.6d vs prev Y",
        trendUp: true,
        trendGood: false,
      },
      resolutionRate: {
        value: "78%",
        delta: "-3% vs prev Y",
        trendUp: false,
        trendGood: false,
      },
    },
    areaData: [
      { label: "Jan", complaints: 312, resolved: 287 },
      { label: "Feb", complaints: 289, resolved: 271 },
      { label: "Mar", complaints: 334, resolved: 308 },
      { label: "Apr", complaints: 301, resolved: 279 },
      { label: "May", complaints: 356, resolved: 331 },
      { label: "Jun", complaints: 328, resolved: 302 },
      { label: "Jul", complaints: 198, resolved: 173 },
    ],
    categoryData: [
      { name: "Vehicle Quality", count: 487 },
      { name: "Service Quality", count: 391 },
      { name: "Billing", count: 278 },
      { name: "Customer Exp.", count: 219 },
      { name: "Parts", count: 163 },
      { name: "Warranty", count: 118 },
    ],
    dealerData: [
      {
        name: "Derby",
        New: 98,
        inProgress: 82,
        pending: 63,
        awaitingCustomer: 51,
        resolved: 241,
        closed: 173,
      },
      {
        name: "Sheffield",
        New: 79,
        inProgress: 65,
        pending: 51,
        awaitingCustomer: 40,
        resolved: 199,
        closed: 143,
      },
      {
        name: "Leeds",
        New: 67,
        inProgress: 56,
        pending: 44,
        awaitingCustomer: 36,
        resolved: 174,
        closed: 124,
      },
      {
        name: "Manchester",
        New: 88,
        inProgress: 73,
        pending: 57,
        awaitingCustomer: 46,
        resolved: 214,
        closed: 158,
      },
    ],
    resolutionData: [
      { dealer: "Derby", days: 4.7 },
      { dealer: "Sheffield", days: 6.5 },
      { dealer: "Leeds", days: 4.4 },
      { dealer: "Manchester", days: 7.3 },
    ],
    agentData: [
      { name: "Sarah Wilson", new: 156, resolved: 441, avgDays: 4.6, sla: 82 },
      {
        name: "James Patterson",
        new: 121,
        resolved: 356,
        avgDays: 5.6,
        sla: 68,
      },
      { name: "Emma Clarke", new: 178, resolved: 402, avgDays: 4.2, sla: 85 },
      { name: "David Hughes", new: 97, resolved: 291, avgDays: 6.2, sla: 61 },
    ],
  },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "warning",
    title: "SLA Breach — CC-1018",
    body: "CC-1018 has exceeded the 14-day resolution target.",
    time: "2m ago",
    read: false,
    complaintId: "CC-1018",
  },
  {
    id: "n2",
    type: "info",
    title: "CC-1022 awaiting response",
    body: "No customer response received for 5 days.",
    time: "1h ago",
    read: false,
    complaintId: "CC-1022",
  },
  {
    id: "n3",
    type: "success",
    title: "CC-1020 resolved",
    body: "Paul Martin paintwork complaint resolved.",
    time: "4h ago",
    read: false,
    complaintId: "CC-1020",
  },
  {
    id: "n4",
    type: "warning",
    title: "CC-1017 not assigned",
    body: "New complaint has not been assigned to an agent.",
    time: "1d ago",
    read: true,
    complaintId: "CC-1017",
  },
  {
    id: "n5",
    type: "info",
    title: "New complaint received",
    body: "CC-1024 submitted via online portal.",
    time: "2d ago",
    read: true,
    complaintId: "CC-1024",
  },
  {
    id: "n6",
    type: "success",
    title: "CC-1019 closed",
    body: "Karen Davies complaint fully closed.",
    time: "3d ago",
    read: true,
    complaintId: "CC-1019",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getXAxisInterval = (len: number) => {
  if (len <= 10) return 0;
  if (len <= 20) return 1;
  if (len <= 31) return 2;
  return Math.floor(len / 6);
};
const nowStamp = () => {
  const d = new Date();
  return `${d.getDate()} Jul, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const STATUS_STYLES: Record<Status, string> = {
  New: "bg-blue-50 text-blue-700 border border-blue-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  "Awaiting Customer": "bg-purple-50 text-purple-700 border border-purple-200",
  Resolved: "bg-green-50 text-green-700 border border-green-200",
  Closed: "bg-gray-100 text-gray-600 border border-gray-200",
};

const TIMELINE_CFG: Record<
  string,
  {
    icon: (p: { size: number; className: string }) => ReactNode;
    iconBg: string;
    iconColor: string;
  }
> = {
  note: {
    icon: (p) => <MessageSquare {...p} />,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  call: {
    icon: (p) => <Phone {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  phone: {
    icon: (p) => <Phone {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  email: {
    icon: (p) => <Mail {...p} />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  status: {
    icon: (p) => <Activity {...p} />,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  reopen: {
    icon: (p) => <RefreshCcwDot {...p} />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  resolved: {
    icon: (p) => <CheckCircle2 {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  closed: {
    icon: (p) => <X {...p} />,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-700",
  },
  created: {
    icon: (p) => <PlusCircle {...p} />,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
  },
  assigned: {
    icon: (p) => <UserCheck {...p} />,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
};

const ALL_STATUSES: Status[] = [
  "New",
  "In Progress",
  "Pending",
  "Awaiting Customer",
  "Resolved",
  "Closed",
];
const ALL_CATEGORIES = [
  "Vehicle Quality",
  "Service Quality",
  "Billing",
  "Customer Experience",
  "Parts & Accessories",
  "Warranty",
];
const ALL_AGENTS = [
  "Sarah Wilson",
  "James Patterson",
  "Emma Clarke",
  "David Hughes",
];

// ─── UI Primitives ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden max-w-full ${STATUS_STYLES[status]}`}
      style={{ textOverflow: "ellipsis", display: "inline-flex" }}
    >
      {status}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function ChartLegend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-[11px] text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const isPie = payload.length === 1 && label === payload[0].name;
  const total =
    !isPie && payload.length > 1
      ? payload.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0)
      : null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        minWidth: 180,
      }}
    >
      {label && (
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#111827",
            marginBottom: isPie ? 4 : 8,
          }}
        >
          {label}
        </p>
      )}
      {isPie ? (
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {payload[0].value}
        </p>
      ) : (
        payload.map((entry: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                color: "#374151",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: entry.color ?? entry.fill,
                  flexShrink: 0,
                }}
              />
              {entry.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>
              {entry.value}
            </span>
          </div>
        ))
      )}
      {total !== null && (
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            marginTop: 6,
            paddingTop: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
            Total
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
            {total}
          </span>
        </div>
      )}
    </div>
  );
}

function RequiredLabel({
  children,
  label,
}: {
  children?: ReactNode;
  label?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {label ?? children} <span className="text-red-500">*</span>
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  return (
    <span
      className={`text-xs ${pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-muted-foreground"}`}
    >
      {current}/{max}
    </span>
  );
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: string;
  sortKey: string;
  sortDir: SortDir;
}) {
  if (col !== sortKey)
    return (
      <ArrowUpDown size={11} className="text-muted-foreground opacity-40" />
    );
  return sortDir === "asc" ? (
    <ArrowUp size={11} className="text-primary" />
  ) : (
    <ArrowDown size={11} className="text-primary" />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 24, 30];

// ─── Mini Select (custom dropdown for small controls) ─────────────────────────
function MiniSelect<T extends string | number>({
  value,
  options,
  onChange,
  renderLabel,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  renderLabel?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = renderLabel ? renderLabel(value) : String(value);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-card transition-all
          ${open ? "border-primary ring-1 ring-primary/20 text-primary bg-primary/5" : "border-border text-foreground hover:border-primary hover:bg-muted"}`}
      >
        {label}
        <ChevronDown
          size={11}
          className={`text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-[500] mt-1.5 right-0 bg-card border border-border rounded-md shadow-md overflow-hidden ring-1 ring-black/5 min-w-[1rem] max-w-[fit-content]">
          <div className="px-1.5 py-1.5 flex flex-col gap-0.5">
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs text-left transition-all
                    ${selected ? "bg-primary text-white font-semibold" : "text-foreground hover:bg-muted"}`}
                >
                  {renderLabel ? renderLabel(opt) : String(opt)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
  onPageSizeChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
}) {
  if (total <= 5) return null;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {start}–{end} of {total}
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Per page:</span>
            <MiniSelect
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(v) => onPageSizeChange(Number(v))}
            />
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`w-7 h-7 text-xs rounded border transition-colors ${page === i + 1 ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Multi-Select Dropdown ────────────────────────────────────────────────────
// ─── Searchable Single Select ─────────────────────────────────────────────────
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(q.toLowerCase()),
  );

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
          setQ("");
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs border rounded-lg bg-card text-left transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-muted cursor-pointer"}
          ${error ? "border-red-400" : open ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
      >
        {/* <Search size={11} className="text-muted-foreground flex-shrink-0" /> */}
        <span
          className={`flex-1 truncate ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value || placeholder || "Select…"}
        </span>
        {value && !disabled && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={11} />
          </span>
        )}
        <ChevronDown
          size={11}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl overflow-hidden ring-1 ring-black/5">
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background transition-all">
              <Search
                size={12}
                className="text-muted-foreground flex-shrink-0"
              />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
          {/* Options list */}
          <div className="max-h-52 overflow-y-auto px-1.5 pb-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <Search size={16} className="text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  No results for &ldquo;{q}&rdquo;
                </p>
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-all
                  ${
                    value === opt
                      ? "bg-primary text-white font-medium shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                  ${value === opt ? "border-white/50 bg-white/20" : "border-border"}`}
                  >
                    {value === opt && <Check size={9} className="text-white" />}
                  </span>
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(q.toLowerCase()),
  );
  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    );

  return (
    <div ref={ref} className="relative">
      {/* Trigger — search icon signals searchability */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setQ("");
        }}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg bg-card hover:bg-muted transition-colors min-w-36 ${open ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
      >
        {/* <Search size={11} className="text-muted-foreground flex-shrink-0" /> */}
        <span className="flex-1 text-left truncate text-foreground">
          {selected.length === 0
            ? `All ${label}`
            : `${label} (${selected.length})`}
        </span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 bg-card border border-border rounded-lg shadow-2xl min-w-56 overflow-hidden ring-1 ring-black/5">
          {/* Header + search */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {label}
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background transition-all">
              <Search
                size={12}
                className="text-muted-foreground flex-shrink-0"
              />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto px-1.5 pb-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <Search size={16} className="text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  No results for &ldquo;{q}&rdquo;
                </p>
              </div>
            ) : (
              filtered.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${checked ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-primary border-primary shadow-sm" : "border-border"}`}
                    >
                      {checked && (
                        <Check
                          size={9}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs flex-1 ${checked ? "font-medium" : ""}`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="border-t border-border mx-1.5 mb-1.5 px-3 py-2 flex items-center justify-between rounded-b-xl bg-muted/30">
              <span className="text-[11px] text-muted-foreground font-medium">
                {selected.length} selected
              </span>
              <button
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                  setQ("");
                }}
                className="text-[11px] text-primary hover:text-primary/70 font-semibold transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Customer Search ──────────────────────────────────────────────────────────
function CustomerSearch({
  onSelect,
  onSearchStart,
}: {
  onSelect: (c: Customer) => void;
  onSearchStart?: () => void;
}) {
  const [mode, setMode] = useState<"email-mobile" | "postcode-lastname">(
    "email-mobile",
  );
  // Mode 1
  const [emailMobile, setEmailMobile] = useState("");
  // Mode 2
  const [postcode, setPostcode] = useState("");
  const [lastname, setLastname] = useState("");
  // State
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Customer[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  // New customer form
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newPostcode, setNewPostcode] = useState("");
  const [newVehicles, setNewVehicles] = useState<string[]>([""]);
  const setVehicleAt = (i: number, v: string) =>
    setNewVehicles((prev) =>
      prev.map((x, idx) => (idx === i ? v.toUpperCase() : x)),
    );
  const addVehicleRow = () => setNewVehicles((prev) => [...prev, ""]);
  const removeVehicleRow = (i: number) =>
    setNewVehicles((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i),
    );

  const runSearch = () => {
    setShowNewForm(false);
    onSearchStart?.();
    let found: Customer[] = [];
    if (mode === "email-mobile") {
      const q = emailMobile.trim().toLowerCase();
      if (!q) return;
      found = CUSTOMER_DB.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
      );
    } else {
      const pc = postcode.trim().toLowerCase();
      const sn = lastname.trim().toLowerCase();
      if (!pc && !sn) return;
      found = CUSTOMER_DB.filter((c) => {
        const matchPc = !pc || (c.postcode ?? "").toLowerCase().includes(pc);
        const matchSn =
          !sn || c.name.split(" ").pop()!.toLowerCase().includes(sn);
        return matchPc && matchSn;
      });
    }
    setResults(found);
    setSearched(true);
  };

  const reset = () => {
    setEmailMobile("");
    setPostcode("");
    setLastname("");
    setResults([]);
    setSearched(false);
    setShowNewForm(false);
    setNewFirst("");
    setNewLast("");
    setNewEmail("");
    setNewMobile("");
    setNewPostcode("");
    setNewVehicles([""]);
  };

  const handleAddNew = () => {
    const id = `CUST-${Math.floor(6300 + Math.random() * 900)}`;
    const c: Customer = {
      id,
      name: `${newFirst} ${newLast}`.trim(),
      email: newEmail,
      mobile: newMobile,
      vehicles: newVehicles.map((v) => v.trim()).filter(Boolean),
      postcode: newPostcode,
    };
    CUSTOMER_DB.push(c);
    onSelect(c);
    reset();
    toast.success("New customer added and selected.");
  };

  const newFormValid =
    newFirst.trim() && newLast.trim() && newEmail.trim() && newMobile.trim();

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30 p-1 gap-1">
        {(
          [
            ["email-mobile", "Email / Mobile", Mail],
            ["postcode-lastname", "Postcode & Lastname", MapPin],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m as typeof mode);
              reset();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all
              ${mode === m ? "bg-card text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <div className="flex gap-2">
        {mode === "email-mobile" ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            {/* <Search size={12} className="text-muted-foreground flex-shrink-0" /> */}
            <input
              value={emailMobile}
              onChange={(e) => setEmailMobile(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && emailMobile.trim() && runSearch()
              }
              placeholder="Enter email address or mobile number…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            {emailMobile && (
              <button type="button" onClick={reset}>
                <X
                  size={11}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all w-36">
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  postcode.trim() &&
                  lastname.trim() &&
                  runSearch()
                }
                placeholder="Postcode…"
                className="w-full text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <input
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  postcode.trim() &&
                  lastname.trim() &&
                  runSearch()
                }
                placeholder="Lastname…"
                className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={runSearch}
          disabled={
            mode === "email-mobile"
              ? !emailMobile.trim()
              : !postcode.trim() || !lastname.trim()
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={12} />
          Search
        </button>
      </div>

      {/* Results / New customer form */}
      {searched && (
        <div className="rounded-lg border border-border overflow-hidden shadow-sm">
          {showNewForm ? (
            <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">
                New Customer Details
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    ["First Name", newFirst, setNewFirst],
                    ["Last Name", newLast, setNewLast],
                  ] as const
                ).map(([label, val, set]) => (
                  <div key={label}>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Postcode
                  </label>
                  <input
                    value={newPostcode}
                    onChange={(e) => setNewPostcode(e.target.value)}
                    placeholder="e.g. DE1 3AT"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-muted-foreground">
                      Vehicle Registrations
                    </label>
                    <button
                      type="button"
                      onClick={addVehicleRow}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Plus size={11} />
                      Add another
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newVehicles.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                          <Car
                            size={11}
                            className="text-muted-foreground flex-shrink-0"
                          />
                          <input
                            value={v}
                            onChange={(e) => setVehicleAt(i, e.target.value)}
                            placeholder="e.g. AB12 XYZ"
                            className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground uppercase tracking-widest"
                          />
                        </div>
                        {(newVehicles.length > 1 || v) && (
                          <button
                            type="button"
                            onClick={() => removeVehicleRow(i)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNew}
                  disabled={!newFormValid}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Plus size={12} />
                  Add & Select Customer
                </button>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border max-h-52 overflow-y-auto">
              <div className="px-4 py-2 bg-muted/40 border-b border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {results.length} customer{results.length > 1 ? "s" : ""} found
                </p>
              </div>
              {results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    reset();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.email} · {c.mobile}
                    </p>
                    {c.postcode && (
                      <p className="text-[11px] text-muted-foreground">
                        {c.postcode}
                        {c.vehicles.length > 0
                          ? ` · ${c.vehicles.join(", ")}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <User size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                No customers found
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                No match for your search. Add them as a new customer.
              </p>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors mx-auto border border-primary/20"
              >
                <Plus size={12} />
                Add New Customer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared Rich Text Editor ──────────────────────────────────────────────────
const FONT_SIZES = [
  "10",
  "11",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "32",
  "36",
  "48",
];
const TEXT_COLORS = [
  "#111827",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];
const BG_COLORS = [
  "transparent",
  "#fef9c3",
  "#dcfce7",
  "#dbeafe",
  "#fce7f3",
  "#ffe4e6",
  "#f3e8ff",
  "#ffedd5",
  "#374151",
];

function RichEditor({
  editor,
  placeholder: _ph,
}: {
  editor: ReturnType<typeof useEditor>;
  placeholder?: string;
}) {
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const fsRef = useRef<HTMLDivElement>(null);
  const clRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const alRef = useRef<HTMLDivElement>(null);
  const liRef = useRef<HTMLDivElement>(null);
  const tbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!fsRef.current?.contains(e.target as Node)) setFontSizeOpen(false);
      if (!clRef.current?.contains(e.target as Node)) setColorOpen(false);
      if (!bgRef.current?.contains(e.target as Node)) setBgColorOpen(false);
      if (!alRef.current?.contains(e.target as Node)) setAlignOpen(false);
      if (!liRef.current?.contains(e.target as Node)) setListOpen(false);
      if (!tbRef.current?.contains(e.target as Node)) setTableOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!editor) return null;

  const btn = (
    label: string,
    icon: ReactNode,
    action: () => void,
    active = false,
    extra = "",
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      className={`p-1.5 rounded transition-colors flex-shrink-0 ${active ? "bg-primary/15 text-primary" : `text-muted-foreground hover:bg-muted ${extra}`}`}
    >
      {icon}
    </button>
  );

  const sep = () => <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />;

  const currentAlign =
    (["left", "center", "right", "justify"] as const).find((a) =>
      editor.isActive({ textAlign: a }),
    ) ?? "left";
  const alignIcons: Record<string, ReactNode> = {
    left: <AlignLeft size={12} />,
    center: <AlignCenter size={12} />,
    right: <AlignRight size={12} />,
    justify: <AlignJustify size={12} />,
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        {/* Undo / Redo */}
        {btn("Undo", <Undo2 size={12} />, () =>
          editor.chain().focus().undo().run(),
        )}
        {btn("Redo", <Redo2 size={12} />, () =>
          editor.chain().focus().redo().run(),
        )}
        {sep()}

        {/* Bold / Italic / Underline / Strike */}
        {btn(
          "Bold",
          <Bold size={12} />,
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
        )}
        {btn(
          "Italic",
          <Italic size={12} />,
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
        )}
        {btn(
          "Underline",
          <UnderlineIcon size={12} />,
          () => editor.chain().focus().toggleUnderline().run(),
          editor.isActive("underline"),
        )}
        {btn(
          "Strikethrough",
          <Strikethrough size={12} />,
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive("strike"),
        )}
        {sep()}

        {/* Font size */}
        <div ref={fsRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Font size"
            onMouseDown={(e) => {
              e.preventDefault();
              setFontSizeOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Type size={11} />
            <ChevronDown size={9} />
          </button>
          {fontSizeOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-16 max-h-48 overflow-y-auto">
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    (editor.chain().focus() as any).setFontSize(s + "px").run();
                    setFontSizeOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 text-xs hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text color */}
        <div ref={clRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Text color"
            onMouseDown={(e) => {
              e.preventDefault();
              setColorOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <span
              className="font-bold text-xs"
              style={{
                color: editor.getAttributes("textStyle").color ?? "#111827",
              }}
            >
              A
            </span>
            <ChevronDown size={9} />
          </button>
          {colorOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl p-2 flex flex-wrap gap-1 w-28">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setColor(c).run();
                    setColorOpen(false);
                  }}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ background: c === "#ffffff" ? "#f3f4f6" : c }}
                />
              ))}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                  setColorOpen(false);
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 text-center"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Highlight / BG color */}
        <div ref={bgRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Highlight color"
            onMouseDown={(e) => {
              e.preventDefault();
              setBgColorOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Highlighter size={12} />
            <ChevronDown size={9} />
          </button>
          {bgColorOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl p-2 flex flex-wrap gap-1 w-28">
              {BG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    c === "transparent"
                      ? editor.chain().focus().unsetHighlight().run()
                      : editor.chain().focus().setHighlight({ color: c }).run();
                    setBgColorOpen(false);
                  }}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{
                    background:
                      c === "transparent"
                        ? "linear-gradient(135deg,#fff 40%,#e5e7eb 40%)"
                        : c,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {sep()}

        {/* Text alignment */}
        <div ref={alRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Text alignment"
            onMouseDown={(e) => {
              e.preventDefault();
              setAlignOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            {alignIcons[currentAlign]}
            <ChevronDown size={9} />
          </button>
          {alignOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-32">
              {(["left", "center", "right", "justify"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign(a).run();
                    setAlignOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive({ textAlign: a }) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                >
                  {alignIcons[a]}
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {sep()}

        {/* Indent / Outdent */}
        {btn("Outdent", <Outdent size={12} />, () =>
          editor.chain().focus().liftListItem("listItem").run(),
        )}
        {btn("Indent", <Indent size={12} />, () =>
          editor.chain().focus().sinkListItem("listItem").run(),
        )}
        {sep()}

        {/* Lists */}
        <div ref={liRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Lists"
            onMouseDown={(e) => {
              e.preventDefault();
              setListOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <List size={12} />
            <ChevronDown size={9} />
          </button>
          {listOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-36">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBulletList().run();
                  setListOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive("bulletList") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <List size={11} />
                Bullet List
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleOrderedList().run();
                  setListOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive("orderedList") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <ListOrdered size={11} />
                Ordered List
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div ref={tbRef} className="relative flex-shrink-0">
          <button
            type="button"
            title="Table"
            onMouseDown={(e) => {
              e.preventDefault();
              setTableOpen((v) => !v);
            }}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <TableIcon size={12} />
            <ChevronDown size={9} />
          </button>
          {tableOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-44">
              {[
                [
                  "Insert table",
                  () =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run(),
                ],
                [
                  "Add row above",
                  () => editor.chain().focus().addRowBefore().run(),
                ],
                [
                  "Add row below",
                  () => editor.chain().focus().addRowAfter().run(),
                ],
                ["Delete row", () => editor.chain().focus().deleteRow().run()],
                [
                  "Add column before",
                  () => editor.chain().focus().addColumnBefore().run(),
                ],
                [
                  "Add column after",
                  () => editor.chain().focus().addColumnAfter().run(),
                ],
                [
                  "Delete column",
                  () => editor.chain().focus().deleteColumn().run(),
                ],
                [
                  "Delete table",
                  () => editor.chain().focus().deleteTable().run(),
                ],
              ].map(([label, action]) => (
                <button
                  key={label as string}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    (action as () => void)();
                    setTableOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  {label as string}
                </button>
              ))}
            </div>
          )}
        </div>

        {sep()}

        {/* Blockquote */}
        {btn(
          "Blockquote",
          <Quote size={12} />,
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive("blockquote"),
        )}

        {/* Link */}
        {btn(
          "Link",
          <LinkIcon size={12} />,
          () => {
            const prev = editor.getAttributes("link").href;
            const url = window.prompt("Enter URL", prev ?? "https://");
            if (url === null) return;
            url === ""
              ? editor.chain().focus().unsetLink().run()
              : editor.chain().focus().setLink({ href: url }).run();
          },
          editor.isActive("link"),
        )}

        {sep()}

        {/* Clear formatting */}
        {btn("Clear formatting", <RemoveFormatting size={12} />, () =>
          editor.chain().focus().clearNodes().unsetAllMarks().run(),
        )}
      </div>

      {/* Content area */}
      <div
        className="bg-white min-h-32 max-h-64 overflow-y-auto px-4 py-3
        [&_.tiptap]:outline-none [&_.tiptap]:min-h-28 [&_.tiptap]:text-sm
        [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
        [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground
        [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none
        [&_.tiptap_p.is-editor-empty:first-child::before]:float-left
        [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-primary/30 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:my-2
        [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5
        [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5
        [&_.tiptap_strong]:font-bold [&_.tiptap_em]:italic [&_.tiptap_u]:underline [&_.tiptap_s]:line-through
        [&_.tiptap_a]:text-primary [&_.tiptap_a]:underline
        [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_table]:my-2
        [&_.tiptap_td]:border [&_.tiptap_td]:border-border [&_.tiptap_td]:px-2 [&_.tiptap_td]:py-1.5 [&_.tiptap_td]:text-xs
        [&_.tiptap_th]:border [&_.tiptap_th]:border-border [&_.tiptap_th]:px-2 [&_.tiptap_th]:py-1.5 [&_.tiptap_th]:text-xs [&_.tiptap_th]:bg-muted [&_.tiptap_th]:font-semibold"
      >
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

// ─── Rich Email Composer ──────────────────────────────────────────────────────
function RichEmailEditor({
  onSend,
  onCancel,
  toEmail,
  toName,
  defaultSubject,
  quotedHtml,
}: {
  onSend: (
    subject: string,
    html: string,
    text: string,
    attachments: { name: string; size: number; type: string }[],
  ) => void;
  onCancel: () => void;
  toEmail: string;
  toName: string;
  defaultSubject: string;
  quotedHtml?: string;
}) {
  const [to, setTo] = useState(toEmail);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [editorEmpty, setEditorEmpty] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, underline: false, link: false }),
      Strike,
      UnderlineExt,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableExt.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Enter message…" }),
    ],
    content: quotedHtml ? `<p></p><blockquote>${quotedHtml}</blockquote>` : "",
    autofocus: "start",
    onUpdate: ({ editor: e }: { editor: { isEmpty: boolean } }) =>
      setEditorEmpty(e.isEmpty),
    onCreate: ({ editor: e }: { editor: { isEmpty: boolean } }) =>
      setEditorEmpty(e.isEmpty),
  });

  const handleSend = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;
    onSend(
      subject,
      html,
      text,
      attachments.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    );
  };

  return (
    <div className="mt-4 border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100 bg-blue-50">
        <button
          onClick={handleSend}
          disabled={editorEmpty}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 font-semibold"
        >
          <Send size={11} />
          Send
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <Paperclip size={11} />
            Attach file
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              setAttachments((prev) => [
                ...prev,
                ...Array.from(e.target.files ?? []),
              ])
            }
          />
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* To / CC / BCC / Subject */}
      <div className="border-b border-blue-100">
        {[
          { label: "To:", value: to, setter: setTo, required: true },
          { label: "Cc:", value: cc, setter: setCc },
          { label: "Bcc:", value: bcc, setter: setBcc },
        ].map(({ label, value, setter, required }) => (
          <div
            key={label}
            className="flex items-center border-b border-blue-50 last:border-b-0"
          >
            <span className="px-4 py-2 text-xs font-semibold text-blue-700 w-12 flex-shrink-0">
              {label}
            </span>
            <input
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={required ? "Required" : "Optional"}
              className="flex-1 py-2 pr-4 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ))}
        <div className="flex items-center border-t border-blue-100">
          <span className="px-4 py-2 text-xs font-semibold text-blue-700 w-20 flex-shrink-0">
            Subject:
          </span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Add a subject"
            className="flex-1 py-2 pr-4 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-blue-100 bg-blue-50/50">
          {attachments.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs text-blue-700"
            >
              <Paperclip size={10} />
              <span className="max-w-32 truncate">{f.name}</span>
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, j) => j !== i))
                }
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rich editor */}
      <RichEditor editor={editor} placeholder="Enter message…" />
    </div>
  );
}

// ─── Email Thread Modal ───────────────────────────────────────────────────────
function EmailThreadModal({
  complaintId,
  subject,
  onClose,
}: {
  complaintId: string;
  subject: string;
  onClose: () => void;
}) {
  const thread = EMAIL_THREADS[complaintId] ?? [];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Email Thread
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {complaintId} — {subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No email thread found for this complaint.
            </p>
          ) : (
            thread.map((msg, idx) => (
              <div
                key={msg.id}
                className={`rounded-lg border p-4 ${msg.isOutgoing ? "bg-blue-50 border-blue-100 ml-6" : "bg-muted/40 border-border mr-6"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {msg.from}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      To: {msg.to}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${msg.isOutgoing ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}
                    >
                      {msg.isOutgoing ? "Sent" : "Received"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.date}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground mb-2 pb-2 border-b border-border/60">
                  {msg.subject}
                </p>
                <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.body}
                </pre>
                {idx < thread.length - 1 && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    In reply to message below
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {thread.length} message{thread.length !== 1 ? "s" : ""} in thread
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resolve / Close Modals ───────────────────────────────────────────────────
function ResolveModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (summary: string) => void;
  onCancel: () => void;
}) {
  const [summary, setSummary] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Resolve Complaint
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide a resolution summary before marking as resolved.
            </p>
          </div>
        </div>
        <div>
          <RequiredLabel label="Resolution Summary" />
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={2000}
            placeholder="Describe how the complaint was resolved and any actions taken..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none transition"
          />
          <div className="flex justify-end mt-1">
            <CharCounter current={summary.length} max={2000} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => summary.trim() && onConfirm(summary.trim())}
            disabled={!summary.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <CheckCircle2 size={13} />
            Resolve Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

function CloseModal({
  onConfirm,
  onCancel,
  isResolved,
}: {
  onConfirm: (summary: string, awaitingCustomer: boolean) => void;
  onCancel: () => void;
  isResolved: boolean;
}) {
  const [summary, setSummary] = useState("");
  const [awaitingCustomer, setAwaitingCustomer] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={18} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Close Complaint
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide a closing summary before marking as closed.
            </p>
          </div>
        </div>
        {!isResolved && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle
              size={14}
              className="text-amber-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-amber-700">
              This complaint has not been resolved. Closing without resolving
              may affect reporting.
            </p>
          </div>
        )}
        <div className="mb-4">
          <RequiredLabel label="Close Summary" />
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={2000}
            placeholder="Describe the outcome and reason for closing this complaint..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none transition"
          />
          <div className="flex justify-end mt-1">
            <CharCounter current={summary.length} max={2000} />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none mb-5">
          <div
            onClick={() => setAwaitingCustomer((v) => !v)}
            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${awaitingCustomer ? "bg-primary border-primary" : "border-border bg-card"}`}
          >
            {awaitingCustomer && <Check size={10} className="text-white" />}
          </div>
          <div>
            <span className="text-xs font-medium text-foreground">
              Awaiting Customer
            </span>
            <p className="text-xs text-muted-foreground">
              Customer response or action is still pending at close.
            </p>
          </div>
        </label>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              summary.trim() && onConfirm(summary.trim(), awaitingCustomer)
            }
            disabled={!summary.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <X size={13} />
            Close Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: {
  key: Screen;
  label: string;
  icon: (p: { size: number; className: string }) => ReactNode;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (p) => <LayoutDashboard {...p} />,
  },
  {
    key: "complaints",
    label: "Complaints",
    icon: (p) => <ListFilter {...p} />,
  },
  { key: "reports", label: "Reports", icon: (p) => <BarChart2 {...p} /> },
  { key: "settings", label: "Settings", icon: (p) => <Settings {...p} /> },
];

function Sidebar({
  screen,
  collapsed,
  onCollapse,
  onNavigate,
}: {
  screen: Screen;
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate: (s: Screen) => void;
}) {
  const perm = ROLE_PERMISSIONS[SSO_USER.role];
  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 flex-shrink-0 ${collapsed ? "w-14" : "w-56"}`}
      style={{ background: "#0e1d35" }}
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
            <ChevronRight size={13} className="text-white/60" />
          </button>
        ) : (
          <>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#14b8a6" }}
            >
              <Inbox size={14} className="text-white" />
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
              <ChevronLeft size={13} className="text-white/60" />
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
          <PlusCircle size={14} className="flex-shrink-0" />
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
                <LogOut size={12} className="text-white/40" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
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
            <div className={`mt-0.5 flex-shrink-0 ${iconColor[n.type]}`}>
              {n.type === "warning" ? (
                <AlertTriangle size={13} />
              ) : n.type === "success" ? (
                <CheckCircle2 size={13} />
              ) : (
                <Info size={13} />
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

function TopBar({
  title,
  subtitle,
  notifications,
  onNavigate,
  onMarkRead,
  darkMode,
  onToggleDark,
}: {
  title: string;
  subtitle: string;
  notifications: Notification[];
  onNavigate: (s: Screen, id?: string) => void;
  onMarkRead: (id: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}) {
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
            <Sun size={16} className="text-amber-500" />
          ) : (
            <Moon size={16} className="text-muted-foreground" />
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowPanel((p) => !p)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell size={16} className="text-muted-foreground" />
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

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({
  complaints,
  onNavigate,
}: {
  complaints: Complaint[];
  onNavigate: (s: Screen, id?: string) => void;
}) {
  const [dateRange, setDateRange] = useState<DateRange>("MTD");
  const trendData = TREND_DATA[dateRange];
  const dash = DASHBOARD_DATA[dateRange];

  const oldestnew = complaints
    .filter((c) => c.status !== "Resolved" && c.status !== "Closed")
    .sort((a, b) => b.createdDays - a.createdDays)
    .slice(0, 4);

  const recentComplaints = [...complaints]
    .sort((a, b) => a.createdDays - b.createdDays)
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Date range selector */}
      <div className="flex items-center justify-end">
        <MiniSelect<DateRange>
          value={dateRange}
          options={[
            "Yesterday",
            "WTD",
            "MTD",
            "28 Days",
            "Prev Month",
            "QTD",
            "YTD",
          ]}
          onChange={setDateRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Complaints",
            value: dash.kpis.total,
            sub: dash.kpis.totalDelta,
            bar: "bg-slate-400",
          },
          {
            label: "New",
            value: dash.kpis.newC,
            sub: dash.kpis.newDelta,
            bar: "bg-blue-500",
            onClick: () => onNavigate("complaints"),
          },
          {
            label: "Awaiting Customer",
            value: dash.kpis.awaiting,
            sub: dash.kpis.awaitingDelta,
            bar: "bg-purple-500",
            onClick: () => onNavigate("complaints"),
          },
          {
            label: "Avg. Resolution",
            value: dash.kpis.avgResolution,
            sub: dash.kpis.resDelta,
            bar: "bg-teal-500",
          },
        ].map((card) => (
          <button
            key={card.label}
            onClick={(card as any).onClick}
            className="bg-card rounded-lg border border-border p-4 text-left hover:shadow-md transition-shadow w-full"
          >
            <div className="text-2xl font-bold text-foreground">
              {card.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {card.label}
            </div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">
              {card.sub}
            </div>
            <div className={`mt-3 h-1 rounded-full ${card.bar}`} />
          </button>
        ))}
      </div>

      {/* Trend Chart — all statuses */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Complaint Volume by Status
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              All statuses over time
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              interval={getXAxisInterval(trendData.length)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={ChartTooltip} />
            {[
              { key: "new", name: "New", color: STATUS_LINE_COLORS.new },
              {
                key: "inProgress",
                name: "In Progress",
                color: STATUS_LINE_COLORS.inProgress,
              },
              {
                key: "pending",
                name: "Pending",
                color: STATUS_LINE_COLORS.pending,
              },
              {
                key: "awaitingCustomer",
                name: "Awaiting Customer",
                color: STATUS_LINE_COLORS.awaitingCustomer,
              },
              {
                key: "resolved",
                name: "Resolved",
                color: STATUS_LINE_COLORS.resolved,
              },
              {
                key: "closed",
                name: "Closed",
                color: STATUS_LINE_COLORS.closed,
              },
            ].map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <ChartLegend
          items={[
            { name: "New", color: STATUS_LINE_COLORS.new },
            { name: "In Progress", color: STATUS_LINE_COLORS.inProgress },
            { name: "Pending", color: STATUS_LINE_COLORS.pending },
            {
              name: "Awaiting Customer",
              color: STATUS_LINE_COLORS.awaitingCustomer,
            },
            { name: "Resolved", color: STATUS_LINE_COLORS.resolved },
            { name: "Closed", color: STATUS_LINE_COLORS.closed },
          ]}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Complaints by Category
          </h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={dash.categoryData}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                width={88}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={ChartTooltip} />
              <Bar
                dataKey="count"
                name="Complaints"
                fill="#1d4ed8"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Complaint Aging */}
        <Card className="p-5">
          {/* <div className="flex items-center gap-2 mb-4"><Timer size={15} className="text-orange-500" /></div> */}
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Complaint Aging
          </h2>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {dash.agingBrackets.map((b) => (
              <div
                key={b.label}
                className={`rounded-lg p-3 text-center ${b.bg}`}
              >
                <p className={`text-xl font-bold ${b.text}`}>{b.count}</p>
                <p
                  className={`text-xs mt-0.5 font-medium ${b.text} leading-tight`}
                >
                  {b.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Oldest new Complaints
          </p>
          <div className="space-y-1">
            {oldestnew.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate("complaint-details", c.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <span
                  className={`w-8 text-center text-xs font-bold flex-shrink-0 ${c.createdDays >= 15 ? "text-red-600" : c.createdDays >= 8 ? "text-orange-600" : "text-amber-600"}`}
                >
                  {c.createdDays}d
                </span>
                <span className="text-xs font-semibold text-primary flex-shrink-0">
                  {c.id}
                </span>
                <span className="text-xs text-muted-foreground flex-1 truncate">
                  {c.customer.name}
                </span>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Complaints — ID, Status, Category, Assigned To, Updated On */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Complaints
          </h2>
          <button
            onClick={() => onNavigate("complaints")}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        </div>
        <div className="overflow-auto max-h-72">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/40">
                {[
                  "ID",
                  "Subject",
                  "Status",
                  "Category",
                  "Assigned To",
                  "Updated On",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground ${h === "Updated On" ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentComplaints.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onNavigate("complaint-details", c.id)}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-primary">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-muted-foreground max-w-xs truncate">
                    {c.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.assignedTo}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground text-right">
                    {c.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Complaints Screen ────────────────────────────────────────────────────────
function ComplaintsScreen({
  complaints,
  onNavigate,
}: {
  complaints: Complaint[];
  onNavigate: (s: Screen, id?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterAgents, setFilterAgents] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const list = complaints.filter((c) => {
      const q = search.toLowerCase();
      const ms =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q);
      const mst =
        filterStatuses.length === 0 || filterStatuses.includes(c.status);
      const mc =
        filterCategories.length === 0 || filterCategories.includes(c.category);
      const ma =
        filterAgents.length === 0 || filterAgents.includes(c.assignedTo);
      return ms && mst && mc && ma;
    });
    return [...list].sort((a, b) => {
      const av =
        sortKey === "customer"
          ? a.customer.name
          : sortKey === "assignedTo"
            ? a.assignedTo
            : sortKey === "created"
              ? String(a.createdDays)
              : String(
                  (a as unknown as Record<string, unknown>)[sortKey] ?? "",
                );
      const bv =
        sortKey === "customer"
          ? b.customer.name
          : sortKey === "assignedTo"
            ? b.assignedTo
            : sortKey === "created"
              ? String(b.createdDays)
              : String(
                  (b as unknown as Record<string, unknown>)[sortKey] ?? "",
                );
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [
    complaints,
    search,
    filterStatuses,
    filterCategories,
    filterAgents,
    sortKey,
    sortDir,
  ]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allPageSelected =
    paged.length > 0 && paged.every((c) => selectedIds.has(c.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paged.forEach((c) => next.delete(c.id));
      else paged.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cols: { key: SortKey; label: string; right?: boolean }[] = [
    { key: "id", label: "ID" },
    { key: "customer", label: "Customer" },
    { key: "subject", label: "Subject" },
    { key: "category", label: "Category" },
    { key: "dealer", label: "Dealer" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "status", label: "Status" },
    { key: "created", label: "Age", right: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Card>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Search complaints…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <MultiSelect
            label="Status"
            options={ALL_STATUSES}
            selected={filterStatuses}
            onChange={(v) => {
              setFilterStatuses(v);
              setPage(1);
            }}
          />
          <MultiSelect
            label="Category"
            options={ALL_CATEGORIES}
            selected={filterCategories}
            onChange={(v) => {
              setFilterCategories(v);
              setPage(1);
            }}
          />
          <MultiSelect
            label="Agent"
            options={ALL_AGENTS}
            selected={filterAgents}
            onChange={(v) => {
              setFilterAgents(v);
              setPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto overflow-y-visible rounded-b-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {/* <th className="px-4 py-2.5 w-10">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${allPageSelected ? "bg-primary border-primary" : "border-border"}`} onClick={toggleAll}>
                    {allPageSelected && <Check size={10} className="text-white" />}
                  </div>
                </th> */}
                {cols.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none ${c.right ? "text-right" : "text-left"}`}
                  >
                    <span
                      className={`flex items-center gap-1 ${c.right ? "justify-end" : ""}`}
                    >
                      {c.label}{" "}
                      <SortIcon
                        col={c.key}
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-muted/30 transition-colors ${selectedIds.has(c.id) ? "bg-blue-50/40" : ""}`}
                >
                  {/* <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selectedIds.has(c.id) ? "bg-primary border-primary" : "border-border"}`}
                      onClick={e => { e.stopPropagation(); toggleOne(c.id); }}>
                      {selectedIds.has(c.id) && <Check size={10} className="text-white" />}
                    </div>
                  </td> */}
                  <td
                    className="px-4 py-3 text-xs font-semibold text-primary cursor-pointer"
                    onClick={() => onNavigate("complaint-details", c.id)}
                  >
                    {c.id}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-foreground cursor-pointer"
                    onClick={() => onNavigate("complaint-details", c.id)}
                  >
                    {c.customer.name}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-foreground max-w-52 truncate cursor-pointer"
                    onClick={() => onNavigate("complaint-details", c.id)}
                  >
                    {c.subject}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.dealer}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.assignedTo}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground text-right">
                    {c.createdDays}d
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No complaints match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={filtered.length}
          pageSize={pageSize}
          onChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}

// ─── New Complaint Screen ─────────────────────────────────────────────────────
function AccordionSection({
  title,
  step,
  newSteps,
  onToggle,
  children,
  complete,
}: {
  title: string;
  step: number;
  newSteps: Set<number>;
  onToggle: (s: number) => void;
  children: ReactNode;
  complete: boolean;
}) {
  const isnew = newSteps.has(step);
  return (
    <div
      className={`bg-card border rounded-lg transition-colors ${isnew ? "border-primary/40 ring-1 ring-primary/10" : "border-border"}`}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => onToggle(step)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${complete ? "bg-green-500 text-white" : isnew ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >
            {complete ? <Check size={12} /> : step}
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {complete && (
            <span className="text-xs text-green-600 font-medium">Complete</span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform ${isnew ? "rotate-180" : ""}`}
        />
      </button>
      {isnew && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// VehicleSelect — searchable vehicle combobox with "Add new" option
function VehicleSelect({
  vehicles,
  value,
  onChange,
}: {
  vehicles: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);
  useEffect(() => {
    setQ(value);
  }, [value]);

  const filtered = vehicles.filter((v) =>
    v.toLowerCase().includes(q.toLowerCase()),
  );
  const exactMatch = vehicles.some((v) => v.toLowerCase() === q.toLowerCase());
  const showAdd = q.trim().length > 0 && !exactMatch;

  const select = (v: string) => {
    onChange(v);
    setQ(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-2 text-xs border rounded-lg bg-card transition-colors ${open ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
      >
        <Search size={11} className="text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search or enter registration…"
          className="flex-1 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-xs"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onChange("");
              inputRef.current?.focus();
            }}
          >
            <X
              size={10}
              className="text-muted-foreground hover:text-foreground"
            />
          </button>
        )}
      </div>
      {open && (filtered.length > 0 || showAdd) && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl overflow-hidden ring-1 ring-black/5">
          {filtered.length > 0 && (
            <div className="px-3 pt-2.5 pb-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-1">
                Registered vehicles
              </p>
            </div>
          )}
          <div className="max-h-44 overflow-y-auto px-1.5 pb-1.5 pt-1">
            {filtered.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => select(v)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-all
                  ${value === v ? "bg-primary text-white font-medium shadow-sm" : "text-foreground hover:bg-muted"}`}
              >
                <Car
                  size={11}
                  className={`flex-shrink-0 ${value === v ? "text-white/70" : "text-muted-foreground"}`}
                />
                {v}
                {value === v && (
                  <Check size={10} className="text-white ml-auto" />
                )}
              </button>
            ))}
          </div>
          {showAdd && (
            <div
              className={`px-1.5 pb-1.5 ${filtered.length > 0 ? "border-t border-border pt-1.5 mt-0.5" : "pt-1.5"}`}
            >
              <button
                type="button"
                onClick={() => select(q.trim())}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all border border-dashed border-primary/30"
              >
                <Plus size={11} className="flex-shrink-0" />
                Add &ldquo;{q.trim()}&rdquo; as new vehicle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewComplaintScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [newSteps, setnewSteps] = useState<Set<number>>(new Set([1]));
  const toggleStep = useCallback((step: number) => {
    setnewSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }, []);

  // Dealer details (step 1)
  const [dealer, setDealer] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [source, setSource] = useState("");

  // Customer details (step 2)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  // Complaint details (step 3)
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    const parts = c.name.trim().split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setVehicleReg("");
  };

  const sec1Complete = Boolean(dealer && assignedTo);
  const sec2Complete = Boolean(selectedCustomer);
  const sec3Complete = Boolean(
    subject.trim() && category && description.trim(),
  );

  useEffect(() => {
    if (sec1Complete) setnewSteps((prev) => new Set([...prev, 2]));
  }, [sec1Complete]);
  useEffect(() => {
    if (sec2Complete) setnewSteps((prev) => new Set([...prev, 3]));
  }, [sec2Complete]);

  const availableAgents = dealer
    ? (DEALER_AGENTS[dealer] ?? ALL_AGENTS)
    : ALL_AGENTS;

  const handleSubmit = () => {
    const e: Record<string, boolean> = {};
    if (!dealer) e.dealer = true;
    if (!assignedTo) e.agent = true;
    if (!selectedCustomer) e.customer = true;
    if (!subject.trim()) e.subject = true;
    if (!category) e.category = true;
    if (!description.trim()) e.desc = true;
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Complaint registered successfully.");
  };

  const resetForm = () => {
    setSubmitted(false);
    setSelectedCustomer(null);
    setFirstName("");
    setLastName("");
    setVehicleReg("");
    setSubject("");
    setCategory("");
    setDescription("");
    setPriority("");
    setAssignedTo("");
    setDealer("");
    setSource("");
    setnewSteps(new Set([1]));
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">
            Complaint Registered
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The complaint has been logged and assigned successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onNavigate("complaints")}
              className="px-4 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
            >
              View All
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              New Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Step 1 — Dealer Details */}
        <AccordionSection
          title="Dealer Details"
          step={1}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec1Complete}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <RequiredLabel>Dealer</RequiredLabel>
              <SearchableSelect
                value={dealer}
                onChange={(v) => {
                  setDealer(v);
                  setAssignedTo("");
                }}
                options={Object.keys(DEALER_AGENTS)}
                placeholder="Select dealer…"
                error={errors.dealer}
              />
              {errors.dealer && (
                <p className="text-xs text-red-500 mt-1">Dealer is required.</p>
              )}
            </div>
            <div>
              <RequiredLabel>Assign To</RequiredLabel>
              <SearchableSelect
                value={assignedTo}
                onChange={setAssignedTo}
                options={availableAgents}
                placeholder="Select agent…"
                error={errors.agent}
                disabled={!dealer}
              />
              {errors.agent && (
                <p className="text-xs text-red-500 mt-1">
                  Assign To is required.
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Source
            </label>
            <SearchableSelect
              value={source}
              onChange={setSource}
              options={[
                "Inbound",
                "Online Booking",
                "Email",
                "Company Portal",
                "Telephonic System",
              ]}
              placeholder="Select source…"
            />
          </div>
        </AccordionSection>

        {/* Step 2 — Customer Details */}
        <AccordionSection
          title="Customer Details"
          step={2}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec2Complete}
        >
          <div>
            <RequiredLabel>Search Customer</RequiredLabel>
            <CustomerSearch
              onSelect={handleSelectCustomer}
              onSearchStart={() => setSelectedCustomer(null)}
            />
            {errors.customer && (
              <p className="text-xs text-red-500 mt-1">
                Please select a customer.
              </p>
            )}
          </div>
          {selectedCustomer && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  First Name
                </label>
                <input
                  readOnly
                  value={firstName}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Last Name
                </label>
                <input
                  readOnly
                  value={lastName}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  readOnly
                  value={selectedCustomer.email}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Mobile Number
                </label>
                <input
                  readOnly
                  value={selectedCustomer.mobile}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Vehicle Registration
                </label>
                <VehicleSelect
                  vehicles={selectedCustomer.vehicles}
                  value={vehicleReg}
                  onChange={setVehicleReg}
                />
              </div>
            </div>
          )}
        </AccordionSection>

        {/* Step 3 — Complaint Details */}
        <AccordionSection
          title="Complaint Details"
          step={3}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec3Complete}
        >
          <div>
            <RequiredLabel>Subject</RequiredLabel>
            <input
              maxLength={50}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary…"
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${errors.subject ? "border-red-400" : "border-border"}`}
            />
            <div className="flex justify-end mt-1">
              <CharCounter current={subject.length} max={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <RequiredLabel>Category</RequiredLabel>
              <SearchableSelect
                value={category}
                onChange={setCategory}
                options={ALL_CATEGORIES}
                placeholder="Select category…"
                error={errors.category}
              />
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">
                  Category is required.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Priority
              </label>
              <SearchableSelect
                value={priority}
                onChange={setPriority}
                options={["High", "Medium", "Low"]}
                placeholder="Select priority…"
              />
            </div>
          </div>
          <div>
            <RequiredLabel>Description</RequiredLabel>
            <textarea
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the complaint in detail…"
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-card resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${errors.desc ? "border-red-400" : "border-border"}`}
            />
            <div className="flex justify-end mt-1">
              <CharCounter current={description.length} max={2000} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Submit Complaint
            </button>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}

// Groups timeline entries: "important" (created/status) always shown;
// consecutive non-important entries (note/email/call) are collapsed into an expandable group.
type TimelineSegment =
  | { kind: "entry"; entry: TimelineEntry }
  | { kind: "group"; entries: TimelineEntry[]; groupId: string };

function buildSegments(timeline: TimelineEntry[]): TimelineSegment[] {
  const isImportant = (e: TimelineEntry) =>
    e.type === "created" || e.type === "status" || e.type === "reopen";
  const segments: TimelineSegment[] = [];
  let groupBuf: TimelineEntry[] = [];
  const flushGroup = () => {
    if (groupBuf.length === 1) {
      segments.push({ kind: "entry", entry: groupBuf[0] });
    } else if (groupBuf.length > 1) {
      segments.push({
        kind: "group",
        entries: [...groupBuf],
        groupId: groupBuf[0].id,
      });
    }
    groupBuf = [];
  };
  for (const entry of timeline) {
    if (isImportant(entry)) {
      flushGroup();
      segments.push({ kind: "entry", entry });
    } else groupBuf.push(entry);
  }
  flushGroup();
  return segments;
}

function TimelineEntry_({
  entry,
  isLast,
  onViewEmailThread,
  onReply,
  onEdit,
}: {
  entry: TimelineEntry;
  isLast: boolean;
  onViewEmailThread: (id: string) => void;
  onReply: (entry: TimelineEntry) => void;
  onEdit: (id: string, html: string, text: string) => void;
}) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const isClosedEntry =
    entry.type === "status" && entry.text.startsWith("Complaint closed");
  const [awaitingEdit, setAwaitingEdit] = useState(
    () => isClosedEntry && entry.text.includes("(Awaiting customer response.)"),
  );
  const [awaitingBase, setAwaitingBase] = useState(
    () => isClosedEntry && entry.text.includes("(Awaiting customer response.)"),
  );
  const cfgKey =
    entry.type === "status"
      ? entry.text.startsWith("Complaint closed")
        ? "closed"
        : entry.text.startsWith("Complaint resolved")
          ? "resolved"
          : "status"
      : entry.type;
  const cfg = TIMELINE_CFG[cfgKey] ?? TIMELINE_CFG.created;
  const hasBody = entry.type === "email" && entry.emailHtml;
  const canEdit =
    entry.type === "note" ||
    entry.type === "call" ||
    entry.type === "email" ||
    entry.type === "reopen" ||
    (entry.type === "status" &&
      (entry.text.startsWith("Complaint resolved") ||
        entry.text.startsWith("Complaint closed")));

  // Extract summary from closed entry text for edit pre-population
  const closedSummary = isClosedEntry
    ? (() => {
        const i = entry.text.indexOf(": ");
        return i >= 0 ? entry.text.slice(i + 2) : entry.text;
      })()
    : "";

  const editInitContent = isClosedEntry
    ? `<p>${closedSummary}</p>`
    : (entry.emailHtml ?? `<p>${entry.text}</p>`);
  const { editor: editEditor, isEmpty: editEmpty } = useRichEditor(
    "Edit your content…",
    editInitContent,
  );

  // Reset editor content and awaiting flag each time editing opens
  useEffect(() => {
    if (editing && editEditor) {
      editEditor.commands.setContent(editInitContent);
      if (isClosedEntry) {
        const cur = entry.text.includes("(Awaiting customer response.)");
        setAwaitingEdit(cur);
        setAwaitingBase(cur);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const canSaveEdit =
    !editEmpty || (isClosedEntry && awaitingEdit !== awaitingBase);
  const handleSaveEdit = () => {
    if (!editEditor || !canSaveEdit) return;
    if (isClosedEntry) {
      const summary = editEditor.getText().trim();
      const suffix = awaitingEdit ? " (Awaiting customer response.)" : "";
      const newText = `Complaint closed${suffix}: ${summary}`;
      onEdit(entry.id, editEditor.getHTML(), newText);
    } else {
      onEdit(entry.id, editEditor.getHTML(), editEditor.getText());
    }
    setEditing(false);
  };

  return (
    <div className="flex gap-3 min-w-0 overflow-hidden">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.iconBg}`}
        >
          {cfg.icon({ size: 13, className: cfg.iconColor })}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1 min-h-3" />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
        <div className="flex items-center gap-2 mb-0.5 min-w-0">
          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
            <span className="text-xs font-semibold text-foreground flex-shrink-0">
              {entry.author}
            </span>
            {entry.emailSubject && (
              <span
                className="text-xs text-muted-foreground truncate cursor-default"
                title={entry.emailSubject}
              >
                — {entry.emailSubject}
              </span>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                title="Edit"
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <PencilLine size={11} />
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {entry.timestamp}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="mt-2 border border-border rounded-lg overflow-hidden bg-white shadow-sm">
            {isClosedEntry && (
              <div className="px-3 pt-2 pb-1 border-b border-border bg-muted/10">
                <button
                  type="button"
                  onClick={() => setAwaitingEdit((v) => !v)}
                  className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${awaitingEdit ? "bg-primary border-primary" : "border-border bg-white"}`}
                  >
                    {awaitingEdit && <Check size={10} className="text-white" />}
                  </span>
                  Awaiting Customer
                </button>
              </div>
            )}
            <RichEditor editor={editEditor} />
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-border bg-muted/20">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!canSaveEdit}
                className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {entry.text}
            </p>

            {/* Rich email body preview */}
            {hasBody && (
              <div className="mt-2">
                {bodyExpanded ? (
                  <div className="border border-blue-100 rounded-lg bg-blue-50 overflow-hidden">
                    <div
                      className="px-4 py-3 text-xs text-foreground leading-relaxed
                      [&_strong]:font-bold [&_em]:italic [&_u]:underline
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                      [&_blockquote]:border-l-2 [&_blockquote]:border-blue-300 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic"
                      dangerouslySetInnerHTML={{ __html: entry.emailHtml! }}
                    />
                    {entry.emailAttachments &&
                      entry.emailAttachments.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-blue-100 space-y-1.5">
                          <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Paperclip size={10} />
                            {entry.emailAttachments.length} Attachment
                            {entry.emailAttachments.length > 1 ? "s" : ""}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.emailAttachments.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-blue-800 max-w-[200px]"
                              >
                                {/* <Paperclip size={10} className="text-blue-500 flex-shrink-0" /> */}
                                <span className="truncate font-medium">
                                  {a.name}
                                </span>
                                <span className="text-[10px] text-blue-400 flex-shrink-0">
                                  {a.size < 1024
                                    ? `${a.size}B`
                                    : a.size < 1048576
                                      ? `${(a.size / 1024).toFixed(1)}KB`
                                      : `${(a.size / 1048576).toFixed(1)}MB`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    <div className="flex items-center gap-2 px-4 py-2 border-t border-blue-100 bg-blue-100/50">
                      <button
                        onClick={() => setBodyExpanded(false)}
                        className="text-xs text-blue-700 hover:underline"
                      >
                        Hide message
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => onReply(entry)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Reply size={11} />
                        Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setBodyExpanded(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail size={11} />
                      View message
                    </button>
                    <button
                      onClick={() => onReply(entry)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Reply size={11} />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Legacy email thread link */}
            {entry.type === "email" &&
              entry.emailId &&
              EMAIL_THREADS[entry.emailId] &&
              !hasBody && (
                <button
                  onClick={() => onViewEmailThread(entry.emailId!)}
                  className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Mail size={11} />
                  View email thread
                </button>
              )}
          </>
        )}
      </div>
    </div>
  );
}

function TimelineList({
  timeline,
  onViewEmailThread,
  onReply,
  onEdit,
}: {
  timeline: TimelineEntry[];
  onViewEmailThread: (id: string) => void;
  onReply: (entry: TimelineEntry) => void;
  onEdit: (id: string, html: string, text: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const segments = useMemo(() => buildSegments(timeline), [timeline]);

  // Auto-expand the group containing the newest entry when timeline changes
  useEffect(() => {
    if (timeline.length === 0) return;
    const newestId = timeline[0].id;
    const group = segments.find(
      (s) =>
        s.kind === "group" &&
        (
          s as { kind: "group"; entries: TimelineEntry[]; groupId: string }
        ).entries.some((e) => e.id === newestId),
    );
    if (group && group.kind === "group") {
      setExpanded((prev) => new Set([...prev, group.groupId]));
    }
  }, [timeline]);

  return (
    <>
      {segments.map((seg, si) => {
        const isLastSegment = si === segments.length - 1;
        if (seg.kind === "entry") {
          return (
            <TimelineEntry_
              key={seg.entry.id}
              entry={seg.entry}
              isLast={isLastSegment}
              onViewEmailThread={onViewEmailThread}
              onReply={onReply}
              onEdit={onEdit}
            />
          );
        }
        // Collapsed group
        const isOpen = expanded.has(seg.groupId);
        const toggle = () =>
          setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(seg.groupId)) next.delete(seg.groupId);
            else next.add(seg.groupId);
            return next;
          });
        return (
          <div key={seg.groupId} className="flex gap-3 min-w-0 overflow-hidden">
            <div className="flex flex-col items-center flex-shrink-0 w-7">
              <div className="w-px flex-1 bg-border" />
              {!isLastSegment && <div className="w-px flex-1 bg-border" />}
            </div>
            <div
              className={`flex-1 min-w-0 overflow-hidden flex items-center ${isLastSegment ? "pb-0" : "pb-2"}`}
            >
              {isOpen ? (
                <div className="w-full border border-border rounded-lg overflow-hidden">
                  {seg.entries.map((e, ei) => (
                    <div
                      key={e.id}
                      className={`px-4 py-3 min-w-0 overflow-hidden ${ei < seg.entries.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <TimelineEntry_
                        entry={e}
                        isLast={true}
                        onViewEmailThread={onViewEmailThread}
                        onReply={onReply}
                        onEdit={onEdit}
                      />
                    </div>
                  ))}
                  <div
                    onClick={toggle}
                    className="px-4 py-2 bg-muted/30 border-t border-border flex justify-center hover:bg-muted/50 text-foreground transition-colors"
                  >
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChevronUp size={11} />
                      Hide interactions
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={toggle} className="w-full group">
                  {(() => {
                    const counts = seg.entries.reduce<Record<string, number>>(
                      (acc, e) => {
                        acc[e.type] = (acc[e.type] || 0) + 1;
                        return acc;
                      },
                      {},
                    );
                    const chips: {
                      type: string;
                      icon: ReactNode;
                      count: number;
                      color: string;
                    }[] = [
                      counts.note && {
                        type: "note",
                        icon: <MessageSquare size={10} />,
                        count: counts.note,
                        color: "bg-gray-100 text-gray-600 border-gray-200",
                      },
                      counts.call && {
                        type: "call",
                        icon: <Phone size={10} />,
                        count: counts.call,
                        color: "bg-green-50 text-green-700 border-green-200",
                      },
                      counts.email && {
                        type: "email",
                        icon: <Mail size={10} />,
                        count: counts.email,
                        color: "bg-blue-50 text-blue-700 border-blue-200",
                      },
                    ].filter(Boolean) as {
                      type: string;
                      icon: ReactNode;
                      count: number;
                      color: string;
                    }[];
                    const authors = [
                      ...new Map(
                        seg.entries.map((e) => [e.author, e.author]),
                      ).values(),
                    ].slice(0, 3);
                    return (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/30 group-hover:bg-muted/60 group-hover:border-primary/20 transition-all shadow-sm">
                        {/* Avatars */}
                        <div className="flex -space-x-2 flex-shrink-0">
                          {authors.map((a) => (
                            <span
                              key={a}
                              className="w-6 h-6 rounded-full bg-primary/15 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary"
                            >
                              {a
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          ))}
                        </div>
                        {/* Count label */}
                        <span className="text-xs font-medium text-foreground flex-shrink-0">
                          {seg.entries.length} hidden
                        </span>
                        {/* Type chips */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {chips.map((chip) => (
                            <span
                              key={chip.type}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${chip.color}`}
                            >
                              {chip.icon}×{chip.count}
                            </span>
                          ))}
                        </div>
                        <ChevronDown
                          size={13}
                          className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                        />
                      </div>
                    );
                  })()}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function useRichEditor(placeholder: string, content = "") {
  const [isEmpty, setIsEmpty] = useState(true);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, underline: false, link: false }),
      Strike,
      UnderlineExt,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableExt.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    autofocus: "end",
    onUpdate: ({ editor: e }: { editor: { isEmpty: boolean } }) =>
      setIsEmpty(e.isEmpty),
  });
  return { editor, isEmpty };
}

function NotePanel({
  onSave,
  onCancel,
}: {
  onSave: (html: string, text: string) => void;
  onCancel: () => void;
}) {
  const { editor, isEmpty } = useRichEditor(
    "Add an internal note visible only to your team…",
  );
  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-right">
        {/* <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><MessageSquare size={12}/>Internal Note</span> */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!editor || isEmpty) return;
              onSave(editor.getHTML(), editor.getText());
            }}
            disabled={isEmpty}
            className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 font-medium"
          >
            Save Note
          </button>
        </div>
      </div>
      <RichEditor editor={editor} />
    </div>
  );
}

function CallPanel({
  callOutcome,
  setCallOutcome,
  callDir,
  setCallDir,
  onSave,
  onCancel,
}: {
  callOutcome: string;
  setCallOutcome: (v: string) => void;
  callDir: string;
  setCallDir: (v: string) => void;
  onSave: (html: string, text: string) => void;
  onCancel: () => void;
}) {
  const { editor, isEmpty } = useRichEditor("Call notes…");
  return (
    <div className="mt-4 border border-green-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b border-green-200 bg-green-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><Phone size={12}/>Record Call</span> */}
          <MiniSelect
            value={callOutcome}
            onChange={setCallOutcome}
            options={[
              "Spoke with customer",
              "No answer — voicemail left",
              "No answer — no voicemail",
              "Inbound call from customer",
            ]}
          />
          <MiniSelect
            value={callDir}
            onChange={setCallDir}
            options={[
              "Inbound",
              "Online Booking",
              "Email",
              "Company Portal",
              "Telephonic System",
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded-lg border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!editor || isEmpty) return;
              onSave(editor.getHTML(), editor.getText());
            }}
            disabled={isEmpty}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Mic size={11} />
            Save Call
          </button>
        </div>
      </div>
      <RichEditor editor={editor} />
    </div>
  );
}

function ReopenModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RefreshCcwDot size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Reopen Complaint
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide a reason for reopening this complaint.
            </p>
          </div>
        </div>
        <div className="mb-5">
          <RequiredLabel label="Reason for Reopening" />
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
            placeholder="Explain why this complaint is being reopened..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition"
          />
          <div className="flex justify-end mt-1">
            <CharCounter current={reason.length} max={2000} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCcwDot size={13} />
            Reopen Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Complaint Details Screen ─────────────────────────────────────────────────
function ComplaintDetailsScreen({
  complaintId,
  complaints,
  onBack,
}: {
  complaintId: string;
  complaints: Complaint[];
  onBack: () => void;
}) {
  const base = complaints.find((c) => c.id === complaintId) ?? complaints[0];
  const [status, setStatus] = useState<Status>(base.status);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([...base.timeline]);
  const [action, setAction] = useState<"note" | "email" | "call" | null>(null);
  const [showResolve, setShowResolve] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showReopen, setShowReopen] = useState(false);
  const [showEmailThread, setShowEmailThread] = useState<string | null>(null);
  const [callOutcome, setCallOutcome] = useState("Spoke with customer");
  const [callDir, setCallDir] = useState("Inbound");
  const [descExpanded, setDescExpanded] = useState(false);
  const [replyToEntry, setReplyToEntry] = useState<TimelineEntry | null>(null);

  function addEntry(partial: Omit<TimelineEntry, "id" | "timestamp">) {
    setTimeline((prev) => [
      { id: String(Date.now()), timestamp: nowStamp(), ...partial },
      ...prev,
    ]);
  }

  function handleDropdownStatusChange(newStatus: Status) {
    if (newStatus === "Resolved") {
      setShowResolve(true);
      return;
    }
    if (newStatus === "Closed") {
      setShowClose(true);
      return;
    }
    setStatus(newStatus);
    addEntry({
      type: "status",
      author: SSO_USER.name,
      text: `Status changed to ${newStatus}.`,
    });
  }

  function handleSendEmail(
    subject: string,
    html: string,
    text: string,
    attachments: { name: string; size: number; type: string }[],
  ) {
    addEntry({
      type: "email",
      author: SSO_USER.name,
      emailId: base.id,
      emailSubject: subject,
      emailHtml: html,
      emailTo: base.customer.email,
      emailAttachments: attachments.length > 0 ? attachments : undefined,
      text: `Email sent to ${base.customer.name}.`,
    });
    setAction(null);
    setReplyToEntry(null);
    toast.success("Email sent successfully.");
  }

  function handleResolve(summary: string) {
    setStatus("Resolved");
    addEntry({
      type: "status",
      author: SSO_USER.name,
      text: `Complaint resolved. ${summary}`,
    });
    setShowResolve(false);
    toast.success("Complaint marked as resolved.");
  }

  function handleEditEntry(id: string, html: string, text: string) {
    setTimeline((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.type === "email") return { ...e, emailHtml: html };
        if (e.type === "status") return { ...e, text };
        return {
          ...e,
          emailHtml: html,
          text: text.slice(0, 120) + (text.length > 120 ? "…" : ""),
        };
      }),
    );
    toast.success("Entry updated.");
  }

  function handleReopen(reason: string) {
    setStatus("In Progress");
    addEntry({
      type: "reopen",
      author: SSO_USER.name,
      text: `Complaint reopened. ${reason}`,
    });
    setShowReopen(false);
    toast.success("Complaint reopened.");
  }

  function handleClose(summary: string, awaitingCustomer: boolean) {
    setStatus("Closed");
    const suffix = awaitingCustomer ? " (Awaiting customer response.)" : "";
    addEntry({
      type: "status",
      author: SSO_USER.name,
      text: `Complaint closed${suffix}: ${summary}`,
    });
    setShowClose(false);
    toast.success("Complaint closed.");
  }

  const isClosed = status === "Closed";
  const isResolved = status === "Resolved";

  return (
    <>
      {showResolve && (
        <ResolveModal
          onConfirm={handleResolve}
          onCancel={() => setShowResolve(false)}
        />
      )}
      {showClose && (
        <CloseModal
          onConfirm={handleClose}
          onCancel={() => setShowClose(false)}
          isResolved={isResolved}
        />
      )}
      {showReopen && (
        <ReopenModal
          onConfirm={handleReopen}
          onCancel={() => setShowReopen(false)}
        />
      )}
      {showEmailThread && (
        <EmailThreadModal
          complaintId={showEmailThread}
          subject={base.subject}
          onClose={() => setShowEmailThread(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Complaints
        </button>

        {/* Top row — complaint card + customer card side by side */}
        <div className="flex gap-4 items-stretch">
          {/* Left — complaint header card */}
          <Card className="p-5 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold text-primary">
                  {base.id}
                </span>
                <StatusBadge status={status} />
                {isClosed && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                    Locked
                  </span>
                )}
              </div>
              {!isClosed && (
                <select
                  value={status}
                  onChange={(e) =>
                    handleDropdownStatusChange(e.target.value as Status)
                  }
                  className="px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground font-medium flex-shrink-0"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              {base.subject}
            </h2>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {base.description.length > 120 && !descExpanded ? (
                  <>
                    {base.description.slice(0, 120)}
                    <button
                      onClick={() => setDescExpanded(true)}
                      className="text-primary text-sm hover:underline font-medium ml-0.5"
                    >
                      …more
                    </button>
                  </>
                ) : (
                  <>
                    {base.description}
                    {base.description.length > 120 && (
                      <button
                        onClick={() => setDescExpanded(false)}
                        className="text-primary text-sm hover:underline font-medium ml-1"
                      >
                        less
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Tag size={11} />
                {base.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={11} />
                {base.dealer}
              </span>
              {base.vehicle && (
                <span className="flex items-center gap-1.5">
                  <Car size={11} />
                  {base.vehicle}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={11} />
                Created {base.created}
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck size={11} />
                {base.assignedTo}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
              {isClosed ? (
                <button
                  onClick={() => setShowReopen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <RefreshCcwDot size={12} />
                  Reopen Complaint
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setAction(action === "note" ? null : "note")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "note" ? "bg-gray-100 border-gray-300 text-gray-700" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >
                    <MessageSquare size={12} />
                    Add Note
                  </button>
                  <button
                    onClick={() => setAction(action === "call" ? null : "call")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "call" ? "bg-green-50 border-green-200 text-green-700" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >
                    <Phone size={12} />
                    Record Call
                  </button>
                  <button
                    onClick={() =>
                      setAction(action === "email" ? null : "email")
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "email" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >
                    <Mail size={12} />
                    Send Email
                  </button>
                  <div className="flex-1" />
                  {!isResolved && (
                    <button
                      onClick={() => setShowResolve(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setShowClose(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X size={12} />
                    Close
                  </button>
                </>
              )}
            </div>

            {/* Add Note panel */}
            {action === "note" && (
              <NotePanel
                key="note-panel"
                onSave={(html, text) => {
                  addEntry({
                    type: "note",
                    author: SSO_USER.name,
                    text: text.slice(0, 120) + (text.length > 120 ? "…" : ""),
                    emailHtml: html,
                  });
                  setAction(null);
                  toast.success("Note saved.");
                }}
                onCancel={() => setAction(null)}
              />
            )}

            {/* Send Email panel */}
            {(action === "email" || replyToEntry) && (
              <RichEmailEditor
                key={replyToEntry?.id ?? "new"}
                toEmail={base.customer.email}
                toName={base.customer.name}
                defaultSubject={
                  replyToEntry?.emailSubject
                    ? `Re: ${replyToEntry.emailSubject}`
                    : `Re: Complaint ${base.id}`
                }
                quotedHtml={replyToEntry?.emailHtml}
                onSend={handleSendEmail}
                onCancel={() => {
                  setAction(null);
                  setReplyToEntry(null);
                }}
              />
            )}

            {/* Record Call panel */}
            {action === "call" && (
              <CallPanel
                key="call-panel"
                callOutcome={callOutcome}
                setCallOutcome={setCallOutcome}
                callDir={callDir}
                setCallDir={setCallDir}
                onSave={(html, text) => {
                  addEntry({
                    type: "call",
                    author: SSO_USER.name,
                    text: `${callDir} call — ${callOutcome}.${text.trim() ? " Notes: " + text.slice(0, 80) : ""}`,
                    emailHtml: html,
                  });
                  setAction(null);
                  toast.success("Call recorded.");
                }}
                onCancel={() => setAction(null)}
              />
            )}
          </Card>

          {/* Right — customer card */}
          <Card className="p-5 w-64 flex-shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Customer
            </h3>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {base.customer.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {base.customer.name}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail
                  size={11}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="text-xs text-foreground truncate">
                  {base.customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone
                  size={11}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="text-xs text-foreground">
                  {base.customer.mobile}
                </span>
              </div>
            </div>
          </Card>
        </div>
        {/* end top row */}

        {/* Full-width timeline */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Activity &amp; Communication Timeline
          </h3>
          <TimelineList
            timeline={timeline}
            onViewEmailThread={setShowEmailThread}
            onReply={(entry) => {
              setReplyToEntry(entry);
              setAction("email");
            }}
            onEdit={handleEditEntry}
          />
        </Card>
      </div>
    </>
  );
}

// ─── Reports Screen ───────────────────────────────────────────────────────────
type AgentSortKey = "name" | "new" | "resolved" | "avgDays" | "sla";

function ReportsScreen() {
  const [dateRange, setDateRange] = useState<DateRange>("MTD");
  const [agentSortKey, setAgentSortKey] = useState<AgentSortKey>("name");
  const [agentSortDir, setAgentSortDir] = useState<SortDir>("asc");
  const [agentPage, setAgentPage] = useState(1);
  const [agentPageSize, setAgentPageSize] = useState(10);

  useEffect(() => {
    setAgentPage(1);
  }, [dateRange]);

  const toggleAgentSort = (k: AgentSortKey) => {
    if (k === agentSortKey)
      setAgentSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setAgentSortKey(k);
      setAgentSortDir("asc");
    }
    setAgentPage(1);
  };

  const period = REPORTS_DATA[dateRange];

  const sortedAgents = useMemo(() => {
    return [...period.agentData].sort((a, b) => {
      const av = String(a[agentSortKey]);
      const bv = String(b[agentSortKey]);
      return agentSortDir === "asc"
        ? av.localeCompare(bv, undefined, { numeric: true })
        : bv.localeCompare(av, undefined, { numeric: true });
    });
  }, [period.agentData, agentSortKey, agentSortDir]);

  const pagedAgents = sortedAgents.slice(
    (agentPage - 1) * agentPageSize,
    agentPage * agentPageSize,
  );

  const exportCSV = () => {
    const headers = [
      "ID",
      "Customer",
      "Subject",
      "Category",
      "Dealer",
      "Assigned To",
      "Status",
      "Age (Days)",
    ];
    const rows = COMPLAINTS.map((c) => [
      c.id,
      `"${c.customer.name}"`,
      `"${c.subject}"`,
      c.category,
      c.dealer,
      c.assignedTo,
      c.status,
      String(c.createdDays),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${dateRange.replace(/ /g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const kpis = [
    {
      label: "Avg First Response",
      ...period.kpis.firstResponse,
      icon: <Timer size={14} className="text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Avg Resolution Time",
      ...period.kpis.resolutionTime,
      icon: <Clock size={14} className="text-green-500" />,
      iconBg: "bg-green-50",
    },
    {
      label: "Resolution Rate",
      ...period.kpis.resolutionRate,
      icon: <CheckCircle2 size={14} className="text-teal-500" />,
      iconBg: "bg-teal-50",
    },
  ];

  const agentCols: { key: AgentSortKey; label: string; right?: boolean }[] = [
    { key: "name", label: "Agent" },
    { key: "new", label: "New", right: true },
    { key: "resolved", label: "Resolved", right: true },
    { key: "avgDays", label: "Avg Resolution", right: true },
    { key: "sla", label: "SLA Adherence" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Top-right: date range + export (V2 style) */}
      <div className="flex items-center justify-end gap-2">
        <MiniSelect<DateRange>
          value={dateRange}
          options={[
            "Yesterday",
            "WTD",
            "MTD",
            "28 Days",
            "Prev Month",
            "QTD",
            "YTD",
          ]}
          onChange={setDateRange}
        />
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Download size={13} />
          Export CSV ({dateRange})
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => {
          const trendColor = k.trendGood ? "text-green-600" : "text-red-500";
          const TrendIcon = k.trendUp ? TrendingUp : TrendingDown;
          return (
            <Card key={k.label} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground leading-tight">
                  {k.label}
                </p>
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ml-2 ${k.iconBg}`}
                >
                  {k.icon}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-foreground leading-none">
                  {k.value}
                </p>
                <div
                  className={`flex items-center gap-0.5 mb-0.5 ${trendColor}`}
                >
                  <TrendIcon size={13} />
                  <span className="text-xs font-medium">{k.delta}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Area + Pie */}
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Complaint Volume
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={period.areaData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs key="defs">
                <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                key="grid"
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
              />
              <XAxis
                key="xaxis"
                dataKey="label"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="yaxis"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip key="tooltip" content={ChartTooltip} />
              <Area
                key="area-complaints"
                type="monotone"
                dataKey="complaints"
                name="Complaints"
                stroke="#1d4ed8"
                fill="url(#gComp)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                key="area-resolved"
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                fill="url(#gRes)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <ChartLegend
            items={[
              { name: "Complaints", color: "#1d4ed8" },
              { name: "Resolved", color: "#10b981" },
            ]}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Category Distribution
          </h2>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={180} height={200}>
              <PieChart key={dateRange}>
                <Pie
                  data={period.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="count"
                  paddingAngle={1}
                  isAnimationActive={false}
                >
                  {period.categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {period.categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground flex-1 leading-tight">
                    {d.name}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Dealer bar + Resolution time */}
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Complaints by Dealer
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              key={dateRange}
              data={period.dealerData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={(props: any) => {
                  if (!props.active || !props.payload?.length) return null;
                  const dealer = props.label;
                  const entries: {
                    key: string;
                    color: string;
                    label: string;
                    value: number;
                  }[] = [
                    {
                      key: "New",
                      color: "#1d4ed8",
                      label: "New",
                      value:
                        props.payload.find((p: any) => p.dataKey === "New")
                          ?.value ?? 0,
                    },
                    {
                      key: "inProgress",
                      color: "#6366f1",
                      label: "In Progress",
                      value:
                        props.payload.find(
                          (p: any) => p.dataKey === "inProgress",
                        )?.value ?? 0,
                    },
                    {
                      key: "pending",
                      color: "#f59e0b",
                      label: "Pending",
                      value:
                        props.payload.find((p: any) => p.dataKey === "pending")
                          ?.value ?? 0,
                    },
                    {
                      key: "awaitingCustomer",
                      color: "#8b5cf6",
                      label: "Awaiting Customer",
                      value:
                        props.payload.find(
                          (p: any) => p.dataKey === "awaitingCustomer",
                        )?.value ?? 0,
                    },
                    {
                      key: "resolved",
                      color: "#10b981",
                      label: "Resolved",
                      value:
                        props.payload.find((p: any) => p.dataKey === "resolved")
                          ?.value ?? 0,
                    },
                    {
                      key: "closed",
                      color: "#6b7280",
                      label: "Closed",
                      value:
                        props.payload.find((p: any) => p.dataKey === "closed")
                          ?.value ?? 0,
                    },
                  ];
                  const total = entries.reduce((s, e) => s + e.value, 0);
                  return (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        minWidth: 190,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: 8,
                        }}
                      >
                        {dealer}
                      </p>
                      {entries.map((e) => (
                        <div
                          key={e.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              fontSize: 11,
                              color: "#374151",
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: e.color,
                                flexShrink: 0,
                              }}
                            />
                            {e.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {e.value}
                          </span>
                        </div>
                      ))}
                      <div
                        style={{
                          borderTop: "1px solid rgba(0,0,0,0.08)",
                          marginTop: 6,
                          paddingTop: 6,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Total complaints
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {total}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              {(
                [
                  { key: "New", color: "#1d4ed8" },
                  { key: "inProgress", color: "#6366f1" },
                  { key: "pending", color: "#f59e0b" },
                  { key: "awaitingCustomer", color: "#8b5cf6" },
                  { key: "resolved", color: "#10b981" },
                  { key: "closed", color: "#6b7280" },
                ] as const
              ).map(({ key, color }) => (
                <Bar
                  key={key}
                  dataKey={key}
                  maxBarSize={10}
                  shape={(props: any) => {
                    const { x, y, width, height } = props;
                    if (!height || height <= 0) return <g />;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={Math.max(width, 1)}
                        height={height}
                        rx={2}
                        ry={2}
                        style={{ fill: color }}
                      />
                    );
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <ChartLegend
            items={[
              { name: "New", color: "#1d4ed8" },
              { name: "In Progress", color: "#6366f1" },
              { name: "Pending", color: "#f59e0b" },
              { name: "Awaiting Customer", color: "#8b5cf6" },
              { name: "Resolved", color: "#10b981" },
              { name: "Closed", color: "#6b7280" },
            ]}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Avg Resolution Time by Dealer
          </h2>
          <div className="space-y-4 mt-4">
            {period.resolutionData.map((d) => (
              <div key={d.dealer} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                  {d.dealer}
                </span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${d.days <= 4 ? "bg-green-500" : d.days <= 6 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${(d.days / 8) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-bold w-10 text-right ${d.days <= 4 ? "text-green-700" : d.days <= 6 ? "text-amber-700" : "text-red-700"}`}
                >
                  {d.days}d
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              ≤ 4d Good
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              ≤ 6d Fair
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              &gt; 6d At Risk
            </span>
          </div>
        </Card>
      </div>

      {/* Agent Performance — sortable + paginated */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Agent Performance
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40">
              {agentCols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleAgentSort(c.key)}
                  className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none ${c.right ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`flex items-center gap-1 ${c.right ? "justify-end" : ""}`}
                  >
                    {c.label}{" "}
                    <SortIcon
                      col={c.key}
                      sortKey={agentSortKey}
                      sortDir={agentSortDir}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedAgents.map((a) => (
              <tr key={a.name} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-xs font-semibold text-foreground">
                  {a.name}
                </td>
                <td className="px-4 py-3 text-xs text-foreground text-right">
                  {a.new}
                </td>
                <td className="px-4 py-3 text-xs text-foreground text-right">
                  {a.resolved}
                </td>
                <td className="px-4 py-3 text-xs text-foreground text-right">
                  {a.avgDays}d
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 max-w-28">
                      <div
                        className={`h-1.5 rounded-full ${a.sla >= 80 ? "bg-green-500" : a.sla >= 65 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${a.sla}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold ${a.sla >= 80 ? "text-green-700" : a.sla >= 65 ? "text-amber-700" : "text-red-700"}`}
                    >
                      {a.sla}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={agentPage}
          total={sortedAgents.length}
          pageSize={agentPageSize}
          onChange={setAgentPage}
          onPageSizeChange={(s) => {
            setAgentPageSize(s);
            setAgentPage(1);
          }}
        />
      </Card>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  count: number;
  active: boolean;
}
interface StatusItem {
  name: Status;
  active: boolean;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { name: "Vehicle Quality", count: 34, active: true },
  { name: "Service Quality", count: 27, active: true },
  { name: "Billing", count: 19, active: true },
  { name: "Customer Experience", count: 15, active: true },
  { name: "Parts & Accessories", count: 12, active: true },
  { name: "Warranty", count: 9, active: true },
  { name: "Accessibility", count: 2, active: false },
];

const INITIAL_STATUS_ITEMS: StatusItem[] = [
  { name: "New", active: true },
  { name: "In Progress", active: true },
  { name: "Pending", active: true },
  { name: "Awaiting Customer", active: true },
  { name: "Resolved", active: true },
  { name: "Closed", active: true },
];

const USERS_LIST = [
  {
    name: "Jangili Rao",
    email: "j.rao@parkway.co.uk",
    role: "Admin" as UserRole,
    dealer: "All Centres",
    active: true,
  },
  {
    name: "Sarah Wilson",
    email: "s.wilson@parkway.co.uk",
    role: "Customer Relations" as UserRole,
    dealer: "Parkway Derby",
    active: true,
  },
  {
    name: "James Patterson",
    email: "j.patterson@parkway.co.uk",
    role: "Service Advisor" as UserRole,
    dealer: "Parkway Sheffield",
    active: true,
  },
  {
    name: "Emma Clarke",
    email: "e.clarke@parkway.co.uk",
    role: "Customer Relations" as UserRole,
    dealer: "Parkway Leeds",
    active: true,
  },
  {
    name: "David Hughes",
    email: "d.hughes@parkway.co.uk",
    role: "Service Advisor" as UserRole,
    dealer: "Parkway Manchester",
    active: false,
  },
];

const DEALERS_LIST = [
  {
    name: "Parkway Derby",
    code: "PKW-DBY",
    region: "East Midlands",
    active: true,
  },
  {
    name: "Parkway Sheffield",
    code: "PKW-SHF",
    region: "Yorkshire",
    active: true,
  },
  { name: "Parkway Leeds", code: "PKW-LDS", region: "Yorkshire", active: true },
  {
    name: "Parkway Manchester",
    code: "PKW-MCR",
    region: "North West",
    active: true,
  },
];

function SettingsScreen() {
  const [tab, setTab] = useState<
    "categories" | "statuses" | "users" | "dealers"
  >("categories");
  const [categories, setCategories] =
    useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [statuses, setStatuses] = useState<StatusItem[]>(INITIAL_STATUS_ITEMS);
  const [catPage, setCatPage] = useState(1);
  const [usrPage, setUsrPage] = useState(1);
  const [dlrPage, setDlrPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [usrPageSize, setUsrPageSize] = useState(10);
  const [dlrPageSize, setDlrPageSize] = useState(10);

  const perm = ROLE_PERMISSIONS[SSO_USER.role];

  if (!perm.canViewSettings) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-muted-foreground" />
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground">
            Your role ({SSO_USER.role}) does not have access to Settings.
          </p>
        </div>
      </div>
    );
  }

  const pagedCat = categories.slice(
    (catPage - 1) * catPageSize,
    catPage * catPageSize,
  );
  const pagedUsr = USERS_LIST.slice(
    (usrPage - 1) * usrPageSize,
    usrPage * usrPageSize,
  );
  const pagedDlr = DEALERS_LIST.slice(
    (dlrPage - 1) * dlrPageSize,
    dlrPage * dlrPageSize,
  );

  const tabs: {
    key: "categories" | "statuses" | "users" | "dealers";
    label: string;
  }[] = [
    { key: "categories", label: "Categories" },
    { key: "statuses", label: "Statuses" },
    { key: "users", label: "Users & Roles" },
    { key: "dealers", label: "Dealers" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Shield size={14} className="text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          Signed in as <strong>{SSO_USER.name}</strong> ({SSO_USER.role}) via
          exsto SSO. Full admin permissions active.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      {tab === "categories" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Complaint Categories
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <PlusCircle size={12} />
              Add Category
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                {[
                  "Category Name",
                  "Complaint Count",
                  "Active/Inactive",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedCat.map((c) => (
                <tr
                  key={c.name}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.count}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={c.active}
                        onChange={(v) =>
                          setCategories((prev) =>
                            prev.map((cat) =>
                              cat.name === c.name ? { ...cat, active: v } : cat,
                            ),
                          )
                        }
                      />
                      <span
                        className={`text-xs font-medium ${c.active ? "text-green-700" : "text-gray-500"}`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={catPage}
            total={categories.length}
            pageSize={catPageSize}
            onChange={setCatPage}
            onPageSizeChange={(s) => {
              setCatPageSize(s);
              setCatPage(1);
            }}
          />
        </Card>
      )}

      {/* Statuses */}
      {tab === "statuses" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Complaint Statuses
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                {["Status", "Badge", "Active/Inactive"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statuses.map((s) => (
                <tr
                  key={s.name}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {s.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.name} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={s.active}
                        onChange={(v) =>
                          setStatuses((prev) =>
                            prev.map((st) =>
                              st.name === s.name ? { ...st, active: v } : st,
                            ),
                          )
                        }
                      />
                      <span
                        className={`text-xs font-medium ${s.active ? "text-green-700" : "text-gray-500"}`}
                      >
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Users */}
      {tab === "users" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Users &amp; Roles
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Users size={12} />
              Invite User
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                {["Name", "Email", "Role", "Dealer", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedUsr.map((u) => (
                <tr
                  key={u.email}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {u.name}
                      </span>
                      {u.email === SSO_USER.email && (
                        <span className="text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.dealer}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${u.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={usrPage}
            total={USERS_LIST.length}
            pageSize={usrPageSize}
            onChange={setUsrPage}
            onPageSizeChange={(s) => {
              setUsrPageSize(s);
              setUsrPage(1);
            }}
          />
        </Card>
      )}

      {/* Dealers */}
      {tab === "dealers" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Dealer Centres
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Building2 size={12} />
              Add Dealer
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                {["Dealer Name", "Code", "Region", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedDlr.map((d) => (
                <tr
                  key={d.code}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {d.region}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${d.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={dlrPage}
            total={DEALERS_LIST.length}
            pageSize={dlrPageSize}
            onChange={setDlrPage}
            onPageSizeChange={(s) => {
              setDlrPageSize(s);
              setDlrPage(1);
            }}
          />
        </Card>
      )}
    </div>
  );
}

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
            complaints={COMPLAINTS}
            onBack={() => setScreen("complaints")}
          />
        )}
        {screen === "reports" && <ReportsScreen />}
        {screen === "settings" && <SettingsScreen />}
      </div>
    </div>
  );
}
