import type { ReactNode } from "react";
import type { Status } from "../types";
import { STATUS_STYLES } from "../utils";

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden max-w-full ${STATUS_STYLES[status]}`}
      style={{ textOverflow: "ellipsis", display: "inline-flex" }}
    >
      {status}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
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

// ─── ChartLegend ──────────────────────────────────────────────────────────────
export function ChartLegend({
  items,
}: {
  items: { name: string; color: string }[];
}) {
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

// ─── ChartTooltip ─────────────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }: any) {
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

// ─── RequiredLabel ────────────────────────────────────────────────────────────
export function RequiredLabel({
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

// ─── CharCounter ──────────────────────────────────────────────────────────────
export function CharCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  return (
    <div className="text-xs text-muted-foreground text-right mt-1">
      {current} / {max}
    </div>
  );
}
