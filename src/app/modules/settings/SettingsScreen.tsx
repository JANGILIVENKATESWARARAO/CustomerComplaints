import { useState } from "react";
import type { Status, UserRole } from "../../types";
import { SSO_USER, ROLE_PERMISSIONS } from "../../constants";
import { StatusBadge, Card } from "../../components/shared.tsx";
import { PaginationControl } from "../../components/ui/pagination-control";
import { ToggleSwitch } from "../../components/ui/toggle-switch";
import * as Icons from "../../services/iconService";

// ─── Local Types & Data ────────────────────────────────────────────────────────

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

// ─── SettingsScreen ────────────────────────────────────────────────────────────

export function SettingsScreen() {
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
            <Icons.Shield size={24} className="text-muted-foreground" />
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
        <Icons.Shield size={14} className="text-blue-600 flex-shrink-0" />
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
              <Icons.PlusCircle size={12} />
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
                      <ToggleSwitch
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
          <PaginationControl
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
                      <ToggleSwitch
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
              <Icons.Users size={12} />
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
          <PaginationControl
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
              <Icons.Building2 size={12} />
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
          <PaginationControl
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
