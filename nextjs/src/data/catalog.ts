/**
 * SAMPLE DATA — approximations of public AWS EC2 list prices (us-east-1, Linux, On-Demand).
 * Replace with Supabase queries later; keep the same shapes (see src/lib/types.ts).
 */
import type {
  Arch,
  Instance,
  OperatingSystem,
  PricingModel,
  Region,
  RegionId,
  Workload,
  WorkloadOption,
} from "@/lib/types";

export const HOURS_PER_MONTH = 730;

export const REGIONS: Region[] = [
  { id: "us-east-1", name: "US East (N. Virginia)", multiplier: 1 },
  { id: "us-west-2", name: "US West (Oregon)", multiplier: 1 },
  { id: "eu-west-1", name: "Europe (Ireland)", multiplier: 1.115 },
  { id: "eu-central-1", name: "Europe (Frankfurt)", multiplier: 1.198 },
  { id: "ap-south-1", name: "Asia Pacific (Mumbai)", multiplier: 1.052 },
  { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", multiplier: 1.25 },
];

export const OPERATING_SYSTEMS: OperatingSystem[] = [
  { id: "linux", name: "Linux" },
  { id: "windows", name: "Windows" },
  { id: "rhel", name: "RHEL" },
];

export const PRICING_MODELS: PricingModel[] = [
  { id: "od", name: "On-Demand", note: "No commitment", multiplier: 1 },
  { id: "sp", name: "Savings Plan 1 yr", note: "~28% off compute", multiplier: 0.72 },
  { id: "ri", name: "Reserved 1 yr", note: "~37% off compute", multiplier: 0.63 },
  { id: "spot", name: "Spot (avg.)", note: "Interruptible", multiplier: 0.38 },
];

export const WORKLOADS: WorkloadOption[] = [
  { id: "all", name: "All workloads" },
  { id: "web", name: "Web apps & APIs" },
  { id: "db", name: "Databases" },
  { id: "ml", name: "AI / ML" },
  { id: "compute", name: "Compute intensive" },
  { id: "memory", name: "Memory intensive" },
  { id: "general", name: "General purpose" },
];

type Extra = Partial<Pick<Instance, "burstable" | "gpu" | "nvme" | "ebsBandwidth" | "unavailableIn">>;

function inst(
  id: string,
  family: string,
  category: string,
  processor: string,
  clock: string,
  arch: Arch,
  vcpu: number,
  memoryGiB: number,
  network: string,
  hourlyUsd: number,
  workloads: Workload[],
  extra: Extra = {},
): Instance {
  return {
    id,
    family,
    category,
    processor,
    clock,
    arch,
    vcpu,
    memoryGiB,
    memoryType: /7/.test(family) ? "DDR5" : "DDR4",
    network,
    hourlyUsd,
    workloads,
    ebsBandwidth: "Up to 10 Gbps",
    ...extra,
  };
}

export const INSTANCES: Instance[] = [
  inst("m6i.2xlarge", "M6i", "General purpose", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 8, 32, "Up to 12.5 Gbps", 0.384, ["general", "web"]),
  inst("m7i.2xlarge", "M7i", "General purpose", "Intel Xeon (Sapphire Rapids)", "3.2 GHz", "x86_64", 8, 32, "Up to 12.5 Gbps", 0.4032, ["general", "web"]),
  inst("m6a.2xlarge", "M6a", "General purpose", "AMD EPYC 7R13 (Milan)", "3.6 GHz", "x86_64", 8, 32, "Up to 12.5 Gbps", 0.3456, ["general", "web"]),
  inst("m7a.2xlarge", "M7a", "General purpose", "AMD EPYC 9R14 (Genoa)", "3.7 GHz", "x86_64", 8, 32, "Up to 12.5 Gbps", 0.46368, ["general", "compute"], { unavailableIn: ["ap-south-1", "ap-southeast-1"] }),
  inst("m6g.2xlarge", "M6g", "General purpose", "AWS Graviton2", "2.5 GHz", "arm64", 8, 32, "Up to 10 Gbps", 0.308, ["general", "web"], { ebsBandwidth: "Up to 4.75 Gbps" }),
  inst("m7g.2xlarge", "M7g", "General purpose", "AWS Graviton3", "2.6 GHz", "arm64", 8, 32, "Up to 15 Gbps", 0.3264, ["general", "web"]),
  inst("t3.2xlarge", "T3", "Burstable", "Intel Xeon Platinum 8000", "3.1 GHz", "x86_64", 8, 32, "Up to 5 Gbps", 0.3328, ["web", "general"], { burstable: true, ebsBandwidth: "Up to 2.78 Gbps" }),
  inst("c6i.2xlarge", "C6i", "Compute optimized", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 8, 16, "Up to 12.5 Gbps", 0.34, ["compute", "web"]),
  inst("c7i.2xlarge", "C7i", "Compute optimized", "Intel Xeon (Sapphire Rapids)", "3.2 GHz", "x86_64", 8, 16, "Up to 12.5 Gbps", 0.357, ["compute"]),
  inst("c7g.2xlarge", "C7g", "Compute optimized", "AWS Graviton3", "2.6 GHz", "arm64", 8, 16, "Up to 15 Gbps", 0.289, ["compute", "web"]),
  inst("r6i.2xlarge", "R6i", "Memory optimized", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 8, 64, "Up to 12.5 Gbps", 0.504, ["memory", "db"]),
  inst("r6a.2xlarge", "R6a", "Memory optimized", "AMD EPYC 7R13 (Milan)", "3.6 GHz", "x86_64", 8, 64, "Up to 12.5 Gbps", 0.4536, ["memory", "db"]),
  inst("r7g.2xlarge", "R7g", "Memory optimized", "AWS Graviton3", "2.6 GHz", "arm64", 8, 64, "Up to 15 Gbps", 0.4284, ["memory", "db"]),
  inst("x2gd.xlarge", "X2gd", "Memory optimized", "AWS Graviton2", "2.5 GHz", "arm64", 4, 64, "Up to 10 Gbps", 0.334, ["memory", "db"], { nvme: "1 × 237 GB", unavailableIn: ["ap-south-1"] }),
  inst("g5.2xlarge", "G5", "Accelerated · GPU", "AMD EPYC 7R32 + NVIDIA A10G 24 GB", "3.3 GHz", "x86_64", 8, 32, "Up to 10 Gbps", 1.212, ["ml"], { gpu: "NVIDIA A10G", nvme: "1 × 450 GB", unavailableIn: ["ap-south-1"] }),
  inst("g4dn.2xlarge", "G4dn", "Accelerated · GPU", "Intel Xeon (Cascade Lake) + NVIDIA T4 16 GB", "2.5 GHz", "x86_64", 8, 32, "Up to 25 Gbps", 0.752, ["ml"], { gpu: "NVIDIA T4", nvme: "1 × 225 GB" }),
  inst("m6i.xlarge", "M6i", "General purpose", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 4, 16, "Up to 12.5 Gbps", 0.192, ["general", "web"]),
  inst("m7g.xlarge", "M7g", "General purpose", "AWS Graviton3", "2.6 GHz", "arm64", 4, 16, "Up to 12.5 Gbps", 0.1632, ["general", "web"]),
  inst("r6i.xlarge", "R6i", "Memory optimized", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 4, 32, "Up to 12.5 Gbps", 0.252, ["memory", "db"]),
  inst("m6i.4xlarge", "M6i", "General purpose", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 16, 64, "Up to 12.5 Gbps", 0.768, ["general"]),
  inst("c6i.4xlarge", "C6i", "Compute optimized", "Intel Xeon 8375C (Ice Lake)", "3.5 GHz", "x86_64", 16, 32, "Up to 12.5 Gbps", 0.68, ["compute"]),
  inst("c7g.4xlarge", "C7g", "Compute optimized", "AWS Graviton3", "2.6 GHz", "arm64", 16, 32, "Up to 15 Gbps", 0.578, ["compute"]),
];

export const FAMILY_BLURBS: Record<string, string> = {
  M6i: "Balanced compute, memory and networking on 3rd-gen Intel Xeon. A common default for application servers, microservices and mid-size data stores.",
  M7i: "Balanced instances on 4th-gen Intel Xeon with higher per-core performance than M6i at a small price premium.",
  M6a: "Balanced instances on 3rd-gen AMD EPYC. Same shape as M6i at a roughly 10% lower list price.",
  M7a: "Balanced instances on 4th-gen AMD EPYC with one physical core per vCPU.",
  M6g: "Balanced instances on AWS Graviton2 (arm64). Requires arm64-compatible images and dependencies.",
  M7g: "Balanced instances on AWS Graviton3 (arm64) with DDR5 memory and higher network bandwidth than M6g.",
  T3: "Burstable instances that earn CPU credits below a 40% baseline per vCPU. Suited to spiky, low-average workloads.",
  C6i: "Compute-optimized, 2 GiB per vCPU. For batch processing, encoding, high-traffic web tiers and gaming servers.",
  C7i: "Compute-optimized on 4th-gen Intel Xeon, 2 GiB per vCPU.",
  C7g: "Compute-optimized on Graviton3 (arm64), 2 GiB per vCPU.",
  R6i: "Memory-optimized, 8 GiB per vCPU. For relational databases, caches and in-memory analytics.",
  R6a: "Memory-optimized on AMD EPYC, 8 GiB per vCPU.",
  R7g: "Memory-optimized on Graviton3 (arm64), 8 GiB per vCPU.",
  X2gd: "Very high memory per vCPU (16 GiB) on Graviton2 with local NVMe storage.",
  G5: "GPU instances with NVIDIA A10G for ML inference, small-scale training and graphics workloads.",
  G4dn: "GPU instances with NVIDIA T4 for cost-efficient ML inference and video transcoding.",
};

export const DEFAULT_COMPARE: string[] = ["m6i.2xlarge", "m7i.2xlarge", "m6a.2xlarge"];
export const DEFAULT_REGION: RegionId = "us-east-1";
