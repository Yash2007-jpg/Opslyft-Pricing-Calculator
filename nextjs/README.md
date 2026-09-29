# Opslyft Cloud Calculator — Next.js implementation

Target: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, `src/` directory, `@/*` → `src/*` alias (the create-next-app defaults).

## Where every file goes

Copy the contents of this folder into the root of your `opslyft-cloud-calculator` project.

**Replace** (these already exist in a fresh create-next-app):

| File | Notes |
| --- | --- |
| `src/app/page.tsx` | Renders `<CloudCalculatorApp />` |
| `src/app/layout.tsx` | Geist + Geist Mono via `next/font`, metadata |
| `src/app/globals.css` | Tailwind import + design tokens (`@theme`) + a few base resets |

**Create:**

```
public/opslyft-logo.png

src/lib/types.ts                 Shared domain types
src/lib/pricing.ts               Price math + formatters
src/lib/recommendations.ts       Swap + commitment alternatives (measurable rules)
src/lib/explorer.ts              Filtering, sorting, default filters
src/lib/options.ts               Select option lists
src/lib/cn.ts                    className joiner

src/data/catalog.ts              MOCK instances, regions, OS, pricing models, workloads

src/components/CloudCalculatorApp.tsx          Client shell, cross-screen state
src/components/layout/SiteChrome.tsx           SiteHeader, SiteFooter, ScreenShell
src/components/landing/Landing.tsx             Screen 1 — hero + how it works
src/components/landing/HeroPreview.tsx         Animated product preview
src/components/explorer/InstanceExplorer.tsx   Screen 2 + CompareTray
src/components/explorer/FilterPanel.tsx        Inline on md+, bottom sheet on mobile
src/components/explorer/InstanceCard.tsx
src/components/detail/InstanceDetailDrawer.tsx Screen 3
src/components/compare/ComparisonView.tsx      Screen 4 + recommended alternatives
src/components/compare/ComparisonTable.tsx
src/components/calculator/CostCalculator.tsx   Screen 5
src/components/optimize/OptimizationView.tsx   Screen 6
src/components/optimize/RecommendationCard.tsx

src/components/ui/Button.tsx        Button, IconButton
src/components/ui/Badge.tsx         Badge, Kicker, CountPill
src/components/ui/Select.tsx        Select, Field
src/components/ui/Stepper.tsx       Stepper, NumberInput
src/components/ui/Segmented.tsx     Segmented, Chip, Toggle
src/components/ui/MetricGrid.tsx
src/components/ui/ProviderSwitch.tsx
src/components/ui/Drawer.tsx
src/components/ui/Icons.tsx
```

No extra npm packages are required.

## Tailwind version

Written for **Tailwind v4** (tokens live in `@theme` inside `globals.css`, so classes like `bg-surface`, `text-muted`, `border-line`, `text-accent` work with no config file).

If your project is on **Tailwind v3**, replace the top of `globals.css` with `@tailwind base; @tailwind components; @tailwind utilities;`, move the `--color-*` values into `theme.extend.colors` in `tailwind.config.ts` (e.g. `surface: "#0f171e"`), set `fontFamily: { sans: ["var(--font-geist)"], mono: ["var(--font-geist-mono)"] }`, and replace the `@utility scrollbar-none` block with a plain `.scrollbar-none` class. A few v4-only shorthands (`size-*` is fine in 3.4; `bg-size-[…]`, `mask-[…]` need arbitrary properties `[background-size:56px_56px]`, `[mask-image:…]`) would need that swap.

## Breakpoints

- Mobile `< 768px` (`md`): filters become a bottom sheet, nav moves to a scrollable row, comparison table scrolls horizontally with narrower columns.
- Tablet/desktop: layouts reflow with `auto-fit/auto-fill` grids, so 1024 and 1440 both work without extra breakpoints.

## Connecting Supabase later

All data comes from `src/data/catalog.ts`. The simplest swap:

1. Keep the `Instance` / `Region` / `PricingModel` shapes from `src/lib/types.ts` as your table/view contract.
2. Fetch in `src/app/page.tsx` (server component) and pass `instances` down to `CloudCalculatorApp` as a prop, or expose it through a React context.
3. Replace direct `INSTANCES` imports in `lib/pricing.ts` (`getInstance`), `lib/explorer.ts` and `lib/recommendations.ts` with the passed-in list (each function can take `instances: Instance[]` as a first argument).

Prices in the mock are approximate public AWS list rates and are labelled as sample data in the UI.
