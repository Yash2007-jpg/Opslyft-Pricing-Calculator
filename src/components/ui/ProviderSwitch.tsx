import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

/** AWS active; GCP/Azure shown as upcoming. */
export function ProviderSwitch({ layout = "inline" }: { layout?: "inline" | "grid" }) {
  const soon = (name: string) => (
    <span className={cn("flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 text-sm text-dim", layout === "grid" && "h-9 justify-center")}>
      {name}
      <Badge variant="soon">SOON</Badge>
    </span>
  );
  return (
    <div className={cn("rounded-xl border border-line p-1", layout === "grid" ? "grid grid-cols-3 gap-1 bg-canvas" : "flex gap-1 bg-surface")}>
      <span
        className={cn(
          "flex items-center gap-2 rounded-[9px] bg-elevated px-3.5 text-sm font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--color-line-accent)]",
          layout === "grid" ? "h-9 justify-center" : "h-[34px]",
        )}
      >
        {layout === "inline" && <span className="font-mono text-[10.5px] font-bold text-aws">AWS</span>}
        {layout === "inline" ? "Amazon EC2" : "AWS"}
      </span>
      {soon("GCP")}
      {soon("Azure")}
    </div>
  );
}
