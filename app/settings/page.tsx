const toggles = [
  {
    label: "Enable scheduled scraping",
    detail: "Run nightly pulls from connected boards.",
  },
  {
    label: "Send match alerts",
    detail: "Notify when new roles pass the match threshold.",
  },
  {
    label: "Auto-tailor resume drafts",
    detail: "Generate drafts for high-match roles automatically.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Configure automations, integrations, and alerts.
        </h1>
        <p className="text-sm text-zinc-600">
          Wire up job boards, set match thresholds, and control agent behaviors.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Automation</h2>
        <div className="space-y-3">
          {toggles.map((toggle) => (
            <div
              key={toggle.label}
              className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {toggle.label}
                </p>
                <p className="text-xs text-zinc-600">{toggle.detail}</p>
              </div>
              <button
                type="button"
                aria-pressed="false"
                className="inline-flex h-7 w-14 items-center justify-center rounded-full border border-[var(--accent)] bg-white px-2 text-[0.65rem] font-semibold text-[var(--accent)]"
              >
                Off
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Integrations</h2>
        <p className="text-sm text-zinc-600">
          Stubs for LinkedIn, Indeed, and ATS exports. Hook these into API keys
          and OAuth later.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700">
            LinkedIn
          </span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700">
            Indeed
          </span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700">
            Greenhouse / Lever
          </span>
        </div>
      </section>
    </div>
  );
}
