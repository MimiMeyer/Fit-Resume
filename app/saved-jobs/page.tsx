const savedJobs = [
  {
    title: "Staff Frontend Engineer",
    company: "Orbit",
    status: "Ready to apply",
    notes: "Needs tailored resume + cover letter",
  },
  {
    title: "Backend Engineer",
    company: "Signal Ridge",
    status: "Researching company",
    notes: "Check engineering blog + Glassdoor",
  },
];

export default function SavedJobsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Saved Jobs
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Track roles, status, and next actions.
        </h1>
        <p className="text-sm text-zinc-600">
          Keep a shortlist of high-signal roles, then tailor and download resumes
          using your About Me profile.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-700">
          Tailoring uses your About Me data (summary, skills, experience) and a
          fixed resume template for consistency.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {savedJobs.map((job) => (
          <article
            key={job.title}
            className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {job.title}
                </h2>
                <p className="text-sm text-zinc-600">{job.company}</p>
              </div>
              <span className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                {job.status}
              </span>
            </div>
            <p className="text-sm text-zinc-600">{job.notes}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button className="rounded-full border border-[var(--accent)] px-3 py-1 font-semibold text-[var(--accent)]">
                Tailor resume
              </button>
              <button className="rounded-full border border-zinc-200 px-3 py-1 font-semibold text-zinc-800">
                Download PDF (soon)
              </button>
              <button className="rounded-full border border-zinc-200 px-3 py-1 font-semibold text-zinc-800">
                Add note
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
