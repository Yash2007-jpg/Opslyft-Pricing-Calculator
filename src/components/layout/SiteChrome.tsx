"use client";

import Image from "next/image";
import type { Screen } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CountPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const NAV: { id: Screen; label: string }[] = [
  { id: "explorer", label: "Explorer" },
  { id: "compare", label: "Compare" },
  { id: "calculator", label: "Calculator" },
  { id: "optimize", label: "Optimize" },
];

export function SiteHeader({ screen, compareCount, onNavigate }: { screen: Screen; compareCount: number; onNavigate: (s: Screen) => void }) {
  const items = NAV.map((n) => {
    const active = screen === n.id;
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => onNavigate(n.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[9px] border-0 px-3 text-sm font-medium whitespace-nowrap transition-colors",
          active ? "bg-raised text-ink shadow-[inset_0_-2px_0_var(--color-accent)]" : "bg-transparent text-muted hover:text-ink",
        )}
      >
        {n.label}
        {n.id === "compare" && compareCount > 0 && <CountPill>{compareCount}</CountPill>}
      </button>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-8 px-[clamp(16px,4vw,48px)]">
        <button type="button" onClick={() => onNavigate("landing")} className="flex shrink-0 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0">
          <Image src="/opslyft-logo.png" alt="Opslyft" width={66} height={22} className="h-[22px] w-auto" priority />
          <span className="rounded-md border border-line-strong px-[7px] py-[3px] font-mono text-[10.5px] font-medium tracking-[.06em] whitespace-nowrap text-muted">
            CLOUD CALCULATOR
          </span>
        </button>
        <nav className="hidden items-center gap-0.5 md:flex">{items}</nav>
        <div className="ml-auto flex items-center gap-5">
          <div className="hidden gap-5 text-sm md:flex">
            <a href="#" className="text-muted hover:text-ink">
              Docs
            </a>
            <a href="#" className="text-muted hover:text-ink">
              About
            </a>
          </div>
          <Button size="nav" onClick={() => onNavigate("explorer")}>
            Get Started
          </Button>
        </div>
      </div>
      <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2.5 md:hidden">{items}</nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 px-[clamp(16px,4vw,48px)] py-[22px] text-[12.5px] text-dim">
        <span>© 2026 Opslyft · Cloud Calculator</span>
        <span>Sample pricing based on public AWS list rates. For illustration, not a quote.</span>
      </div>
    </footer>
  );
}

/** Page container + title block shared by all app screens. */
export function ScreenShell({ title, subtitle, actions, children, label }: { title: string; subtitle: string; actions?: React.ReactNode; children: React.ReactNode; label: string }) {
  return (
    <div data-screen-label={label} className="mx-auto flex max-w-[1320px] flex-col gap-7 px-[clamp(16px,4vw,48px)] pt-[clamp(28px,4vw,48px)] pb-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.025em]">{title}</h1>
          <p className="m-0 max-w-[720px] text-base text-pretty text-muted">{subtitle}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
