import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, sw = 2.5) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const ArrowRightIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const XIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, 3)} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const CheckIcon = ({ size = 10, ...p }: P) => (
  <svg {...base(size, 4)} {...p}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
export const SearchIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const SlidersIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);
