"use client";

import { cn } from "@/lib/cn";
import { formatHourly, formatMoney, formatWhole, getModel } from "@/lib/pricing";
import type { Alternative, CalcConfig, Instance } from "@/lib/types";
import { Kicker } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  alt: Alternative;
  letter: string;
  current: Instance;
  calc: CalcConfig;
  currentUnit: number;
  currentMonthly: number;
  open: boolean;
  onToggle: () => void;
  onApply: () => void;
  onCompare: () => void;
}

export function RecommendationCard({ alt: a, letter, current: ci, calc: c, currentUnit, currentMonthly, open, onToggle, onApply, onCompare }: Props) {
  const passed = a.criteria.filter((k) => k.ok).length;
  const pi = a.instance;
  const diff: [string, string, string][] = [
    ["Instance", ci.id, pi.id],
    ["vCPU", String(ci.vcpu), String(pi.vcpu)],
    ["Memory", `${ci.memoryGiB} GiB`, `${pi.memoryGiB} GiB`],
    ["Architecture", ci.arch, pi.arch],
    ["Pricing model", getModel(c.model).name, getModel(a.model).name],
    ["Hourly / instance", formatHourly(currentUnit), formatHourly(a.unitHourly)],
    [`Monthly × ${Math.max(1, c.qty)}`, formatMoney(currentMonthly), formatMoney(a.monthly)],
  ];

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-surface transition-colors", open ? "border-line-accent" : "border-line")}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] items-center gap-[18px] px-[22px] py-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-elevated font-mono text-sm font-semibold">{letter}</span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-[17px] font-semibold">{pi.id}</span>
            <span className="text-[13px] text-muted">{a.title}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11.5px] text-dim">New monthly</span>
            <span className="font-mono text-[15px] font-medium">{formatMoney(a.monthly)}</span>
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11.5px] text-dim">Checks</span>
            <span className="font-mono text-[15px] font-medium">
              {passed} / {a.criteria.length} passed
            </span>
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11.5px] text-dim">Effort</span>
            <span className={cn("font-mono text-[15px] font-medium", a.lowEffort ? "text-accent" : "text-warn")}>{a.effort}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[22px] font-semibold tracking-[-0.02em] text-accent">−{formatMoney(a.saving)}/mo</span>
            <span className="text-xs whitespace-nowrap text-muted">
              {Math.round(a.pct * 100)}% lower · {formatWhole(a.saving * 12)}/yr
            </span>
          </div>
          <Button variant="secondary" className="h-9 px-3.5 text-[13px]" aria-expanded={open} onClick={onToggle}>
            {open ? "Hide details" : "Why this recommendation?"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-px border-t border-line bg-line">
          <div className="flex flex-col gap-3 bg-sunken px-[22px] py-5">
            <Kicker>Why this recommendation?</Kicker>
            {a.criteria.map((k) => (
              <div key={k.text} className="flex items-start gap-2.5 text-[13.5px]">
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-md text-xs font-bold", k.ok ? "bg-accent/12 text-accent" : "bg-warn/12 text-warn")}>
                  {k.ok ? "✓" : "!"}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-ink">{k.text}</span>
                  <span className="font-mono text-xs font-medium text-dim">{k.detail}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 bg-sunken px-[22px] py-5">
            <Kicker>Current → Proposed</Kicker>
            <div className="flex flex-col">
              {diff.map(([k, x, y]) => {
                const same = x === y;
                const money = k.startsWith("Hourly") || k.startsWith("Monthly");
                return (
                  <div key={k} className="grid grid-cols-[minmax(90px,1fr)_1.2fr_1.2fr] items-center gap-2.5 border-b border-elevated py-2 text-[13px]">
                    <span className="text-muted">{k}</span>
                    <span className="font-mono text-muted">{x}</span>
                    <span className={cn("font-mono", same ? "text-muted" : money ? "font-semibold text-accent" : "font-semibold text-ink")}>{y}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="nav" className="text-[13.5px]" onClick={onApply}>
                Apply to calculator
              </Button>
              {a.kind === "swap" && (
                <Button variant="secondary" size="nav" className="text-[13.5px]" onClick={onCompare}>
                  Compare side by side
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
