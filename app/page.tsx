const sections = [
  {
    title: "About Me",
    items: [
      "Single source of truth for profile, skills, projects, highlights",
      "Edit and version details the agent can reuse",
      "Fast add/edit forms for experience, education, and skills",
    ],
  },
  {
    title: "Create Resume",
    items: [
      "Paste a job description and extract role, level, stack, must-haves",
      "Map job description  signals to your profile and surface gaps",
      "Generate tailored summary, bullets, skills, and optional cover note",
    ],
  },
  {
    title: "Agentic Flow",
    items: [
      "Job description  parsing → profile retrieval → content plan → formatted output",
      "Regenerate sections independently and lock favorites",
      "Download or copy sections into your fixed resume template",
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
