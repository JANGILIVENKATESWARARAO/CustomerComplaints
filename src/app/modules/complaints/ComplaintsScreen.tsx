import { useState, useMemo } from "react";
import type { Complaint, Screen } from "../../types";
import { ALL_STATUSES, ALL_CATEGORIES, ALL_AGENTS } from "../../utils";
import { Card, StatusBadge } from "../../components/shared.tsx";
import { MultiSelect } from "../../components/ui/multi-select";
import { SortIcon } from "../../components/ui/sort-icon";
import { PaginationControl } from "../../components/ui/pagination-control";
import * as Icons from "../../services/iconService";

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

interface ComplaintsScreenProps {
  complaints: Complaint[];
  onNavigate: (s: Screen, id?: string) => void;
}

export function ComplaintsScreen({
  complaints,
  onNavigate,
}: ComplaintsScreenProps) {
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
            <Icons.Search
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
            options={ALL_STATUSES.filter((s) => s !== "Pending")}
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
            label="Assignees"
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
                  className={`hover:bg-muted/30 transition-colors ${selectedIds.has(c.id) ? "bg-blue-50/40 cursor-pointer" : "cursor-pointer"}`}
                  onClick={() => onNavigate("complaint-details", c.id)}
                >
                  <td
                    className="px-4 py-3 text-xs font-semibold text-primary"
                  >
                    {c.id}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-foreground"
                  >
                    {c.customer.name}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-foreground max-w-52 truncate"
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
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No complaints match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
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
