const sections = [
  {
    title: "About Me",
    items: [
      "Single source of truth for profile, skills, projects, highlights",
      "Modal-based add/edit for experience, education, certifications, skills",
      "Keep contact, title, summary, and links ready for generation",
    ],
  },
  {
    title: "Create Resume",
    items: [
      "Paste a job description; run agents to tailor summary/experience/projects/skills",
      "Auto-pagination to A4; download PDF/Doc from in-memory output",
      "AI output is not saved—export only when you’re ready",
    ],
  },
  {
    title: "Agentic Flow",
    items: [
      "JD parsing → profile retrieval → AI agents for summary/bullets/projects/skills",
      "Runs via /api/generate-resume (Anthropic); no DB writes from generation",
      "CLI scaffold in scripts/agentic-cli.ts for local runs against Prisma",
    ],
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-600">
          FitResume
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
          Agentic copilot for tailoring resumes to any job you paste.
        </h1>
        <p className="max-w-3xl text-lg text-zinc-700">
          Maintain an About Me profile, paste a job description, and let the
          agent extract signals, match against your inventory, and draft a
          tailored resume you can copy or download.
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-zinc-800">
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            About Me source of truth
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            job description  parsing + mapping
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Tailored resume sections
          </span>
          <span className="rounded-full border border-zinc-200 px-4 py-2 font-semibold">
            Copy / download actions
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
