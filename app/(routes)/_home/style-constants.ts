export const styles = {
  pageRoot: "space-y-10",
  heroCard:
    "relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-8",
  heroBackdrop:
    "pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_18%_18%,rgba(13,148,136,0.18),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(109,86,239,0.18),transparent_38%),radial-gradient(circle_at_45%_95%,rgba(59,130,246,0.12),transparent_45%)]",
  heroEyebrow: "text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600 sm:text-sm",
  heroTitle: "text-2xl font-semibold leading-snug text-zinc-950 sm:text-4xl lg:text-5xl",
  heroSubtitle: "max-w-3xl text-sm leading-relaxed text-zinc-700 sm:text-base lg:text-lg",
  noticeCard:
    "rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6",
  noticeHeaderRow: "flex items-center justify-between gap-3",
  noticeTitle: "text-sm font-semibold uppercase tracking-[0.14em] text-zinc-700",
  noticeLink:
    "text-xs font-semibold text-[var(--accent)] rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:underline",
  noticeText: "mt-2 text-xs leading-relaxed text-zinc-700 sm:text-sm",
  heroBody: "max-w-3xl text-lg text-zinc-700",
  cardsGrid: "grid gap-6 md:grid-cols-2",
  card:
    "group relative flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md sm:p-6",
  cardTopRow: "flex items-center justify-between gap-3",
  cardIcon:
    "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 sm:h-11 sm:w-11",
  cardTitle: "text-base font-semibold text-zinc-900 sm:text-lg",
  cardFlow: "text-xs font-semibold text-zinc-800 sm:text-sm",
  cardLead: "text-sm font-medium leading-relaxed text-zinc-800",
  cardDetail: "text-xs leading-relaxed text-zinc-700 sm:text-sm",
  cardArrow:
    "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-zinc-600 ring-1 ring-black/5 transition group-hover:translate-x-0.5 group-hover:text-zinc-900",
} as const;
