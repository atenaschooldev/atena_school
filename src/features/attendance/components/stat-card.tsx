interface StatCardProps {
  label: string;
  value: string | number;
  tone: "success" | "destructive" | "warning";
}

export function StatCard({ label, value, tone }: StatCardProps) {
  const toneClass = {
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning-foreground",
  }[tone];

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold tabular mt-2 inline-block px-2 py-0.5 rounded ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}
