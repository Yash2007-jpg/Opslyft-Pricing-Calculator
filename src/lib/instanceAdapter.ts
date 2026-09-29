import type { Instance } from "@/lib/types";

type DbInstance = {
  id: number;
  instance_type: string;
  instance_family: string | null;
  vcpu: number | null;
  memory_gib: number | null;
  architecture: string | null;
};

export function adaptInstance(row: DbInstance): Instance {
  return {
    id: row.instance_type,
    family: row.instance_family ?? "Unknown",
    category: "General purpose",
    processor: "AWS EC2",
    clock: "—",
    arch: row.architecture === "arm64" ? "arm64" : "x86_64",
    vcpu: row.vcpu ?? 0,
    memoryGiB: row.memory_gib ?? 0,
    memoryType: "DDR4",
    network: "—",
    ebsBandwidth: "—",
    hourlyUsd: 0,
    workloads: ["general"],
  };
}