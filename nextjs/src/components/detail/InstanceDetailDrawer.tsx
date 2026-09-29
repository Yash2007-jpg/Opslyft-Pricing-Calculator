"use client";

import { useRef, useState } from "react";
import { FAMILY_BLURBS, HOURS_PER_MONTH, REGIONS, WORKLOADS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatHourly, formatMoney, formatWhole, getInstance, getModel, isAvailable, osName, unitHourly } from "@/lib/pricing";
import { osOptions, regionIdOptions } from "@/lib/options";
import type { DetailConfig, PricingModelId } from "@/lib/types";
import { Badge, Kicker } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { XIcon } from "@/components/ui/Icons";
import { MetricGrid } from "@/components/ui/MetricGrid";
import { Field, Select } from "@/components/ui/Select";
import { NumberInput, Stepper } from "@/components/ui/Stepper";

const TABS = [
  ["overview", "Overview"],
  ["compute", "Compute"],
  ["memory", "Memory"],
  ["network", "Network"],
  ["storage", "Storage"],
  ["pricing", "Pricing"],
  ["availability", "Availability"],
] as const;

interface Props {
  instanceId: string | null;
  model: PricingModelId;
  config: DetailConfig;
  setConfig: React.Dispatch<React.SetStateAction<DetailConfig>>;
  inCompare: boolean;
  onClose: () => void;
  onToggleCompare: () => void;
  onCalculate: () => void;
  onFindAlternatives: () => void;
}

