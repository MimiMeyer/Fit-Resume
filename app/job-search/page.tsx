const keywords = ["frontend engineer", "typescript", "remote", "b2b saas"];
const sampleJobs = [
  {
    title: "Senior Fullstack Engineer",
    company: "Acme Corp",
    location: "Remote (US)",
    stack: "TypeScript, Next.js, Postgres",
    match: "86%",
  },
  {
    title: "Data Engineer",
    company: "Northwind Labs",
    location: "New York, NY",
    stack: "Python, Airflow, dbt",
    match: "78%",
  },
];

export default function JobSearchPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Job Search
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Add keywords, scrape boards, and save the best roles.
        </h1>
        <p className="text-sm text-zinc-600">
          Provide keywords to drive scraping across boards. Save promising roles
          to tailor resumes later.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-zinc-900">
              Keywords to scrape
            </label>
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4">
              <div className="flex flex-wrap gap-2 text-sm text-zinc-800">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-dashed border-zinc-200 px-3 py-1"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Add keyword (e.g., 'react', 'staff engineer', 'remote europe')"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                />
                <button className="self-start rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                  Start scrape
                </button>
              </div>
              <p className="text-xs text-zinc-600">
                Uses keywords to query multiple boards; results normalize title,
                company, salary, stack, location, and match hints.
              </p>
            </div>
          </div>
          <div className="divide-y divide-zinc-100">
            {sampleJobs.map((job) => (
              <article key={job.title} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {job.title}
                    </h2>
                    <p className="text-sm text-zinc-600">
                      {job.company} • {job.location}
                    </p>
                    <p className="text-sm text-zinc-500">{job.stack}</p>
                  </div>
                  <span className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    Match {job.match}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <button className="rounded-full border border-[var(--accent)] px-3 py-1 font-semibold text-[var(--accent)]">
                    Save job
                  </button>
                  <button className="rounded-full border border-zinc-200 px-3 py-1 font-semibold text-zinc-800">
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">
            Upcoming automations
          </h3>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>Schedule new scrape for LinkedIn and Indeed</li>
            <li>Enrich with salary, keywords, embeddings</li>
            <li>Push high-match roles to Saved Jobs</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
