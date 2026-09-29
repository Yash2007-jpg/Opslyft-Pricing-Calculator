"use client";

import { INSTANCES } from "@/data/catalog";
import { formatMoney, getInstance, getModel, osName, unitHourly } from "@/lib/pricing";
import { commitmentAlternatives, swapAlternatives } from "@/lib/recommendations";
import type { Alternative, CalcConfig, OptConstraints } from "@/lib/types";
import { Kicker } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Segmented";
import { ScreenShell } from "@/components/layout/SiteChrome";
import { RecommendationCard } from "./RecommendationCard";

const TOGGLES: [keyof OptConstraints, string][] = [
  ["arch", "Allow architecture change"],
  ["burst", "Allow burstable"],
  ["lessMem", "Allow less memory"],
  ["commit", "Include commitments"],
];

interface Props {
  calc: CalcConfig;
  constraints: OptConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<OptConstraints>>;
  openAltId: string | null;
  setOpenAltId: (id: string | null) => void;
  onEdit: () => void;
  onApply: (alt: Alternative) => void;
  onCompare: (alt: Alternative) => void;
}

export function OptimizationView({ calc: c, constraints, setConstraints, openAltId, setOpenAltId, onEdit, onApply, onCompare }: Props) {
  const ci = getInstance(c.instanceId) ?? INSTANCES[0];
  const cfg = { ...c, qty: Math.max(1, c.qty), hours: Math.max(1, c.hours) };
  const unit = unitHourly(ci, c.region, c.os, c.model);
  const monthly = unit * cfg.qty * cfg.hours;
  const swaps = swapAlternatives(ci, cfg, constraints).slice(0, 5);
  const commits = constraints.commit ? commitmentAlternatives(ci, cfg) : [];
  const bestSwap = swaps[0];
  const bestCommit = commits[0];

  let letterIdx = 0;
  const groups = [
    {
      title: "Instance alternatives",
      sub: "Lower-cost instances for the same fleet",
      items: swaps,
      empty: "No lower-cost instance passes the current constraints. Try allowing architecture changes.",
    },
    {
      title: "Pricing alternatives",
      sub: `Keep ${ci.id}, change how you pay`,
      items: commits,
      empty: c.model !== "od" ? `Already on ${getModel(c.model).name}.` : "Commitments are excluded by the constraints above.",
    },
  ];

  return (
    <ScreenShell
      label="06 Optimization"
      title="Reduce your cloud cost"
      subtitle="Alternatives are generated from spec and price data only. Each one lists the checks it passed and anything you'd need to validate."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
        <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface px-6 py-[22px]">
          <div className="flex items-center justify-between">
            <Kicker>Current configuration</Kicker>
            <Button variant="link" className="text-[13px]" onClick={onEdit}>
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold">{ci.id}</span>
            <span className="text-[15px] text-muted">× {cfg.qty} instances</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[c.region, osName(c.os), getModel(c.model).name, `${cfg.hours} hrs/mo`, `${ci.vcpu} vCPU · ${ci.memoryGiB} GiB`].map((t) => (
              <span key={t} className="rounded-[7px] bg-elevated px-[9px] py-1 font-mono text-xs font-medium text-ink-2">
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between border-t border-line pt-3.5">
            <span className="text-[13.5px] text-muted">Estimated monthly</span>
            <span className="font-mono text-[26px] font-semibold tracking-[-0.02em]">{formatMoney(monthly)}</span>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[18px] border border-line-savings bg-[linear-gradient(160deg,rgba(60,207,99,.10),rgba(60,207,99,.02)_60%),var(--color-surface)] px-6 py-[22px]">
          <Kicker className="text-accent">Savings potential</Kicker>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[12.5px] text-muted">Best instance swap</span>
              <span className="font-mono text-2xl font-semibold text-accent">{bestSwap ? `−${formatMoney(bestSwap.saving)}/mo` : "—"}</span>
              <span className="text-xs text-dim">{bestSwap ? `${bestSwap.instance.id} · ${Math.round(bestSwap.pct * 100)}% lower` : "None found"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12.5px] text-muted">Best pricing change</span>
              <span className="font-mono text-2xl font-semibold text-accent">{bestCommit ? `−${formatMoney(bestCommit.saving)}/mo` : "—"}</span>
              <span className="text-xs text-dim">{bestCommit ? `${getModel(bestCommit.model).name} · ${Math.round(bestCommit.pct * 100)}% lower` : "Not applicable"}</span>
            </div>
          </div>
          <span className="border-t border-accent/14 pt-3.5 text-[12.5px] text-muted">{swaps.length + commits.length} alternatives passed the filters below.</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] text-muted">Constraints</span>
        {TOGGLES.map(([k, l]) => (
          <Toggle key={k} on={constraints[k]} onToggle={() => setConstraints((p) => ({ ...p, [k]: !p[k] }))}>
            {l}
          </Toggle>
        ))}
      </div>

      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="m-0 text-xl font-semibold tracking-[-0.01em]">{g.title}</h2>
            <span className="text-[13.5px] text-muted">{g.sub}</span>
          </div>
          {g.items.length === 0 && <div className="rounded-[14px] border border-dashed border-line-strong p-[22px] text-sm text-muted">{g.empty}</div>}
          {g.items.map((a) => (
            <RecommendationCard
              key={a.id}
              alt={a}
              letter={String.fromCharCode(65 + letterIdx++)}
              current={ci}
              calc={c}
              currentUnit={unit}
              currentMonthly={monthly}
              open={openAltId === a.id}
              onToggle={() => setOpenAltId(openAltId === a.id ? null : a.id)}
              onApply={() => onApply(a)}
              onCompare={() => onCompare(a)}
            />
          ))}
        </div>
      ))}

      <p className="m-0 max-w-[820px] text-[12.5px] leading-[1.6] text-dim">
        Method: candidates must match or exceed current vCPU and memory, keep the same GPU class, be offered in the selected region, and have a lower effective hourly
        price. Architecture changes, burstable instances and commitments are flagged and can be excluded. Utilization data is not used in this estimate.
      </p>
    </ScreenShell>
  );
}
