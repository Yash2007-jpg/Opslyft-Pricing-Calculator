import { INSTANCES } from "@/data/catalog";
import { formatHourly, getModel, isAvailable, unitHourly } from "@/lib/pricing";
import type { Alternative, CalcConfig, Criterion, Instance, OptConstraints, PricingModelId } from "@/lib/types";

type Cfg = Pick<CalcConfig, "region" | "os" | "model" | "qty" | "hours">;

/**
 * Instance swaps. Measurable rules only:
 * ≥ vCPU, ≥ memory (or ≥ half if lessMem), same GPU class, available in region, lower hourly price.
 * Architecture change and burstable are flagged and gated by constraints.
 */
export function swapAlternatives(
  base: Instance,
  cfg: Cfg,
  opt: Pick<OptConstraints, "arch" | "burst" | "lessMem">,
  exclude: string[] = [],
): Alternative[] {
  const cur = unitHourly(base, cfg.region, cfg.os, cfg.model);
  const n = cfg.qty * cfg.hours;
  const curM = cur * n;
  const out: Alternative[] = [];

  for (const c of INSTANCES) {
    if (c.id === base.id || exclude.includes(c.id)) continue;
    if (!!c.gpu !== !!base.gpu || c.vcpu < base.vcpu || !isAvailable(c, cfg.region)) continue;
    if (c.memoryGiB < base.memoryGiB && !(opt.lessMem && c.memoryGiB >= base.memoryGiB / 2)) continue;
    if (c.arch !== base.arch && !opt.arch) continue;
    if (c.burstable && !base.burstable && !opt.burst) continue;
    const p = unitHourly(c, cfg.region, cfg.os, cfg.model);
    if (p >= cur) continue;

    const crit: Criterion[] = [];
    crit.push(
      c.vcpu === base.vcpu
        ? { ok: true, text: "Same vCPU", short: `${c.vcpu} vCPU`, detail: `${c.vcpu} vs ${base.vcpu}` }
        : { ok: true, text: "More vCPU", short: "+vCPU", detail: `${c.vcpu} vs ${base.vcpu}` },
    );
    const memDetail = `${c.memoryGiB} GiB vs ${base.memoryGiB} GiB`;
    crit.push(
      c.memoryGiB === base.memoryGiB
        ? { ok: true, text: "Same memory", short: `${c.memoryGiB} GiB`, detail: memDetail }
        : c.memoryGiB > base.memoryGiB
          ? { ok: true, text: "More memory", short: "+memory", detail: memDetail }
          : { ok: false, text: "Less memory — check headroom", short: "Less memory", detail: memDetail },
    );
    crit.push(
      c.arch === base.arch
        ? { ok: true, text: "Same architecture", short: c.arch, detail: c.arch }
        : { ok: false, text: "Architecture change", short: `→ ${c.arch}`, detail: `${base.arch} → ${c.arch}` },
    );
    crit.push({ ok: true, text: "Available in same region", short: cfg.region, detail: cfg.region });
    crit.push({ ok: true, text: "Lower hourly price", short: "Lower price", detail: `${formatHourly(p)} vs ${formatHourly(cur)}` });
    if (c.burstable) crit.push({ ok: false, text: "Burstable CPU", short: "Burstable", detail: "40% baseline per vCPU, credits above" });

    const sameShape = c.memoryGiB === base.memoryGiB && c.vcpu === base.vcpu;
    const title = c.burstable
      ? "Burstable, same shape"
      : c.arch !== base.arch
        ? sameShape
          ? "Same shape on Graviton (arm64)"
          : "Graviton (arm64) alternative"
        : c.memoryGiB < base.memoryGiB
          ? "Similar compute, less memory"
          : sameShape
            ? "Same shape, lower price"
            : "More capacity, lower price";
    const effort =
      c.arch !== base.arch ? "Rebuild for arm64" : c.burstable ? "Monitor CPU credits" : c.memoryGiB < base.memoryGiB ? "Validate memory" : "Drop-in";

    out.push({
      kind: "swap",
      id: c.id,
      instance: c,
      model: cfg.model,
      title,
      unitHourly: p,
      monthly: p * n,
      saving: curM - p * n,
      pct: (curM - p * n) / curM,
      criteria: crit,
      effort,
      lowEffort: effort === "Drop-in",
    });
  }
  return out.sort((a, b) => b.saving - a.saving);
}

/** Same instance, different pricing commitment. Only offered from On-Demand. */
export function commitmentAlternatives(base: Instance, cfg: Cfg): Alternative[] {
  if (cfg.model !== "od") return [];
  const cur = unitHourly(base, cfg.region, cfg.os, cfg.model);
  const n = cfg.qty * cfg.hours;
  const curM = cur * n;
  return (["ri", "sp"] as PricingModelId[])
    .map((m): Alternative => {
      const p = unitHourly(base, cfg.region, cfg.os, m);
      return {
        kind: "commit",
        id: `commit-${m}`,
        instance: base,
        model: m,
        title: getModel(m).name + (m === "sp" ? " · flexible across families" : " · locked to family & region"),
        unitHourly: p,
        monthly: p * n,
        saving: curM - p * n,
        pct: (curM - p * n) / curM,
        effort: "1-yr commitment",
        lowEffort: false,
        criteria: [
          { ok: true, text: "Same instance, no migration", short: "", detail: base.id },
          { ok: true, text: "Same vCPU, memory and architecture", short: "", detail: `${base.vcpu} vCPU · ${base.memoryGiB} GiB · ${base.arch}` },
          { ok: true, text: "Same region", short: "", detail: cfg.region },
          { ok: true, text: "Lower effective hourly rate", short: "", detail: `${formatHourly(p)} vs ${formatHourly(cur)}` },
          { ok: false, text: "Requires a 1-year commitment", short: "", detail: m === "sp" ? "Hourly spend commitment" : "Instance family + region" },
        ],
      };
    })
    .sort((a, b) => b.saving - a.saving);
}
