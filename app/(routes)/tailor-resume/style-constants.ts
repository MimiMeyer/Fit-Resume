export const styles = {
  rootCard: "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:p-6",
  headerRow: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  modeTogglePill:
    "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-semibold text-zinc-700",
  modeButtonBase: "rounded-full px-3 py-1 transition",
  modeButtonActive: "bg-white text-zinc-900 shadow-sm",
  modeButtonInactive: "text-zinc-600 hover:bg-white/70",
  statusBadge:
    "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-100 sm:px-3 sm:text-xs",
  resetButton:
    "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-3 sm:text-xs",
  panelGrid: "mt-4 grid items-start gap-3 sm:gap-4",
  previewPanel:
    "flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-inner sm:p-4",
} as const;

export const toolbarStyles = {
  pillButton:
    "rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold text-zinc-700 hover:bg-white/70 sm:px-3 sm:py-1.5 sm:text-[11px]",
  menuCard:
    "fixed left-1/2 top-20 z-50 mt-0 max-h-[70vh] w-[calc(100vw-1.5rem)] max-w-[20rem] -translate-x-1/2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-lg box-border sm:absolute sm:left-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-64 sm:max-w-none sm:translate-x-0 sm:overflow-visible",
  menuCardRight:
    "fixed left-1/2 top-20 z-50 mt-0 max-h-[70vh] w-[calc(100vw-1.5rem)] max-w-[22rem] -translate-x-1/2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-lg box-border sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-72 sm:max-w-none sm:translate-x-0 sm:overflow-visible",
  menuSectionLabel:
    "text-[9px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[10px]",
  tabPill:
    "flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[10px] font-semibold text-zinc-700 sm:p-1 sm:text-[11px]",
  tabButtonBase: "rounded-full px-1.5 py-0.5 transition whitespace-nowrap sm:px-2 sm:py-1",
  tabButtonActive: "bg-white text-zinc-900 shadow-sm",
  tabButtonInactive: "text-zinc-600 hover:bg-white/70",
  resetButton:
    "h-7 w-7 shrink-0 rounded-md border border-zinc-200 bg-white text-[12px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50",
  resetAllButton:
    "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 sm:text-[11px]",
  select:
    "h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-900 shadow-sm sm:text-[11px]",
} as const;
