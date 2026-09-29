"use client";

import { useCallback, useState } from "react";
import { DEFAULT_COMPARE, INSTANCES } from "@/data/catalog";
import { DEFAULT_FILTERS } from "@/lib/explorer";
import { getInstance } from "@/lib/pricing";
import { swapAlternatives } from "@/lib/recommendations";
import type { Alternative, CalcConfig, DetailConfig, Filters, OptConstraints, Screen } from "@/lib/types";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { Landing } from "@/components/landing/Landing";
import { InstanceExplorer } from "@/components/explorer/InstanceExplorer";
import { InstanceDetailDrawer } from "@/components/detail/InstanceDetailDrawer";
import { ComparisonView } from "@/components/compare/ComparisonView";
import { CostCalculator } from "@/components/calculator/CostCalculator";
import { OptimizationView } from "@/components/optimize/OptimizationView";

const DEFAULT_CALC: CalcConfig = { region: "us-east-1", instanceId: "m6i.2xlarge", os: "linux", qty: 3, hours: 730, model: "od" };
const DEFAULT_CONSTRAINTS: OptConstraints = { arch: true, burst: false, lessMem: false, commit: true };

/** Client shell that owns cross-screen state: Find → Compare → Calculate → Optimize. */
export default function CloudCalculatorApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>(DEFAULT_COMPARE);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailCfg, setDetailCfg] = useState<DetailConfig>({ qty: 1, hours: 730, os: "linux", region: "us-east-1" });
  const [calc, setCalc] = useState<CalcConfig>(DEFAULT_CALC);
  const [constraints, setConstraints] = useState<OptConstraints>(DEFAULT_CONSTRAINTS);
  const [openAltId, setOpenAltId] = useState<string | null>("m6g.2xlarge");

  const navigate = useCallback((s: Screen) => {
    setScreen(s);
    setDetailId(null);
    window.scrollTo(0, 0);
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 4 ? [...c, id] : [...c.slice(0, 3), id]));
  }, []);

  const openDetail = (id: string) => {
    setDetailCfg({ qty: 1, hours: 730, os: filters.os, region: filters.region });
    setDetailId(id);
  };

  const calcFromDetail = (): CalcConfig | null =>
    detailId ? { region: detailCfg.region, instanceId: detailId, os: detailCfg.os, qty: Math.max(1, detailCfg.qty), hours: detailCfg.hours, model: filters.model } : null;

  const goOptimizeFrom = (cfg: CalcConfig) => {
    const base = getInstance(cfg.instanceId) ?? INSTANCES[0];
    setOpenAltId(swapAlternatives(base, cfg, constraints)[0]?.id ?? null);
    navigate("optimize");
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <SiteHeader screen={screen} compareCount={compareIds.length} onNavigate={navigate} />

      <main className="flex-1">
        {screen === "landing" && <Landing onNavigate={navigate} />}
        {screen === "explorer" && (
          <InstanceExplorer
            filters={filters}
            setFilters={setFilters}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
            onOpenDetail={openDetail}
            onGoCompare={() => navigate("compare")}
            detailOpen={!!detailId}
          />
        )}
        {screen === "compare" && (
          <ComparisonView
            compareIds={compareIds}
            setCompareIds={setCompareIds}
            onToggleCompare={toggleCompare}
            filters={filters}
            setFilters={setFilters}
            onGoExplorer={() => navigate("explorer")}
          />
        )}
        {screen === "calculator" && <CostCalculator calc={calc} setCalc={setCalc} onOptimize={() => goOptimizeFrom(calc)} />}
        {screen === "optimize" && (
          <OptimizationView
            calc={calc}
            constraints={constraints}
            setConstraints={setConstraints}
            openAltId={openAltId}
            setOpenAltId={setOpenAltId}
            onEdit={() => navigate("calculator")}
            onApply={(a: Alternative) => {
              setCalc((p) => (a.kind === "swap" ? { ...p, instanceId: a.instance.id } : { ...p, model: a.model }));
              navigate("calculator");
            }}
            onCompare={(a: Alternative) => {
              setCompareIds([calc.instanceId, a.instance.id]);
              setFilters((f) => ({ ...f, region: calc.region, os: calc.os, model: calc.model }));
              navigate("compare");
            }}
          />
        )}
      </main>

      <SiteFooter />

      <InstanceDetailDrawer
        instanceId={detailId}
        model={filters.model}
        config={detailCfg}
        setConfig={setDetailCfg}
        inCompare={!!detailId && compareIds.includes(detailId)}
        onClose={() => setDetailId(null)}
        onToggleCompare={() => detailId && toggleCompare(detailId)}
        onCalculate={() => {
          const cfg = calcFromDetail();
          if (!cfg) return;
          setCalc(cfg);
          navigate("calculator");
        }}
        onFindAlternatives={() => {
          const cfg = calcFromDetail();
          if (!cfg) return;
          setCalc(cfg);
          goOptimizeFrom(cfg);
        }}
      />
    </div>
  );
}
