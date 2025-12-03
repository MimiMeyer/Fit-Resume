const sections = [
  {
    title: "Job Scraping Engine",
    items: [
      "Keyword-driven scraping across multiple boards",
      "Structured metadata: title, company, salary, stack, location",
      "Refresh jobs on a schedule and score relevance",
    ],
  },
  {
    title: "AI Resume Tailoring",
    items: [
      "Profile-driven tailoring using your About Me data",
      "Fixed resume template for consistent exports",
      "Generate a tailored version per saved job",
    ],
  },
  {
    title: "Dashboard UI",
    items: [
      "Job Search, Saved Jobs, Resume Template, About Me",
      "Filters, match hints, status tracking",
      "Insights and download actions per role",
    ],
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Career Companion
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
          AI copilot for finding, ranking, and applying to jobs.
        </h1>
        <p className="max-w-3xl text-lg text-zinc-700">
          Add keywords, scrape boards, save the best roles, and generate a
          tailored resume (fixed template) using your maintained profile.
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-zinc-800">
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Keyword scraping
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Saved job workspace
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Resume tailoring
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Fixed template exports
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              {section.title}
            </h2>
            <ul className="space-y-2 text-sm text-zinc-700">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2 leading-relaxed">
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
