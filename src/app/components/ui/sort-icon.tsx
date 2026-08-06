import * as Icons from "../../services/iconService";

export function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: string;
  sortKey: string;
  sortDir: "asc" | "desc";
}) {
  if (col !== sortKey) {
    return (
      <Icons.ArrowUpDown
        size={11}
        className="text-muted-foreground opacity-40"
      />
    );
  }

  return sortDir === "asc" ? (
    <Icons.ArrowUp size={11} className="text-primary" />
  ) : (
    <Icons.ArrowDown size={11} className="text-primary" />
  );
}
