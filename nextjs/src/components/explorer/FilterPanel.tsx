"use client";

import { cn } from "@/lib/cn";
import type { Filters } from "@/lib/types";
import { archOptions, memOptions, modelOptions, osOptions, regionOptions, vcpuOptions, workloadOptions } from "@/lib/options";
import { Field, Select } from "@/components/ui/Select";
import { Button, IconButton } from "@/components/ui/Button";
import { XIcon } from "@/components/ui/Icons";

interface Props {
  filters: Filters;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  /** Mobile sheet state. On md+ the panel always renders inline. */
  sheetOpen: boolean;
  onCloseSheet: () => void;
  onReset: () => void;
  resultCount: number;
}

/** Inline filter grid on tablet/desktop; bottom sheet on mobile. */
export function FilterPanel({ filters: f, onChange, sheetOpen, onCloseSheet, onReset, resultCount }: Props) {
  const set =
    <K extends keyof Filters>(k: K) =>
    (v: string) =>
      onChange(k, v as Filters[K]);

  return (
    <>
      {sheetOpen && <div onClick={onCloseSheet} className="fixed inset-0 z-70 bg-[rgb(3_6_9/0.6)] md:hidden" />}
      <div
        className={cn(
          // mobile: bottom sheet
          "fixed inset-x-0 bottom-0 z-75 max-h-[82vh] grid-cols-1 gap-4 overflow-y-auto rounded-t-[20px] border-t border-line-strong bg-surface px-4 pt-5 pb-6 shadow-[0_-20px_60px_rgba(0,0,0,.6)]",
          sheetOpen ? "grid" : "hidden",
          // md+: inline panel
          "md:static md:z-auto md:grid md:max-h-none md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:gap-3 md:overflow-visible md:rounded-2xl md:border md:border-line md:p-4 md:shadow-none",
        )}
      >
        <div className="col-span-full flex items-center justify-between md:hidden">
          <span className="text-[17px] font-semibold">Filters</span>
          <IconButton aria-label="Close filters" onClick={onCloseSheet}>
            <XIcon />
          </IconButton>
        </div>
        <Field label="Workload" className="col-span-full md:hidden">
          <Select size="lg" value={f.workload} onValueChange={set("workload")} options={workloadOptions} />
        </Field>
        <Field label="Region">
          <Select value={f.region} onValueChange={set("region")} options={regionOptions} />
        </Field>
        <Field label="Architecture">
          <Select value={f.arch} onValueChange={set("arch")} options={archOptions} />
        </Field>
        <Field label="vCPU">
          <Select value={f.vcpu} onValueChange={set("vcpu")} options={vcpuOptions} />
        </Field>
        <Field label="Memory">
          <Select value={f.mem} onValueChange={set("mem")} options={memOptions} />
        </Field>
        <Field label="Pricing model">
          <Select value={f.model} onValueChange={set("model")} options={modelOptions} />
        </Field>
        <Field label="Operating system">
          <Select value={f.os} onValueChange={set("os")} options={osOptions} />
        </Field>
        <div className="col-span-full flex gap-2.5 pt-1.5 md:hidden">
          <Button variant="secondary" className="h-[46px] px-[18px]" onClick={onReset}>
            Reset
          </Button>
          <Button className="h-[46px] flex-1" onClick={onCloseSheet}>
            Show {resultCount} instances
          </Button>
        </div>
      </div>
    </>
  );
}
