import * as Icons from "../../services/iconService";
import { MiniSelect } from "./mini-select";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 24, 30];

export function PaginationControl({
  page,
  total,
  pageSize,
  onChange,
  onPageSizeChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
}) {
  if (total <= 5) return null;

  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {start} - {end} of {total}
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Per page:</span>
            <MiniSelect
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(v) => onPageSizeChange(Number(v))}
            />
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <Icons.ChevronLeft size={12} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`w-7 h-7 text-xs rounded border transition-colors ${page === i + 1 ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <Icons.ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
