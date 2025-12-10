export default function SavedJobsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Saved Jobs
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Track roles, status, and next actions.
        </h1>
        <p className="text-sm text-zinc-600">
          Tailoring and downloads will appear here once connected to real data.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm text-zinc-700">
          No sample jobs displayed. This page will list saved roles from the
          database and trigger resume generation per job.
        </p>
      </section>
    </div>
  );
}
