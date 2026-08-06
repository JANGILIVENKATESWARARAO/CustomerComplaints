import { useEffect, useRef, useState } from "react";
import * as Icons from "../../services/iconService";

export function MiniSelect<T extends string | number>({
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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
        <Icons.ChevronDown
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
