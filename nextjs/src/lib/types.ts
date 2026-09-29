export type Arch = "x86_64" | "arm64";
export type RegionId =
  | "us-east-1"
  | "us-west-2"
  | "eu-west-1"
  | "eu-central-1"
  | "ap-south-1"
  | "ap-southeast-1";
export type OsId = "linux" | "windows" | "rhel";
export type PricingModelId = "od" | "sp" | "ri" | "spot";
export type WorkloadId = "all" | "web" | "db" | "ml" | "compute" | "memory" | "general";
export type Workload = Exclude<WorkloadId, "all">;
export type Screen = "landing" | "explorer" | "compare" | "calculator" | "optimize";
export type SortKey = "price" | "priceDesc" | "vcpu" | "mem" | "name";

export interface Region {
  id: RegionId;
  name: string;
  /** Price multiplier relative to us-east-1 list price (sample data). */
  multiplier: number;
}

export interface OperatingSystem {
  id: OsId;
  name: string;
}

export interface PricingModel {
  id: PricingModelId;
  name: string;
  note: string;
  /** Multiplier applied to the compute portion of the hourly rate. */
  multiplier: number;
}

export interface WorkloadOption {
  id: WorkloadId;
  name: string;
}

export interface Instance {
  id: string;
  family: string;
  category: string;
  processor: string;
  clock: string;
  arch: Arch;
  vcpu: number;
  memoryGiB: number;
  memoryType: "DDR4" | "DDR5";
  network: string;
  ebsBandwidth: string;
  /** us-east-1, Linux, On-Demand list price in USD. */
  hourlyUsd: number;
  workloads: Workload[];
  burstable?: boolean;
  gpu?: string;
  nvme?: string;
  unavailableIn?: RegionId[];
}

export interface Filters {
  region: RegionId;
  workload: WorkloadId;
  arch: "all" | Arch;
  vcpu: "any" | "4" | "8" | "16";
  mem: "any" | "16" | "32" | "64";
  model: PricingModelId;
  os: OsId;
  query: string;
  sort: SortKey;
}

export interface CalcConfig {
  region: RegionId;
  instanceId: string;
  os: OsId;
  qty: number;
  hours: number;
  model: PricingModelId;
}

export interface DetailConfig {
  qty: number;
  hours: number;
  os: OsId;
  region: RegionId;
}

export interface OptConstraints {
  arch: boolean;
  burst: boolean;
  lessMem: boolean;
  commit: boolean;
}

export interface Criterion {
  ok: boolean;
  text: string;
  short: string;
  detail: string;
}

export interface Alternative {
  kind: "swap" | "commit";
  id: string;
  instance: Instance;
  model: PricingModelId;
  title: string;
  unitHourly: number;
  monthly: number;
  saving: number;
  pct: number;
  criteria: Criterion[];
  effort: string;
  lowEffort: boolean;
}
