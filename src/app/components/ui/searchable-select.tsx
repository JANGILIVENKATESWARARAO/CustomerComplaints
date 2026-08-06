import { useEffect, useRef, useState } from "react";
import * as Icons from "../../services/iconService";

export function SearchableSelect({
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
            <Icons.X size={11} />
          </span>
        )}
        <Icons.ChevronDown
          size={11}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl overflow-hidden ring-1 ring-black/5">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background transition-all">
              <Icons.Search
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
                const selected = opt === value;
                return (
                  <button
                    key={opt}
                    onClick={() => select(opt)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${selected ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted"}`}
                  >
                    <span
                      className={`text-xs flex-1 ${selected ? "font-medium" : ""}`}
                    >
                      {opt}
                    </span>
                    {selected && (
                      <Icons.Check size={12} className="text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
