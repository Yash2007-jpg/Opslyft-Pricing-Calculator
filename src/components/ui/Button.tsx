import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "savings" | "ghost" | "link";
type Size = "sm" | "md" | "lg" | "nav";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent font-semibold hover:bg-accent-hover",
  secondary: "border border-line-strong bg-transparent text-ink hover:bg-elevated",
  savings: "border border-line-savings bg-accent/8 text-accent font-medium hover:bg-accent/14",
  ghost: "border border-line-strong bg-raised/60 text-ink hover:bg-elevated hover:border-line-hover",
  link: "p-0 h-auto bg-transparent text-muted underline underline-offset-[3px] hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-[34px] px-3.5 text-[13px] rounded-[9px]",
  nav: "h-[38px] px-4 text-sm rounded-[10px]",
  md: "h-11 px-5 text-[15px] rounded-[10px]",
  lg: "h-12 px-[22px] text-[15px] rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        variant === "link" ? "text-[12.5px]" : sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-line-strong bg-transparent text-ink transition-colors hover:bg-elevated",
        className,
      )}
      {...props}
    />
  );
}
