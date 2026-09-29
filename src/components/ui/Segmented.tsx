import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Pill-in-track segmented control (OS picker, provider switch). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: ReactNode; disabled?: boolean }[];
  value: T;
  onChange?: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-1 rounded-xl border border-line bg-canvas p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange?.(o.value)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-[9px] border-0 text-sm font-medium whitespace-nowrap",
              active ? "bg-elevated text-ink shadow-[inset_0_0_0_1px_var(--color-line-accent)]" : "bg-transparent text-muted",
              o.disabled ? "cursor-default text-dim" : "cursor-pointer",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Rounded filter chip (workload categories, hour presets). */
export function Chip({ active, onClick, children, size = "md" }: { active: boolean; onClick: () => void; children: ReactNode; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border whitespace-nowrap transition-colors",
        size === "md" ? "h-[34px] px-3.5 text-[13.5px] font-medium" : "h-[30px] px-3 text-[12.5px]",
        active
          ? "border-line-accent bg-accent/10 text-accent"
          : size === "md"
            ? "border-line bg-surface text-ink-2 hover:border-line-strong"
            : "border-line bg-transparent text-muted hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/** Pill with a switch — used for optimization constraints. */
export function Toggle({ on, onToggle, children }: { on: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-full border pr-3.5 pl-2 text-[13px] whitespace-nowrap transition-colors",
        on ? "border-line-accent bg-accent/6 text-ink" : "border-line bg-surface text-muted",
      )}
    >
      <span className={cn("relative block h-4 w-7 rounded-full transition-colors", on ? "bg-accent" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 size-3 rounded-full transition-all", on ? "left-3.5 bg-on-accent" : "left-0.5 bg-muted")} />
      </span>
      {children}
    </button>
  );
}
