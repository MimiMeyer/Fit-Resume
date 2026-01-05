export const styles = {
  rootCard: "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:p-6",
  headerRow: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  modeTogglePill:
    "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-semibold text-zinc-700",
  modeButtonBase: "rounded-full px-3 py-1 transition",
  modeButtonActive: "bg-white text-zinc-900 shadow-sm",
  modeButtonInactive: "text-zinc-600 hover:bg-white/70",
  statusBadge:
    "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100",
  resetButton:
    "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  panelGrid: "mt-4 grid items-start gap-3 sm:gap-4",
  previewPanel:
    "flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-inner sm:p-4",
} as const;

export const toolbarStyles = {
  pillButton:
    "rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-white/70",
  menuCard:
    "absolute left-0 top-full mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg",
  menuCardRight:
    "absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg",
  menuSectionLabel: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
  tabPill:
    "flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-[11px] font-semibold text-zinc-700",
  tabButtonBase: "rounded-full px-2 py-1 transition whitespace-nowrap",
  tabButtonActive: "bg-white text-zinc-900 shadow-sm",
  tabButtonInactive: "text-zinc-600 hover:bg-white/70",
  resetButton:
    "h-7 w-7 shrink-0 rounded-md border border-zinc-200 bg-white text-[12px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50",
  resetAllButton:
    "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50",
  select:
    "h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm",
} as const;
