import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

type Size = "sm" | "md" | "lg";
const sizes: Record<Size, string> = {
  sm: "h-[34px] pl-3 pr-8 text-[13px] rounded-[9px]",
  md: "h-10 pl-3 pr-[34px] text-sm rounded-[10px]",
  lg: "h-11 pl-3 pr-[34px] text-sm rounded-[10px]",
};

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> {
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  size?: Size;
  mono?: boolean;
  placeholder?: string;
}

export function Select({ options, onValueChange, size = "md", mono, placeholder, className, ...props }: SelectProps) {
  return (
    <select
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "w-full cursor-pointer border border-line-strong bg-raised text-ink outline-none",
        sizes[size],
        mono && "font-mono font-medium",
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
