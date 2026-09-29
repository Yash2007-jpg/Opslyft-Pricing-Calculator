"use client";

import { useEffect, type ReactNode } from "react";

/** Right-anchored drawer with scrim. Full width on mobile, 600px max. */
export function Drawer({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-80 bg-[rgb(3_6_9/0.62)] backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="fixed inset-y-0 right-0 z-90 flex w-full max-w-[600px] flex-col border-l border-line-glow bg-overlay shadow-[-30px_0_80px_-20px_rgba(0,0,0,.7)]"
      >
        {children}
      </aside>
    </>
  );
}
