export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Configure automations and integrations.
        </h1>
        <p className="text-sm text-zinc-600">
          This page will surface toggles and integrations once connected to live
          data. No placeholders shown.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm text-zinc-700">
          Coming soon: scheduled scraping, match alerts, auto-tailored drafts,
          and job board/ATS integrations.
        </p>
      </section>
    </div>
  );
}
