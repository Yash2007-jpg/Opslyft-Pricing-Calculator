"use client";

import { INSTANCES } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatMoney, getInstance } from "@/lib/pricing";
import { modelOptions, osOptions, regionOptions } from "@/lib/options";
import { swapAlternatives } from "@/lib/recommendations";
import type { Filters, Instance } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ScreenShell } from "@/components/layout/SiteChrome";
import { ComparisonTable } from "./ComparisonTable";

interface Props {
  compareIds: string[];
  setCompareIds: React.Dispatch<React.SetStateAction<string[]>>;
  onToggleCompare: (id: string) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onGoExplorer: () => void;
}

export function ComparisonView({ compareIds, setCompareIds, onToggleCompare, filters: f, setFilters, onGoExplorer }: Props) {
  const instances = compareIds.map(getInstance).filter(Boolean) as Instance[];
  const base = instances[0];
  const full = compareIds.length >= 4;
  const setF = <K extends keyof Filters>(k: K) => (v: string) => setFilters((p) => ({ ...p, [k]: v as Filters[K] }));

  const recs = base
    ? swapAlternatives(base, { region: f.region, os: f.os, model: f.model, qty: 1, hours: 730 }, { arch: true, burst: false, lessMem: false }, compareIds).slice(0, 3)
    : [];

  return (
    <ScreenShell
      label="04 Comparison"
      title="Compare instances"
      subtitle="Differences are measured against the baseline in the first column."
      actions={
        <div className="flex flex-wrap gap-2.5">
          <Select className="h-[38px] w-auto text-[13.5px]" value={f.region} onValueChange={setF("region")} options={regionOptions} />
          <Select className="h-[38px] w-auto text-[13.5px]" value={f.os} onValueChange={setF("os")} options={osOptions} />
          <Select className="h-[38px] w-auto text-[13.5px]" value={f.model} onValueChange={setF("model")} options={modelOptions} />
        </div>
      }
    >
      {instances.length < 2 ? (
        <div className="flex flex-col items-start gap-3.5 rounded-2xl border border-dashed border-line-strong px-6 py-12">
          <span className="text-lg font-semibold">Select at least two instances to compare.</span>
          <span className="text-muted">Use the Compare toggle on any instance card, or add one below.</span>
          <Button size="nav" onClick={onGoExplorer}>
            Open Instance Explorer
          </Button>
        </div>
      ) : (
        <>
          <ComparisonTable
            instances={instances}
            filters={f}
            addOptions={INSTANCES.filter((i) => !compareIds.includes(i.id)).map((i) => ({ value: i.id, label: i.id }))}
            onAdd={onToggleCompare}
            onRemove={onToggleCompare}
            onMakeBaseline={(id) => setCompareIds((c) => [id, ...c.filter((x) => x !== id)])}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="m-0 text-[22px] font-semibold tracking-[-0.015em]">Recommended alternatives to {base.id}</h2>
              <p className="m-0 max-w-[720px] text-sm text-pretty text-muted">
                Only instances with at least the baseline&apos;s vCPU and memory, availability in {f.region} and a lower hourly price. Architecture changes are flagged.
                Ranked by monthly savings.
              </p>
            </div>
            {recs.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3.5">
                {recs.map((a) => (
                  <div key={a.id} className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-base font-semibold">{a.instance.id}</span>
                        <span className="text-[12.5px] text-muted">{a.title}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-base font-semibold text-accent">−{formatMoney(a.saving)}</span>
                        <span className="text-[11.5px] text-dim">per instance / mo</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {a.criteria.map((k) => (
                        <span
                          key={k.text}
                          className={cn(
                            "inline-flex h-6 items-center rounded-md px-[9px] text-xs",
                            /\d|_|-/.test(k.short) && "font-mono",
                            k.ok ? "bg-accent/8 text-accent-soft" : "bg-warn/10 text-warn",
                          )}
                        >
                          {k.short}
                        </span>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" className="self-start" onClick={() => onToggleCompare(a.id)}>
                      {full ? "Replace last column" : "Add to comparison"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[14px] border border-dashed border-line-strong p-6 text-sm text-muted">No lower-cost instance meets all criteria for this baseline.</div>
            )}
          </div>
        </>
      )}
    </ScreenShell>
  );
}
