import { INSTANCES, OPERATING_SYSTEMS, PRICING_MODELS, REGIONS } from "@/data/catalog";
import type { Instance, OsId, PricingModelId, RegionId } from "@/lib/types";

export const getRegion = (id: RegionId) => REGIONS.find((r) => r.id === id) ?? REGIONS[0];
export const getModel = (id: PricingModelId) => PRICING_MODELS.find((m) => m.id === id) ?? PRICING_MODELS[0];
export const getInstance = (id: string) => INSTANCES.find((i) => i.id === id);
export const osName = (id: OsId) => (OPERATING_SYSTEMS.find((o) => o.id === id) ?? OPERATING_SYSTEMS[0]).name;

/** Sample OS license uplift in USD/hr. */
export const osLicenseHourly = (os: OsId, vcpu: number) =>
  os === "windows" ? 0.046 * vcpu : os === "rhel" ? (vcpu > 4 ? 0.13 : 0.06) : 0;

export const isAvailable = (i: Instance, region: RegionId) => !(i.unavailableIn ?? []).includes(region);

/** Effective hourly price for one instance. Discounts apply to compute only, not license. */
export function unitHourly(i: Instance, region: RegionId, os: OsId, model: PricingModelId) {
  return i.hourlyUsd * getRegion(region).multiplier * getModel(model).multiplier + osLicenseHourly(os, i.vcpu);
}

export function formatMoney(n: number) {
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "−$" : "$") + s;
}

/** Hourly price with 3–4 decimals, trailing zeros trimmed to 3. */
export function formatHourly(n: number) {
  const s = (+n.toFixed(4)).toString();
  const dec = (s.split(".")[1] ?? "").length;
  return "$" + (+s).toFixed(Math.max(3, dec));
}

export const formatWhole = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const formatSaving = (n: number) => "−" + formatMoney(n);
