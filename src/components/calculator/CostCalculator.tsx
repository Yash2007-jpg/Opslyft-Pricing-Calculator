"use client";

import { INSTANCES, OPERATING_SYSTEMS, PRICING_MODELS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatHourly, formatMoney, formatWhole, getInstance, getModel, getRegion, osLicenseHourly, osName, unitHourly } from "@/lib/pricing";
import { instanceOptions, regionOptions } from "@/lib/options";
import type { CalcConfig, OsId } from "@/lib/types";
import { Kicker } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { MetricGrid } from "@/components/ui/MetricGrid";
import { ProviderSwitch } from "@/components/ui/ProviderSwitch";
import { Chip, Segmented } from "@/components/ui/Segmented";
import { Field, Select } from "@/components/ui/Select";
import { NumberInput, Stepper } from "@/components/ui/Stepper";
import { ScreenShell } from "@/components/layout/SiteChrome";

const HOUR_PRESETS = [
  [730, "24/7 · 730"],
  [521, "Weekdays · 521"],
  [220, "Business hours · 220"],
] as const;

interface Props {
  calc: CalcConfig;
  setCalc: React.Dispatch<React.SetStateAction<CalcConfig>>;
  onOptimize: () => void;
}

export function CostCalculator({ calc: c, setCalc, onOptimize }: Props) {
  const set = <K extends keyof CalcConfig>(k: K, v: CalcConfig[K]) => setCalc((p) => ({ ...p, [k]: v }));
  const i = getInstance(c.instanceId) ?? INSTANCES[0];
  const rm = getRegion(c.region).multiplier;
  const mm = getModel(c.model).multiplier;
  const unit = unitHourly(i, c.region, c.os, c.model);
  const qh = c.qty * c.hours;
  const monthly = unit * qh;

  const pBase = i.hourlyUsd * qh;
  const pRegion = i.hourlyUsd * (rm - 1) * qh;
  const pLicense = osLicenseHourly(c.os, i.vcpu) * qh;
  const pDiscount = -(i.hourlyUsd * rm) * (1 - mm) * qh;
  const gross = pBase + pRegion + pLicense || 1;
  const segments = [
    { label: "Compute · us-east-1 list rate", value: pBase, color: "bg-accent" },
    { label: `Region adjustment · ${c.region}`, value: pRegion, color: "bg-accent-deep" },
    { label: `OS license · ${osName(c.os)}`, value: pLicense, color: "bg-license" },
    { label: `Pricing model · ${getModel(c.model).name}`, value: pDiscount, color: null },
  ];
  const odMonthly = unitHourly(i, c.region, c.os, "od") * qh || 1;

  return (
    <ScreenShell label="05 Cost Calculator" title="Calculate your cloud cost" subtitle="Estimates update as you change the configuration.">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-5">
        {/* Inputs */}
        <div className="flex flex-col gap-[22px] rounded-[18px] border border-line bg-surface p-[clamp(20px,2.4vw,28px)]">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">Cloud provider</span>
            <ProviderSwitch layout="grid" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
            <Field label="Region" className="gap-2">
              <Select size="lg" value={c.region} onValueChange={(v) => set("region", v as CalcConfig["region"])} options={regionOptions} />
            </Field>
            <Field label="Instance" className="gap-2">
              <Select size="lg" mono value={c.instanceId} onValueChange={(v) => set("instanceId", v)} options={instanceOptions} />
            </Field>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">Operating system</span>
            <Segmented<OsId> value={c.os} onChange={(v) => set("os", v)} options={OPERATING_SYSTEMS.map((o) => ({ value: o.id, label: o.name }))} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted">Quantity</span>
              <Stepper value={c.qty} onChange={(v) => set("qty", v)} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted">Hours per month</span>
              <NumberInput label="Hours per month" value={c.hours} onChange={(v) => set("hours", v)} suffix="of 730" />
            </div>
          </div>
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {HOUR_PRESETS.map(([h, l]) => (
              <Chip key={h} size="sm" active={c.hours === h} onClick={() => set("hours", h)}>
                {l}
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">Pricing model</span>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-2">
              {PRICING_MODELS.map((m) => {
                const active = c.model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("model", m.id)}
                    className={cn(
                      "flex cursor-pointer flex-col items-start gap-[3px] rounded-xl border px-3.5 py-3 text-left transition-colors",
                      active ? "border-accent bg-accent/7" : "border-line-strong bg-raised hover:border-line-hover",
                    )}
                  >
                    <span className="text-sm font-medium text-ink">{m.name}</span>
                    <span className="text-xs text-muted">{m.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="sticky top-[88px] flex flex-col gap-4">
          <div className="relative flex flex-col gap-[22px] overflow-hidden rounded-[18px] border border-line-glow bg-[linear-gradient(180deg,#121C25,#0E161D)] p-[clamp(20px,2.4vw,28px)]">
            <div className="pointer-events-none absolute -top-20 -right-[60px] size-[260px] rounded-full bg-[radial-gradient(closest-side,rgba(60,207,99,.14),transparent)]" />
            <div className="relative flex flex-col gap-2">
              <span className="font-mono text-[12.5px] font-medium text-muted">
                {c.qty} × {i.id} · {formatHourly(unit)}/hour each
              </span>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-mono text-[clamp(38px,4.4vw,54px)] font-semibold tracking-[-0.04em]">≈ {formatMoney(monthly)}</span>
                <span className="text-[15px] text-muted">/ month</span>
              </div>
              <span className="text-[13px] text-dim">
                {c.hours} hrs/month · {c.region} · {osName(c.os)} · {getModel(c.model).name}
              </span>
            </div>
            <MetricGrid
              className="relative"
              valueClassName="text-[clamp(13px,1.3vw,16px)]"
              metrics={[
                { label: "Hourly", value: formatHourly(unit * c.qty) },
                { label: "Daily", value: formatMoney((monthly * 12) / 365) },
                { label: "Monthly", value: formatMoney(monthly) },
                { label: "Annual", value: formatWhole(monthly * 12) },
              ]}
            />
            <div className="relative flex flex-col gap-3">
              <Kicker>Monthly breakdown</Kicker>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-elevated">
                {segments
                  .filter((s) => s.color && s.value > 0)
                  .map((s) => (
                    <span key={s.label} className={cn("block h-full", s.color)} style={{ width: `${(s.value / gross) * 100}%` }} />
                  ))}
              </div>
              <div className="flex flex-col">
                {segments.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 border-b border-elevated py-[9px] text-[13.5px]">
                    <span className="flex items-center gap-2.5 text-ink-2">
                      <span className={cn("size-2 shrink-0 rounded-[2px]", s.color ?? "shadow-[inset_0_0_0_1.5px_var(--color-accent)]")} />
                      {s.label}
                    </span>
                    <span className={cn("font-mono", s.color ? (s.value === 0 ? "text-dim" : "text-ink") : s.value < 0 ? "text-accent" : "text-dim")}>
                      {s.value === 0 ? "$0.00" : formatMoney(s.value)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-semibold">
                  <span>Estimated monthly</span>
                  <span className="font-mono">≈ {formatMoney(monthly)}</span>
                </div>
              </div>
            </div>
            <Button size="lg" className="relative gap-2.5" onClick={onOptimize}>
              Optimize this configuration
              <ArrowRightIcon />
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-surface px-[22px] py-5">
            <Kicker>Same fleet, other pricing models</Kicker>
            {PRICING_MODELS.map((m) => {
              const v = unitHourly(i, c.region, c.os, m.id) * qh;
              const active = m.id === c.model;
              return (
                <div key={m.id} className="grid grid-cols-[120px_1fr_96px] items-center gap-3 text-[13px]">
                  <span className={cn("whitespace-nowrap", active ? "font-semibold text-ink" : "text-muted")}>{m.name}</span>
                  <span className="block h-2 overflow-hidden rounded-full bg-elevated">
                    <span className={cn("block h-full rounded-full", active ? "bg-accent" : "bg-line-hover")} style={{ width: `${(v / odMonthly) * 100}%` }} />
                  </span>
                  <span className={cn("text-right font-mono", active ? "text-ink" : "text-ink-2")}>{formatMoney(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
