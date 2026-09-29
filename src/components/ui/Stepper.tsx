import { cn } from "@/lib/cn";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "md" | "lg";
  label?: string;
}

export function Stepper({ value, onChange, min = 1, max = 999, size = "lg", label = "Quantity" }: StepperProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const btn = cn("h-full cursor-pointer border-0 bg-transparent text-ink hover:bg-elevated", size === "lg" ? "w-11 text-lg" : "w-10 text-[17px]");
  return (
    <div className={cn("flex items-center overflow-hidden rounded-[10px] border border-line-strong bg-raised", size === "lg" ? "h-11" : "h-10")}>
      <button type="button" aria-label={`Decrease ${label}`} className={btn} onClick={() => onChange(clamp(value - 1))}>
        −
      </button>
      <input
        type="number"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
        className={cn("h-full min-w-0 flex-1 border-0 bg-transparent text-center font-mono font-semibold text-ink outline-none", size === "lg" ? "text-[15px]" : "text-sm")}
      />
      <button type="button" aria-label={`Increase ${label}`} className={btn} onClick={() => onChange(clamp(value + 1))}>
        +
      </button>
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  max = 744,
  suffix,
  size = "lg",
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  suffix?: string;
  size?: "md" | "lg";
  label: string;
}) {
  return (
    <div className={cn("flex items-center rounded-[10px] border border-line-strong bg-raised pr-3", size === "lg" ? "h-11" : "h-10")}>
      <input
        type="number"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        className={cn("h-full min-w-0 flex-1 border-0 bg-transparent px-3 font-mono font-semibold text-ink outline-none", size === "lg" ? "text-[15px]" : "text-sm")}
      />
      {suffix && <span className="text-[12.5px] text-dim">{suffix}</span>}
    </div>
  );
}
