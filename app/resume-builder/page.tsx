const sections = [
  { label: "Work history", status: "2 roles added" },
  { label: "Skills", status: "10 skills tagged" },
  { label: "Achievements", status: "4 quantified wins" },
];

export default function ResumeBuilderPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Resume Template
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Fixed layout for every tailored resume.
        </h1>
        <p className="text-sm text-zinc-600">
          Content changes per job using your About Me data, but the structure
          stays consistent for clarity and ATS friendliness.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Template rules</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.label}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            >
              <p className="text-sm font-semibold text-zinc-800">
                {section.label}
              </p>
              <p className="text-xs text-zinc-600">{section.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Template preview (static)
          </h2>
          <button className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            Export sample
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-zinc-200 p-5 text-sm text-zinc-800">
          <div>
            <p className="text-base font-semibold text-zinc-900">
              Alex Rivera — Senior Frontend Engineer
            </p>
            <p className="text-xs text-zinc-600">
              alex@example.com • New York, NY • linkedin.com/in/alex
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Summary</p>
            <p className="text-sm text-zinc-700">
              Engineer focused on shipping fast, reliable web apps with
              React/Next.js. Enjoy pairing, design systems, and measurable
              product impact.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Highlights</p>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"
                />
                <span>Rebuilt hiring funnel UI; +18% conversion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"
                />
                <span>
                  Led design system refresh; cut UI defects by 25%.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