export function InstanceDetailDrawer({ instanceId, model, config: dc, setConfig, inCompare, onClose, onToggleCompare, onCalculate, onFindAlternatives }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("overview");
  const i = instanceId ? getInstance(instanceId) : undefined;

  const set = <K extends keyof DetailConfig>(k: K, v: DetailConfig[K]) => setConfig((p) => ({ ...p, [k]: v }));
  const goTab = (id: (typeof TABS)[number][0]) => {
    setTab(id);
    const el = scrollRef.current;
    const t = el?.querySelector<HTMLElement>(`#d-${id}`);
    if (el && t) el.scrollTo({ top: t.offsetTop - el.offsetTop - 12, behavior: "smooth" });
  };

  if (!i) return <Drawer open={false} onClose={onClose} label="Instance detail">{null}</Drawer>;

  const u = unitHourly(i, dc.region, dc.os, model);
  const specs = [
    {
      id: "compute",
      t: "Compute",
      big: `${i.vcpu} vCPU`,
      rows: [
        ["Processor", i.processor.split(" + ")[0]],
        ["Clock", i.clock],
        ["CPU model", i.burstable ? "Burstable (40% baseline)" : "Sustained"],
        ...(i.gpu ? [["Accelerator", i.gpu]] : []),
      ],
    },
    { id: "memory", t: "Memory", big: `${i.memoryGiB} GiB`, rows: [["Per vCPU", `${i.memoryGiB / i.vcpu} GiB`], ["Type", i.memoryType]] },
    { id: "network", t: "Network", big: i.network.replace("Up to ", ""), rows: [["Bandwidth", i.network], ["ENA", "Supported"], ["IPv6", "Supported"]] },
    { id: "storage", t: "Storage", big: i.nvme ? "NVMe" : "EBS only", rows: [["Instance store", i.nvme ?? "None"], ["EBS bandwidth", i.ebsBandwidth], ["EBS optimized", "Default"]] },
  ];
  const availableCount = REGIONS.filter((r) => isAvailable(i, r.id)).length;

  return (
    <Drawer open onClose={onClose} label={`${i.id} details`}>
      <div data-screen-label="03 Instance Detail" className="flex flex-col gap-3.5 border-b border-line px-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Kicker>AWS · EC2 · {i.family}</Kicker>
            <span className="font-mono text-[28px] font-semibold tracking-[-0.02em]">{i.id}</span>
            <div className="flex flex-wrap gap-1.5">
              <Badge>{i.category}</Badge>
              <Badge mono>{i.arch}</Badge>
              <Badge variant="accent">Current generation</Badge>
            </div>
          </div>
          <IconButton aria-label="Close" onClick={onClose}>
            <XIcon />
          </IconButton>
        </div>
        <div className="scrollbar-none flex gap-0.5 overflow-x-auto">
          {TABS.map(([id, l]) => (
            <button
              key={id}
              type="button"
              onClick={() => goTab(id)}
              className={cn(
                "h-[38px] cursor-pointer border-0 bg-transparent px-3 text-[13.5px] font-medium whitespace-nowrap",
                tab === id ? "text-ink shadow-[inset_0_-2px_0_var(--color-accent)]" : "text-muted hover:text-ink",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-7 overflow-y-auto p-6">
        <section id="d-overview" className="flex flex-col gap-2.5">
          <Kicker>Overview</Kicker>
          <p className="m-0 text-[14.5px] leading-[1.6] text-pretty text-ink-2">{FAMILY_BLURBS[i.family]}</p>
          <div className="flex flex-wrap gap-1.5">
            {i.workloads.map((w) => (
              <Badge key={w} variant="outline">
                {WORKLOADS.find((x) => x.id === w)?.name}
              </Badge>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {specs.map((s) => (
            <section key={s.id} id={`d-${s.id}`} className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-surface p-4">
              <Kicker>{s.t}</Kicker>
              <span className="font-mono text-xl font-semibold">{s.big}</span>
              {s.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 text-[12.5px]">
                  <span className="text-dim">{k}</span>
                  <span className="text-right text-ink-2">{v}</span>
                </div>
              ))}
            </section>
          ))}
        </div>

        <section id="d-pricing" className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <Kicker>Pricing · per instance</Kicker>
            <span className="font-mono text-[11.5px] font-medium text-dim">
              {dc.region} · {osName(dc.os)} · {getModel(model).name}
            </span>
          </div>
          <MetricGrid
            metrics={[
              { label: "Hourly", value: formatHourly(u) },
              { label: "Monthly", value: formatMoney(u * HOURS_PER_MONTH) },
              { label: "Annual", value: formatWhole(u * HOURS_PER_MONTH * 12) },
            ]}
          />
          <div className="flex flex-col gap-4 rounded-[14px] border border-line-glow bg-panel p-[18px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">Quantity</span>
                <Stepper size="md" value={dc.qty} onChange={(v) => set("qty", v)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">Hours / month</span>
                <NumberInput size="md" label="Hours per month" value={dc.hours} onChange={(v) => set("hours", v)} />
              </div>
              <Field label="Operating system">
                <Select value={dc.os} onValueChange={(v) => set("os", v as DetailConfig["os"])} options={osOptions} />
              </Field>
              <Field label="Region">
                <Select mono className="text-[13px]" value={dc.region} onValueChange={(v) => set("region", v as DetailConfig["region"])} options={regionIdOptions} />
              </Field>
            </div>
            <div className="flex items-end justify-between gap-3 border-t border-line pt-3.5">
              <div className="flex flex-col gap-[3px]">
                <span className="text-[13px] text-muted">Estimated monthly cost</span>
                <span className="font-mono text-xs font-medium text-dim">
                  {dc.qty} × {formatHourly(u)}/hr × {dc.hours} hrs
                </span>
              </div>
              <span className="font-mono text-[28px] font-semibold tracking-[-0.03em]">{formatMoney(u * dc.qty * dc.hours)}</span>
            </div>
          </div>
        </section>

        <section id="d-availability" className="flex flex-col gap-2.5">
          <Kicker>Availability · {availableCount} of 6 regions</Kicker>
          <div className="flex flex-col overflow-hidden rounded-xl border border-line">
            {REGIONS.map((r) => {
              const ok = isAvailable(i, r.id);
              const sel = r.id === dc.region;
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={!ok}
                  onClick={() => set("region", r.id)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 border-0 border-b border-line-soft px-3.5 py-[11px] text-left last:border-b-0",
                    sel ? "bg-raised" : "bg-surface",
                    ok ? "cursor-pointer hover:bg-raised" : "cursor-default opacity-50",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={cn("size-[7px] rounded-full", !ok ? "shadow-[inset_0_0_0_1.5px_var(--color-line-hover)]" : sel ? "bg-accent" : "bg-line-hover")} />
                    <span className="font-mono text-[13px] font-medium text-ink">{r.id}</span>
                    <span className="text-[12.5px] text-dim">{r.name}</span>
                  </span>
                  <span className="font-mono text-[13px] font-medium text-ink-2">{ok ? `${formatHourly(unitHourly(i, r.id, dc.os, model))}/hr` : "Not offered"}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line bg-overlay px-6 py-4">
        <Button className="h-11 flex-[1_1_150px] text-sm" onClick={onCalculate}>
          Calculate cost
        </Button>
        <Button variant="secondary" className="h-11 flex-[1_1_140px] text-sm" onClick={onToggleCompare}>
          {inCompare ? "Remove from compare" : "Compare instance"}
        </Button>
        <Button variant="savings" className="h-11 flex-[1_1_190px] text-sm" onClick={onFindAlternatives}>
          Find cheaper alternatives
        </Button>
      </div>
    </Drawer>
  );
}
