"use client";

import type { Screen } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { HeroPreview } from "./HeroPreview";

const JOURNEY: { n: string; title: string; body: string; cta: string; screen: Screen }[] = [
  { n: "01", title: "Find", body: "Filter EC2 by workload, region, architecture, vCPU, memory and OS.", cta: "Explore instances", screen: "explorer" },
  { n: "02", title: "Compare", body: "Put up to four instances side by side. Differences against your baseline are marked.", cta: "Compare", screen: "compare" },
  { n: "03", title: "Calculate", body: "Set quantity, hours and pricing model to get hourly, monthly and annual estimates.", cta: "Calculate cost", screen: "calculator" },
  { n: "04", title: "Optimize", body: "See lower-cost options that pass explicit checks on vCPU, memory, architecture and region.", cta: "Find savings", screen: "optimize" },
];

export function Landing({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div data-screen-label="01 Landing">
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_76%_18%,rgba(60,207,99,0.14),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] mask-[radial-gradient(60%_70%_at_70%_30%,#000,transparent)] bg-size-[56px_56px]" />
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,470px),1fr))] items-center gap-[clamp(40px,5vw,80px)] px-[clamp(16px,4vw,48px)] pt-[clamp(48px,8vw,108px)] pb-[clamp(56px,7vw,100px)]">
          <div className="flex flex-col items-start gap-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 py-1.5 pr-3 pl-2.5 text-[13px] whitespace-nowrap text-muted">
              <span className="size-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              AWS EC2 today · GCP and Azure next
            </div>
            <h1 className="m-0 text-[clamp(38px,5vw,64px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
              Find the right cloud instance.
              <br />
              <span className="text-muted">Know the cost.</span> <span className="text-accent">Cut the waste.</span>
            </h1>
            <p className="m-0 max-w-[520px] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-pretty text-ink-2">
              Compare AWS instances, calculate your real monthly cost, and discover lower-cost alternatives.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2.5 shadow-[0_8px_30px_-8px_rgba(60,207,99,.5)]" onClick={() => onNavigate("explorer")}>
                Explore Instances
                <ArrowRightIcon />
              </Button>
              <Button size="lg" variant="ghost" className="font-medium" onClick={() => onNavigate("calculator")}>
                Calculate Cost
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs font-medium tracking-[.04em] text-dim">
              <span className="text-muted">FIND</span>
              <span>→</span>
              <span className="text-muted">COMPARE</span>
              <span>→</span>
              <span className="text-muted">CALCULATE</span>
              <span>→</span>
              <span className="text-accent">OPTIMIZE</span>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,48px)] py-[clamp(56px,7vw,96px)]">
        <div className="mb-10 flex max-w-[640px] flex-col gap-3">
          <span className="font-mono text-xs font-medium tracking-[.08em] text-accent">HOW IT WORKS</span>
          <h2 className="m-0 text-[clamp(28px,3vw,40px)] leading-[1.1] font-semibold tracking-[-0.025em]">
            Which instance, what it costs, and how to pay less.
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-4">
          {JOURNEY.map((j) => (
            <button
              key={j.n}
              type="button"
              onClick={() => onNavigate(j.screen)}
              className="flex min-h-[210px] cursor-pointer flex-col gap-3.5 rounded-2xl border border-line bg-surface p-6 text-left text-ink transition-colors hover:border-line-accent hover:bg-surface-hover"
            >
              <span className="font-mono text-xs font-medium text-dim">{j.n}</span>
              <span className="text-xl font-semibold tracking-[-0.01em]">{j.title}</span>
              <span className="text-[14.5px] leading-[1.55] text-pretty text-muted">{j.body}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent">{j.cta} →</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
