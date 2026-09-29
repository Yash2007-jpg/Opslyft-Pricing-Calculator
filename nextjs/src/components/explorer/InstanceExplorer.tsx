"use client";

import { useMemo, useState } from "react";
import { WORKLOADS } from "@/data/catalog";
import { countActiveFilters, DEFAULT_FILTERS, filterInstances } from "@/lib/explorer";
import { getModel, osName } from "@/lib/pricing";
import { sortOptions } from "@/lib/options";
import type { Filters } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Segmented";
import { SearchIcon, SlidersIcon, XIcon } from "@/components/ui/Icons";
import { ProviderSwitch } from "@/components/ui/ProviderSwitch";
import { Select } from "@/components/ui/Select";
import { FilterPanel } from "./FilterPanel";
import { InstanceCard } from "./InstanceCard";

interface Props {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onGoCompare: () => void;
  detailOpen: boolean;
}

export function InstanceExplorer({ filters: f, setFilters, compareIds, onToggleCompare, onOpenDetail, onGoCompare, detailOpen }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const list = useMemo(() => filterInstances(f), [f]);
  const setF = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((p) => ({ ...p, [k]: v }));
  const reset = () => setFilters((p) => ({ ...DEFAULT_FILTERS, sort: p.sort }));

  return (
    <div data-screen-label="02 Instance Explorer" className="mx-auto flex max-w-[1320px] flex-col gap-6 px-[clamp(16px,4vw,48px)] pt-[clamp(28px,4vw,48px)] pb-[120px]">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.025em]">Instance Explorer</h1>
          <p className="m-0 text-base text-muted">Find the right compute configuration for your workload.</p>
        </div>
        <ProviderSwitch />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute top-3 left-3.5 text-dim" />
          <input
            value={f.query}
            onChange={(e) => setF("query", e.target.value)}
            placeholder="Search instance type or family — e.g. m6i, graviton"
            className="h-10 w-full rounded-[10px] border border-line-strong bg-surface pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-dim"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-line-strong bg-raised px-3.5 text-sm font-medium text-ink md:hidden"
        >
          <SlidersIcon />
          Filters
          <span className="rounded-full bg-[#1F3A2A] px-[7px] py-px font-mono text-[11px] font-semibold text-accent">{countActiveFilters(f)}</span>
        </button>
      </div>

      <FilterPanel filters={f} onChange={setF} sheetOpen={sheetOpen} onCloseSheet={() => setSheetOpen(false)} onReset={reset} resultCount={list.length} />

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5">
        {WORKLOADS.map((w) => (
          <Chip key={w.id} active={f.workload === w.id} onClick={() => setF("workload", w.id)}>
            {w.name}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[15px] font-semibold">{list.length} instances</span>
          <span className="font-mono text-[12.5px] font-medium text-dim">
            {f.region} · {osName(f.os)} · {getModel(f.model).name}
          </span>
          <Badge variant="sample">SAMPLE PRICING</Badge>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Sort
          <Select size="sm" className="w-auto bg-surface" value={f.sort} onValueChange={(v) => setF("sort", v as Filters["sort"])} options={sortOptions} />
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-3.5">
        {list.map((i) => (
          <InstanceCard
            key={i.id}
            instance={i}
            filters={f}
            inCompare={compareIds.includes(i.id)}
            onOpen={() => onOpenDetail(i.id)}
            onToggleCompare={() => onToggleCompare(i.id)}
          />
        ))}
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong p-12 text-center text-muted">
          No instances match these filters.
          <Button variant="secondary" size="nav" onClick={reset}>
            Reset filters
          </Button>
        </div>
      )}

      {compareIds.length > 0 && !detailOpen && <CompareTray ids={compareIds} onRemove={onToggleCompare} onCompare={onGoCompare} />}
    </div>
  );
}

export function CompareTray({ ids, onRemove, onCompare }: { ids: string[]; onRemove: (id: string) => void; onCompare: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[min(calc(100%-24px),720px)] -translate-x-1/2 items-center gap-3 rounded-[14px] border border-line-strong bg-raised/94 py-2.5 pr-2.5 pl-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,.7)] backdrop-blur-[12px]">
      <div className="scrollbar-none flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
        {ids.map((id) => (
          <span key={id} className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-line bg-canvas pr-1.5 pl-2.5 font-mono text-[12.5px] font-medium whitespace-nowrap">
            {id}
            <button type="button" aria-label={`Remove ${id}`} onClick={() => onRemove(id)} className="grid size-5 cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-muted hover:text-ink">
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>
      <Button size="nav" onClick={onCompare}>
        Compare {ids.length}
      </Button>
    </div>
  );
}
