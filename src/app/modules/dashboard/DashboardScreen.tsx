import { useState, useMemo } from "react";
import type { Complaint, Screen, DateRange } from "../../types";
import { TREND_DATA, DASHBOARD_DATA } from "../../chartData";
import { STATUS_LINE_COLORS, getXAxisInterval, PIE_COLORS } from "../../utils";
import { Card, StatusBadge, ChartTooltip, ChartLegend } from "../../components/shared.tsx";
import { MiniSelect } from "../../components/ui/mini-select";
import * as Recharts from "../../services/rechartsService";
import * as Icons from "../../services/iconService";

interface DashboardScreenProps {
  complaints: Complaint[];
  onNavigate: (s: Screen, id?: string) => void;
}

export function DashboardScreen({
  complaints,
  onNavigate,
}: DashboardScreenProps) {
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
        <Recharts.ResponsiveContainer width="100%" height={230}>
          <Recharts.LineChart
            data={trendData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <Recharts.CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />
            <Recharts.XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              interval={getXAxisInterval(trendData.length)}
              axisLine={false}
              tickLine={false}
            />
            <Recharts.YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Recharts.Tooltip content={ChartTooltip} />
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
              <Recharts.Line
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
          </Recharts.LineChart>
        </Recharts.ResponsiveContainer>
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
          <Recharts.ResponsiveContainer width="100%" height={190}>
            <Recharts.BarChart
              data={dash.categoryData}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <Recharts.CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                horizontal={false}
              />
              <Recharts.XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                width={88}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.Tooltip content={ChartTooltip} />
              <Recharts.Bar
                dataKey="count"
                name="Complaints"
                fill="#1d4ed8"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        </Card>

        {/* Complaint Aging */}
        <Card className="p-5">
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
