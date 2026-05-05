/**
 * Reusable Tailwind class compositions to reduce className duplication.
 * Use with `cn()` from "@/lib/utils" when combining with conditional classes.
 *
 * Example:
 *   <div className={cn(card.glass, "p-5")}>...</div>
 */

export const card = {
  /** Glass-morphism panel — common container in the app. */
  glass: "glass rounded-xl",
  /** Compact glass card with default 5-unit padding. */
  glassPad: "glass rounded-xl p-5",
  /** Glass card with 4-unit padding (used for tables / scrollable content). */
  glassPadSm: "glass rounded-xl p-4",
} as const;

export const badge = {
  primary:
    "px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground backdrop-blur-sm",
  success:
    "px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-500 backdrop-blur-sm border border-emerald-500/30",
  warning:
    "px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500 backdrop-blur-sm border border-amber-500/30",
  danger:
    "px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500 backdrop-blur-sm border border-red-500/30",
  muted:
    "px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground",
} as const;

export const text = {
  /** Small uppercase label, used above stat values. */
  statLabel: "text-xs uppercase tracking-wide text-muted-foreground",
  /** Large display number, used for stat values. */
  statValue: "text-2xl font-display font-bold mt-2",
} as const;
