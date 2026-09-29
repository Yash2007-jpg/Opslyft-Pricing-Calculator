import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "neutral" | "accent" | "warn" | "sample" | "soon" | "outline";

const variants: Record<Variant, string> = {
  neutral: "text-xs text-ink-2 bg-elevated rounded-md px-2 py-[3px]",
  accent: "text-xs text-accent bg-accent/10 rounded-md px-2 py-[3px]",
  warn: "text-xs text-warn bg-warn/10 rounded-md px-2 py-[3px]",
  sample: "font-mono text-[10.5px] font-medium tracking-[.06em] text-muted border border-dashed border-line-strong rounded-md px-[7px] py-[3px]",
  soon: "font-mono text-[10px] font-medium text-dim border border-line-strong rounded-[5px] px-[5px] py-px",
  outline: "text-xs text-ink-2 border border-line-strong rounded-full px-2.5 py-[3px]",
};

export function Badge({ variant = "neutral", mono, className, children }: { variant?: Variant; mono?: boolean; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap", variants[variant], mono && "font-mono font-medium", className)}>{children}</span>;
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[11px] font-medium tracking-[.08em] text-dim uppercase", className)}>{children}</span>;
}

export function CountPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-elevated px-[7px] py-px font-mono text-[11px] font-semibold text-accent">{children}</span>;
}
