"use client";

import { cn } from "@/lib/cn";
import { formatHourly, formatMoney, osName, unitHourly } from "@/lib/pricing";
import { HOURS_PER_MONTH } from "@/data/catalog";
import type { Filters, Instance } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon } from "@/components/ui/Icons";

interface Props {
  instance: Instance;
  filters: Filters;
  inCompare: boolean;
  onOpen: () => void;
  onToggleCompare: () => void;
}

export function InstanceCard({ instance: i, filters: f, inCompare, onOpen, onToggleCompare }: Props) {
  const h = unitHourly(i, f.region, f.os, f.model);
  const tag = i.burstable ? "Burstable" : i.gpu;
  const specs = [
    { k: "vCPU", v: String(i.vcpu) },
    { k: "Memory", v: `${i.memoryGiB} GiB` },
    { k: "Architecture", v: i.arch },
    { k: "Network", v: i.network },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className={cn(
        "flex cursor-pointer flex-col gap-4 rounded-2xl border bg-surface p-[18px] transition-colors hover:border-line-accent hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        inCompare ? "border-line-accent" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-lg font-semibold tracking-[-0.01em]">{i.id}</span>
          <div className="flex flex-wrap gap-1.5">
            <Badge>
              {i.family} · {i.category}
            </Badge>
            {tag && <Badge variant="warn">{tag}</Badge>}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={inCompare}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={cn(
            "inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-[7px] rounded-lg border pr-2.5 pl-2 text-[12.5px] font-medium",
            inCompare ? "border-line-accent bg-accent/8 text-accent" : "border-line-strong bg-transparent text-ink-2",
          )}
        >
          <span className={cn("grid size-3.5 place-items-center rounded", inCompare ? "bg-accent text-on-accent" : "shadow-[inset_0_0_0_1.5px_var(--color-dim)]")}>
            {inCompare && <CheckIcon />}
          </span>
          {inCompare ? "Added" : "Compare"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
        {specs.map((s) => (
          <div key={s.k} className="flex flex-col gap-[3px] bg-surface px-3 py-2.5">
            <span className="text-[11px] text-dim">{s.k}</span>
            <span className={cn("truncate font-mono font-medium", s.k === "Network" ? "text-[13px]" : "text-sm")}>{s.v}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-medium text-dim">
            {f.region} · {osName(f.os)}
          </span>
          <span className="font-mono text-[13px] font-medium text-ink-2">
            {formatHourly(h)}
            <span className="text-dim">/hr</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-xl font-semibold tracking-[-0.02em]">{formatMoney(h * HOURS_PER_MONTH)}</span>
          <span className="text-[11.5px] text-dim">per month · 730 hrs</span>
        </div>
      </div>
    </div>
  );
}
