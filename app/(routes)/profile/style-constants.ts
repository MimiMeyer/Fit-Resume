export const styles = {
  labelText: "block text-xs font-semibold text-zinc-700",
  listRow:
    "border-b border-zinc-100 pb-2 last:border-0 flex items-start justify-between gap-3",
  stackSm: "flex flex-col gap-1",
  stackSmFlex: "flex flex-col gap-1 flex-1",
  headerStack: "flex flex-col gap-2 flex-1",
  chipWrap: "flex flex-wrap gap-2 px-4 pb-4",
  tagWrap: "flex flex-wrap gap-2 text-xs text-zinc-700",
  pillRow: "flex flex-wrap gap-3 text-xs text-zinc-700",
  hoverReveal:
    "flex gap-1 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px] group-focus-within:opacity-100 group-focus-within:max-w-[200px] transition-all duration-150 overflow-hidden",
  actionsRow: "flex gap-2",
  actionsRowPadded: "flex gap-2 pt-2",
  categoryToggle:
    "flex items-center gap-2 font-semibold text-zinc-900 transition hover:text-indigo-800",
  categoryHeaderLeft: "flex items-center gap-2 px-4 pt-3",
  sectionHeader: "flex items-center justify-between",
  sectionHeaderSpaced: "flex items-center justify-between gap-3",
  bulletRow: "flex items-start gap-2",
  headerRow: "flex items-start justify-between",
  flex1: "flex-1",
  strongText: "font-semibold text-zinc-900",
  twoColGrid: "grid grid-cols-2 gap-3",
  iconSm: "h-4 w-4 text-zinc-900",
  primaryButton:
    "inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 sm:text-sm",
  skillsHeader: "mb-2 flex items-center gap-2 justify-between",
  skillsHeaderActions: "ml-auto flex items-center gap-1",
  bulletDot: "mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]",
  bulletList: "mt-1 space-y-1 text-xs text-zinc-700 sm:text-sm",
  primaryButtonAlt:
    "rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50",
  secondaryButtonAlt:
    "rounded border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50",
  pillSm: "rounded-full border border-zinc-200 px-2 py-1",
  pill: "rounded-full border border-zinc-200 px-3 py-1",
  linkPill: "rounded-full border border-zinc-200 px-3 py-1 text-blue-700",
  cancelButton:
    "rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:text-sm",
  categoryCard:
    "rounded-xl border border-indigo-100 bg-gradient-to-r from-white via-[#f3f1ff] to-white shadow-sm",
  itemCard:
    "rounded-xl border border-zinc-100 bg-zinc-50 p-3 flex items-start justify-between gap-3 sm:p-4",
  formField: "space-y-1 block",
  formSection: "space-y-2",
  sectionCard: "space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:p-6",
  sectionBody: "space-y-2 text-xs text-zinc-700 sm:text-sm",
  stackMd: "space-y-3",
  sectionCardMd:
    "space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:p-6",
  stackMdPadded: "space-y-4 pt-1",
  aboutCard: "space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:p-6",
  backupCard:
    "space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm ring-1 ring-indigo-100 sm:p-6",
  backupTitle: "text-base font-semibold text-zinc-900",
  formContainer: "space-y-4 text-xs text-zinc-800 sm:text-sm",
  pageRoot: "space-y-6 sm:space-y-8",
  pageTitle: "text-xl font-semibold text-zinc-900 sm:text-2xl",
  sectionTitle: "text-sm font-semibold text-zinc-900",
  bodyText: "text-xs text-zinc-700 sm:text-sm",
  countBadge: "text-xs bg-indigo-100 text-indigo-900 rounded-full px-2 py-0.5",
  accentLink: "text-xs font-semibold text-[var(--accent)]",
  eyebrow: "text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600",
  mutedText: "text-xs text-zinc-600",
  skillName: "text-zinc-800 font-medium",
  categoryEditInput:
    "w-48 rounded border border-indigo-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  input: "w-full rounded border border-zinc-200 px-3 py-2 text-sm",
  addButton:
    "inline-flex h-8 px-3 items-center justify-center gap-1 rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700",
  editButton:
    "inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700",
  iconOnly:
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700",
  iconOnlyWithMargin:
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700 ml-4",
  skillRemove:
    "inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-500 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700",
  skillChipBase:
    "group inline-flex items-center justify-between rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs gap-1 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-150 hover:bg-indigo-50 focus-visible:bg-indigo-50",
  skillChipDragging: "opacity-50",
} as const;

