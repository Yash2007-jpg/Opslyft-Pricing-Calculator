"use client";

import type { CSSProperties } from "react";
import { HOURS_PER_MONTH } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatHourly, formatMoney, getModel, osName, unitHourly } from "@/lib/pricing";
import type { Filters, Instance } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { XIcon } from "@/components/ui/Icons";
import { Select } from "@/components/ui/Select";

interface Cell {
  text: string;
  sub?: string;
  cmp: string | number;
  color?: "accent" | "muted";
  subAccent?: boolean;
  best?: boolean;
}

interface Props {
  instances: Instance[];
  filters: Filters;
  addOptions: { value: string; label: string }[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onMakeBaseline: (id: string) => void;
}

/**
 * Baseline = first column. Cells that differ from baseline get a lifted fill;
 * matching cells are muted; green marks only the lowest cost.
 * Column widths use CSS vars so mobile gets narrower tracks + horizontal scroll.
 */
export function ComparisonTable({ instances, filters: f, addOptions, onAdd, onRemove, onMakeBaseline }: Props) {
  const n = instances.length;
  const prices = instances.map((i) => unitHourly(i, f.region, f.os, f.model));
  const minP = Math.min(...prices);
  const grid: CSSProperties = { gridTemplateColumns: `var(--lab) repeat(${n}, minmax(var(--col), 1fr))` };

  const rows: { label: string; cells: Cell[]; best?: boolean }[] = [
    { label: "vCPU", cells: instances.map((i) => ({ text: String(i.vcpu), cmp: i.vcpu })) },
    { label: "Memory", cells: instances.map((i) => ({ text: `${i.memoryGiB} GiB`, sub: `${i.memoryGiB / i.vcpu} GiB / vCPU`, cmp: i.memoryGiB })) },
    { label: "Architecture", cells: instances.map((i) => ({ text: i.arch, cmp: i.arch })) },
    { label: "Processor", cells: instances.map((i) => ({ text: i.processor.split(" + ")[0], sub: i.clock, cmp: i.processor })) },
    { label: "Network", cells: instances.map((i) => ({ text: i.network, cmp: i.network })) },
    { label: "Storage", cells: instances.map((i) => ({ text: i.nvme ? `${i.nvme} NVMe` : "EBS only", cmp: i.nvme ?? "ebs" })) },
    { label: "Hourly price", best: true, cells: prices.map((p) => ({ text: formatHourly(p), cmp: p, best: p === minP })) },
    { label: "Monthly cost", best: true, cells: prices.map((p) => ({ text: formatMoney(p * HOURS_PER_MONTH), cmp: p, best: p === minP })) },
    {
      label: "Savings vs baseline",
      best: true,
      cells: prices.map((p, k): Cell => {
        if (k === 0) return { text: "—", sub: "Baseline", cmp: 0 };
        const d = (prices[0] - p) * HOURS_PER_MONTH;
        const pct = Math.round((Math.abs(d) / (prices[0] * HOURS_PER_MONTH)) * 100);
        return d > 0
          ? { text: `−${formatMoney(d)}/mo`, sub: `${pct}% lower`, cmp: 1, color: "accent", subAccent: true, best: p === minP }
          : { text: `+${formatMoney(-d)}/mo`, sub: `${pct}% higher`, cmp: 1, color: "muted" };
      }),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
      <div className="overflow-x-auto [--col:150px] [--lab:112px] md:[--col:180px] md:[--lab:180px]">
        <div style={{ minWidth: `calc(var(--lab) + ${n} * var(--col))` }}>
          <div className="grid" style={grid}>
            <div className="flex flex-col justify-end gap-1.5 border-b border-line px-5 py-[18px]">
              <span className="font-mono text-[11px] font-medium tracking-[.06em] text-dim">{n} OF 4</span>
              {n < 4 && (
                <Select
                  size="sm"
                  value=""
                  placeholder="+ Add instance"
                  onValueChange={(v) => v && onAdd(v)}
                  options={addOptions}
                  className="border-dashed bg-transparent pr-[30px] pl-2.5 text-muted"
                />
              )}
            </div>
            {instances.map((i, k) => {
              const cheapest = prices[k] === minP;
              return (
                <div key={i.id} className={cn("flex flex-col gap-1.5 border-b border-l border-line px-5 py-[18px]", k === 0 && "bg-panel")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("font-mono text-[10.5px] font-semibold tracking-[.06em]", k === 0 ? "text-ink" : cheapest ? "text-accent" : "text-dim")}>
                      {k === 0 ? "BASELINE" : cheapest ? "LOWEST COST" : `OPTION ${k}`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${i.id}`}
                      onClick={() => onRemove(i.id)}
                      className="grid size-[26px] cursor-pointer place-items-center rounded-[7px] border border-line bg-transparent text-muted hover:text-ink"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                  <span className="font-mono text-[17px] font-semibold">{i.id}</span>
                  <span className="text-[12.5px] text-muted">
                    {i.family} · {i.category}
                  </span>
                  {k > 0 && (
                    <Button variant="link" className="self-start" onClick={() => onMakeBaseline(i.id)}>
                      Set as baseline
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {rows.map((r) => (
            <div key={r.label} className="grid border-b border-line-soft" style={grid}>
              <div className="flex items-center px-5 py-3.5 text-[13.5px] text-muted">{r.label}</div>
              {r.cells.map((c, k) => {
                const diff = k > 0 && c.cmp !== r.cells[0].cmp;
                const best = r.best && c.best;
                return (
                  <div
                    key={k}
                    className={cn(
                      "flex flex-col justify-center gap-[3px] border-l border-line px-5 py-3.5",
                      best ? "bg-accent/7" : diff ? "bg-raised" : k === 0 ? "bg-panel" : "bg-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-sm font-medium",
                        c.color === "accent" || best ? "text-accent" : c.color === "muted" ? "text-ink-2" : k === 0 || diff ? "text-ink" : "text-faint",
                      )}
                    >
                      {c.text}
                    </span>
                    {c.sub && <span className={cn("text-xs", c.subAccent ? "text-[#3A9A57]" : "text-dim")}>{c.sub}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-5 border-t border-line px-5 py-3.5 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-[3px] bg-elevated shadow-[inset_0_0_0_1px_var(--color-line-hover)]" />
          Differs from baseline
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-[3px] bg-accent/20 shadow-[inset_0_0_0_1px_var(--color-accent)]" />
          Lowest cost
        </span>
        <span className="ml-auto font-mono text-dim">
          {f.region} · {osName(f.os)} · {getModel(f.model).name} · 730 hrs/mo · sample pricing
        </span>
      </div>
    </div>
  );
}
