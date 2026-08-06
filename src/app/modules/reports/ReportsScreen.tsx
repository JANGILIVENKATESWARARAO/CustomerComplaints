import { useState, useMemo, useEffect } from "react";
import type { DateRange } from "../../types";
import { COMPLAINTS } from "../../data";
import { REPORTS_DATA } from "../../chartData";
import { PIE_COLORS } from "../../utils";
import { Card, ChartTooltip, ChartLegend } from "../../components/shared.tsx";
import { MiniSelect } from "../../components/ui/mini-select";
import { PaginationControl } from "../../components/ui/pagination-control";
import { SortIcon } from "../../components/ui/sort-icon";
import * as Recharts from "../../services/rechartsService";
import * as Icons from "../../services/iconService";

type AgentSortKey = "name" | "new" | "resolved" | "avgDays" | "sla";
type SortDir = "asc" | "desc";

const TrendingUp = Icons.TrendingUp;
const TrendingDown = Icons.TrendingDown;

export function ReportsScreen() {
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
      icon: <Icons.Timer size={14} className="text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Avg Resolution Time",
      ...period.kpis.resolutionTime,
      icon: <Icons.Clock size={14} className="text-green-500" />,
      iconBg: "bg-green-50",
    },
    {
      label: "Resolution Rate",
      ...period.kpis.resolutionRate,
      icon: <Icons.CheckCircle2 size={14} className="text-teal-500" />,
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
          <Icons.Download size={13} />
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
          <Recharts.ResponsiveContainer width="100%" height={220}>
            <Recharts.AreaChart
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
              <Recharts.CartesianGrid
                key="grid"
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
              />
              <Recharts.XAxis
                key="xaxis"
                dataKey="label"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.YAxis
                key="yaxis"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.Tooltip key="tooltip" content={ChartTooltip} />
              <Recharts.Area
                key="area-complaints"
                type="monotone"
                dataKey="complaints"
                name="Complaints"
                stroke="#1d4ed8"
                fill="url(#gComp)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Recharts.Area
                key="area-resolved"
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                fill="url(#gRes)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </Recharts.AreaChart>
          </Recharts.ResponsiveContainer>
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
            <Recharts.ResponsiveContainer width={180} height={200}>
              <Recharts.PieChart key={dateRange}>
                <Recharts.Pie
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
                    <Recharts.Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Recharts.Pie>
                <Recharts.Tooltip content={ChartTooltip} />
              </Recharts.PieChart>
            </Recharts.ResponsiveContainer>
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
          <Recharts.ResponsiveContainer width="100%" height={220}>
            <Recharts.BarChart
              key={dateRange}
              data={period.dealerData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <Recharts.CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                vertical={false}
              />
              <Recharts.XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.Tooltip
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
                <Recharts.Bar
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
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
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

      {/* Agent Performance */}
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
        <PaginationControl
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
