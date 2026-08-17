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

export interface SourceItem {
  name: string;
  active: boolean;
}
const INITIAL_SOURCE_ITEMS: SourceItem[] = [
  { name: "Inbound", active: true },
  { name: "Online Booking", active: true },
  { name: "Email", active: true },
  { name: "Company Portal", active: true },
  { name: "Telephonic System", active: true } 
]; 
const INITIAL_CATEGORIES: CategoryItem[] = [
  { name: "Vehicle Quality", count: 34, active: true },
  { name: "Service Quality", count: 27, active: true },
  { name: "Billing", count: 19, active: true },
  { name: "Customer Experience", count: 15, active: true },
  { name: "Parts & Accessories", count: 12, active: true },
  { name: "Warranty", count: 9, active: true },
  { name: "Accessibility", count: 2, active: false },
];

// ─── SettingsScreen ────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const [tab, setTab] = useState<
    "categories" | "sources"  //| "statuses" | "users" | "dealers"
  >("categories");
  const [categories, setCategories] =
    useState<CategoryItem[]>(INITIAL_CATEGORIES);
     

  const [sources, setSources] =
    useState<SourceItem[]>(INITIAL_SOURCE_ITEMS); 
  const [catPage, setCatPage] = useState(1);
  const [sourcePage, setSourcePage] = useState(1); 
  const [catPageSize, setCatPageSize] = useState(10);
  const [sourcePageSize, setSourcePageSize] = useState(10); 

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
  const pagedSources = INITIAL_SOURCE_ITEMS.slice(
     (sourcePage - 1) * sourcePageSize,
     sourcePage * sourcePageSize,
   ); 

  const tabs: {
    key: "categories" | "sources" ,  
    label: string;
  }[] = [
    { key: "categories", label: "Categories" },
    { key: "sources", label: "Sources" }     
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
       {tab === "sources" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Complaint Statuses
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                {["Source",   "Active/Inactive"].map((h) => (
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
              {sources.map((s) => (
                <tr
                  key={s.name}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {s.name}
                  </td> 
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={s.active}
                        onChange={(v) =>
                          setSources((prev) =>
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

       
    </div>
  );
}
