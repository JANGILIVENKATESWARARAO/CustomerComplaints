import { useEffect, useRef, useState } from "react";
import * as Icons from "../../services/iconService";

export function MultiSelect({
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
      <button
        onClick={() => {
          setOpen((v) => !v);
          setQ("");
        }}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg bg-card hover:bg-muted transition-colors min-w-36 ${open ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
      >
        <span className="flex-1 text-left truncate text-foreground">
          {selected.length === 0
            ? `All ${label}`
            : `${label} (${selected.length})`}
        </span>
        <Icons.ChevronDown
          size={12}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 bg-card border border-border rounded-lg shadow-2xl min-w-56 overflow-hidden ring-1 ring-black/5">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {label}
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background transition-all">
              <Icons.Search
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
                  <Icons.X size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto px-1.5 pb-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <Icons.Search size={16} className="text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  No results for “{q}”
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
                        <Icons.Check
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
