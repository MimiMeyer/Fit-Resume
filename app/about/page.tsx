const skills = ["TypeScript", "React", "Next.js", "Node.js", "Postgres"];
const experiences = [
  {
    role: "Senior Frontend Engineer",
    company: "Acme Corp",
    period: "2021–Present",
    impact: "Led rebuild of hiring funnel, +18% conversion.",
  },
  {
    role: "Fullstack Engineer",
    company: "Northwind Labs",
    period: "2018–2021",
    impact: "Shipped internal tools that cut ops time by 30%.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          About Me
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Keep your profile current to power tailored resumes.
        </h1>
        <p className="text-sm text-zinc-600">
          Summary, skills, and experience here feed the tailoring flow and fixed
          resume template.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-700">
            <span className="font-semibold text-zinc-900">Full name</span>
            <input
              type="text"
              defaultValue="Alex Rivera"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              aria-describedby="name-help"
            />
            <span id="name-help" className="block text-xs text-zinc-500">
              Shown on the resume header.
            </span>
          </label>
          <label className="space-y-2 text-sm text-zinc-700">
            <span className="font-semibold text-zinc-900">Headline</span>
            <input
              type="text"
              defaultValue="Senior Frontend Engineer"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="space-y-2 text-sm text-zinc-700">
          <span className="font-semibold text-zinc-900">Summary</span>
          <textarea
            rows={4}
            defaultValue="Engineer focused on shipping fast, reliable web apps with React/Next.js. Enjoy pairing, design systems, and measurable product impact."
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-900">Skills</p>
          <div className="flex flex-wrap gap-2 text-sm text-zinc-800">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-zinc-200 px-3 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
          <button className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            Edit skills
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
          <button className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            Add role
          </button>
        </div>
        <div className="space-y-3">
          {experiences.map((exp) => (
            <article
              key={exp.role}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-zinc-900">
                  {exp.role}
                </p>
                <p className="text-xs text-zinc-600">
                  {exp.company} • {exp.period}
                </p>
                <p className="text-sm text-zinc-700">{exp.impact}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 rounded-2xl bg-white p-6 shadow-sm text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">Tailoring notes</p>
        <p className="text-zinc-700">
          This profile populates tailored resumes for each saved job. Template
          stays fixed; content changes per role.
        </p>
      </section>
    </div>
  );
}
