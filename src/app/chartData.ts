import type { DateRange } from "./types";

// Helper to create trend data points
const mkPt = (label: string, b: number) => ({
  label,
  new: b,
  inProgress: Math.round(b * 0.55),
  pending: Math.round(b * 0.38),
  awaitingCustomer: Math.round(b * 0.22),
  resolved: Math.round(b * 0.78),
  closed: Math.round(b * 0.14),
});

// Trend data for all date ranges
export const TREND_DATA: Record<DateRange, ReturnType<typeof mkPt>[]> = {
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

export const DASHBOARD_DATA: Record<DateRange, DashboardPeriod> = {
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

// ─── Reports Data ─────────────────────────────────────────────────────────────
interface ReportsKpi {
  value: string;
  delta: string;
  trendUp: boolean;
  trendGood: boolean;
}

export interface ReportsPeriod {
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

export const REPORTS_DATA: Record<DateRange, ReportsPeriod> = {
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
