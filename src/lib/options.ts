import { INSTANCES, OPERATING_SYSTEMS, PRICING_MODELS, REGIONS, WORKLOADS } from "@/data/catalog";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const regionOptions = REGIONS.map((r) => ({ value: r.id, label: `${r.id} · ${r.name}` }));
export const regionIdOptions = REGIONS.map((r) => ({ value: r.id, label: r.id }));
export const osOptions = OPERATING_SYSTEMS.map((o) => ({ value: o.id, label: o.name }));
export const modelOptions = PRICING_MODELS.map((m) => ({ value: m.id, label: m.name }));
export const workloadOptions = WORKLOADS.map((w) => ({ value: w.id, label: w.name }));
export const instanceOptions = [...INSTANCES]
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((i) => ({ value: i.id, label: `${i.id} · ${i.vcpu} vCPU · ${i.memoryGiB} GiB` }));

export const archOptions = [
  { value: "all", label: "All" },
  { value: "x86_64", label: "x86_64" },
  { value: "arm64", label: "arm64 (Graviton)" },
] as const;
export const vcpuOptions = [
  { value: "any", label: "Any" },
  { value: "4", label: "Up to 4" },
  { value: "8", label: "8" },
  { value: "16", label: "16+" },
] as const;
export const memOptions = [
  { value: "any", label: "Any" },
  { value: "16", label: "Up to 16 GiB" },
  { value: "32", label: "32 GiB" },
  { value: "64", label: "64 GiB+" },
] as const;
export const sortOptions = [
  { value: "price", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "vcpu", label: "vCPU" },
  { value: "mem", label: "Memory" },
  { value: "name", label: "Name" },
] as const;
