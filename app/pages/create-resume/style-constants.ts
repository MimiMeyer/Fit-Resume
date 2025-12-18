export const styles = {
  rootCard: "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100",
  headerRow: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end",
  modeTogglePill:
    "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-semibold text-zinc-700",
  modeButtonBase: "rounded-full px-3 py-1 transition",
  modeButtonActive: "bg-white text-zinc-900 shadow-sm",
  modeButtonInactive: "text-zinc-600 hover:bg-white/70",
  statusBadge:
    "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100",
  resetButton:
    "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  panelGrid: "mt-4 grid gap-4 items-start",
  previewPanel:
    "flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-inner",
} as const;

