import { INSTANCES } from "@/data/catalog";
import { isAvailable, unitHourly } from "@/lib/pricing";
import type { Filters, Instance, SortKey } from "@/lib/types";

export const DEFAULT_FILTERS: Filters = {
  region: "us-east-1",
  workload: "all",
  arch: "all",
  vcpu: "any",
  mem: "any",
  model: "od",
  os: "linux",
  query: "",
  sort: "price",
};

export function filterInstances(f: Filters): Instance[] {
  const q = f.query.toLowerCase().trim();
  const price = (i: Instance) => unitHourly(i, f.region, f.os, f.model);
  const list = INSTANCES.filter(
    (i) =>
      (f.workload === "all" || i.workloads.includes(f.workload)) &&
      (f.arch === "all" || i.arch === f.arch) &&
      (f.vcpu === "any" || (f.vcpu === "4" ? i.vcpu <= 4 : f.vcpu === "8" ? i.vcpu === 8 : i.vcpu >= 16)) &&
      (f.mem === "any" || (f.mem === "16" ? i.memoryGiB <= 16 : f.mem === "32" ? i.memoryGiB === 32 : i.memoryGiB >= 64)) &&
      isAvailable(i, f.region) &&
      (!q ||
        i.id.includes(q) ||
        i.family.toLowerCase().includes(q) ||
        i.processor.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)),
  );
  const sorters: Record<SortKey, (a: Instance, b: Instance) => number> = {
    price: (a, b) => price(a) - price(b),
    priceDesc: (a, b) => price(b) - price(a),
    vcpu: (a, b) => b.vcpu - a.vcpu || price(a) - price(b),
    mem: (a, b) => b.memoryGiB - a.memoryGiB || price(a) - price(b),
    name: (a, b) => a.id.localeCompare(b.id),
  };
  return list.sort(sorters[f.sort]);
}

export function countActiveFilters(f: Filters) {
  return (
    (["workload", "arch", "vcpu", "mem"] as const).filter((k) => f[k] !== "all" && f[k] !== "any").length +
    (f.region !== "us-east-1" ? 1 : 0) +
    (f.model !== "od" ? 1 : 0) +
    (f.os !== "linux" ? 1 : 0)
  );
}
