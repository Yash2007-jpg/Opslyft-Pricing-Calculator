import { cn } from "@/lib/cn";

export interface Metric {
  label: string;
  value: string;
}

/** Hairline-divided grid of label/value cells (pricing summaries, spec tiles). */
export function MetricGrid({ metrics, columns, className, valueClassName }: { metrics: Metric[]; columns?: number; className?: string; valueClassName?: string }) {
  return (
    <div
      className={cn("grid gap-px overflow-hidden rounded-xl border border-line bg-line", className)}
      style={{ gridTemplateColumns: `repeat(${columns ?? metrics.length}, minmax(0, 1fr))` }}
    >
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-1 bg-surface p-3.5">
          <span className="text-[11.5px] text-dim">{m.label}</span>
          <span className={cn("font-mono text-base font-semibold whitespace-nowrap", valueClassName)}>{m.value}</span>
        </div>
      ))}
    </div>
  );
}
