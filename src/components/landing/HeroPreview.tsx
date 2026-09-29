"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatMoney, getInstance } from "@/lib/pricing";
import { HOURS_PER_MONTH } from "@/data/catalog";
import type { Instance } from "@/lib/types";

const STEPS = ["Find", "Compare", "Cost", "Optimize"] as const;
const ROW_IDS = ["m6i.2xlarge", "m7i.2xlarge", "m6a.2xlarge", "m7g.2xlarge"];
const HIGHLIGHT = [[0, 1, 2, 3], [0, 2], [0], [0, 3]];

/** Animated product preview in the hero — cycles Find → Compare → Cost → Optimize. */
export function HeroPreview() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 2800);
    return () => clearInterval(t);
  }, [auto]);

  const rows = ROW_IDS.map((id) => getInstance(id)).filter(Boolean) as Instance[];
  const [cur, , alt, arm] = rows;
  const fleetCost = cur.hourlyUsd * HOURS_PER_MONTH * 3;
  const armSaving = (cur.hourlyUsd - arm.hourlyUsd) * HOURS_PER_MONTH * 3;
  const amdSaving = (cur.hourlyUsd - alt.hourlyUsd) * HOURS_PER_MONTH;

  const foot = [
    { kicker: "FIND", label: "4 of 22 instances match 8 vCPU · 32 GiB", value: "Sorted by price" },
    { kicker: "COMPARE", label: "m6i.2xlarge vs m6a.2xlarge · same shape", value: `−${formatMoney(amdSaving)}/mo` },
    { kicker: "COST", label: "3 × m6i.2xlarge · 730 hrs · On-Demand", value: `${formatMoney(fleetCost)}/mo` },
    { kicker: "OPTIMIZE", label: "Switch to m7g.2xlarge · arm64 rebuild", value: `−${formatMoney(armSaving)}/mo` },
  ][step];

  return (
    <div className="relative min-w-0">
      <div className="pointer-events-none absolute -inset-x-[6%] -inset-y-[10%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(60,207,99,0.10),transparent_70%)] blur-[20px]" />
      <div className="relative overflow-hidden rounded-[20px] border border-line-glow bg-[linear-gradient(180deg,#121C25,#0D151C)] shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <div className="flex gap-1 rounded-[10px] border border-line bg-canvas p-[3px]">
            {STEPS.map((l, k) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setStep(k);
                  setAuto(false);
                }}
                className={cn(
                  "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] border-0 px-2.5 text-[12.5px] font-medium transition-all duration-300",
                  k === step ? (k === 3 ? "bg-accent/14 text-accent" : "bg-elevated text-ink") : "bg-transparent text-dim",
                )}
              >
                <span className="font-mono opacity-60">0{k + 1}</span>
                {l}
              </button>
            ))}
          </div>
          <span className="font-mono text-[10.5px] font-medium tracking-[.08em] text-dim">SAMPLE DATA</span>
        </div>

        <div className="flex flex-wrap gap-1.5 px-4 pt-3.5 pb-1.5">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-elevated px-2.5 text-[12.5px]">
            <span className="font-mono text-[10px] font-semibold text-aws">AWS</span>EC2
          </span>
          <span className="inline-flex h-7 items-center rounded-lg bg-elevated px-2.5 font-mono text-xs font-medium text-ink-2">us-east-1</span>
          <span className="inline-flex h-7 items-center rounded-lg bg-elevated px-2.5 text-[12.5px] text-ink-2">Web apps &amp; APIs</span>
          <span className="inline-flex h-7 items-center rounded-lg bg-elevated px-2.5 text-[12.5px] text-ink-2">8 vCPU · 32 GiB</span>
        </div>

        <div className="px-4 pt-2 pb-1">
          <div className="grid grid-cols-[1.5fr_.6fr_.7fr_1fr] gap-2 px-3 py-2 font-mono text-[10.5px] font-medium tracking-[.06em] text-dim">
            <span>INSTANCE</span>
            <span>VCPU</span>
            <span>MEMORY</span>
            <span className="text-right">MONTHLY</span>
          </div>
          <div className="flex flex-col gap-1">
            {rows.map((i, k) => {
              const hl = HIGHLIGHT[step].includes(k);
              const on = hl && step > 0;
              const dim = step > 0 && !hl;
              const opt = step === 3 && k === 3;
              const cmpTag = step === 1 && k === 2;
              let tag = "";
              if (cmpTag) tag = `−${formatMoney(amdSaving)}/mo`;
              if (step === 2 && k === 0) tag = "× 3 instances";
              if (opt) tag = `−${formatMoney(armSaving / 3)}/mo each`;
              if (step === 3 && k === 0) tag = "current";
              return (
                <div
                  key={i.id}
                  className={cn(
                    "grid grid-cols-[1.5fr_.6fr_.7fr_1fr] items-center gap-2 rounded-[10px] px-3 py-2.5 transition-all duration-[450ms] ease-out",
                    dim ? "opacity-[.38]" : "opacity-100",
                    opt
                      ? "bg-accent/8 shadow-[inset_0_0_0_1px_rgba(60,207,99,.45)]"
                      : on
                        ? "bg-[#16212B] shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
                        : "bg-transparent shadow-[inset_0_0_0_1px_transparent]",
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-mono text-[13.5px] font-medium">{i.id}</span>
                    <span className="text-[11.5px] text-dim">
                      {i.arch} · {i.family}
                    </span>
                  </span>
                  <span className="font-mono text-[13px] font-medium text-ink-2">{i.vcpu}</span>
                  <span className="font-mono text-[13px] font-medium text-ink-2">{i.memoryGiB} GiB</span>
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[13.5px] font-medium">{formatMoney(i.hourlyUsd * HOURS_PER_MONTH)}</span>
                    <span className={cn("min-h-3.5 font-mono text-[11px] transition-colors duration-300", opt || cmpTag ? "text-accent" : "text-dim")}>{tag}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-4 mt-3 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3.5">
          <div className="flex flex-col gap-[3px]">
            <span className="font-mono text-[10.5px] font-medium tracking-[.08em] text-dim">{foot.kicker}</span>
            <span className="text-[13.5px] text-ink-2">{foot.label}</span>
          </div>
          <span
            className={cn(
              "font-mono text-lg font-semibold tracking-[-0.02em] transition-colors duration-300",
              step === 0 ? "text-ink-2" : step === 2 ? "text-ink" : "text-accent",
            )}
          >
            {foot.value}
          </span>
        </div>
      </div>
    </div>
  );
}
