import { getProfile } from "@/app/actions/profile";

export default async function AboutPage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <h1 className="text-2xl font-semibold text-zinc-900">About Me</h1>
        <p className="text-sm text-zinc-600">
          No profile data yet. Seed via Prisma or future UI forms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          About Me
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {profile.fullName}
        </h1>
        <p className="text-sm text-zinc-700">
          {profile.title ?? profile.headline ?? "Role not set"}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-zinc-700">
          {profile.location && (
            <span className="rounded-full border border-zinc-200 px-3 py-1">
              {profile.location}
            </span>
          )}
          {profile.email && (
            <span className="rounded-full border border-zinc-200 px-3 py-1">
              {profile.email}
            </span>
          )}
          {profile.phone && (
            <span className="rounded-full border border-zinc-200 px-3 py-1">
              {profile.phone}
            </span>
          )}
          {profile.linkedinUrl && (
            <a
              className="rounded-full border border-zinc-200 px-3 py-1 text-blue-700"
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          )}
          {profile.githubUrl && (
            <a
              className="rounded-full border border-zinc-200 px-3 py-1 text-blue-700"
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          )}
        </div>
        {profile.summary && (
          <p className="text-sm text-zinc-700">{profile.summary}</p>
        )}
      </header>

      {profile.experiences.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
          </div>
          <div className="space-y-3">
            {profile.experiences.map((exp) => (
              <article
                key={exp.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {exp.role}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {exp.company}
                    {exp.period ? ` • ${exp.period}` : ""}
                  </p>
                  {exp.impact && (
                    <p className="text-sm text-zinc-700">{exp.impact}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.projects.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
          </div>
          <div className="space-y-3">
            {profile.projects.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="text-sm text-zinc-700">
                      {project.description}
                    </p>
                  )}
                  {project.technologies.length ? (
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-700">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-zinc-200 px-2 py-1"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {project.link ? (
                    <a
                      href={project.link}
                      className="text-xs font-semibold text-[var(--accent)]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.skills.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Skills</h2>
            <span className="text-xs text-zinc-500">
              {profile.skills.length} skills
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {profile.skills
              .map((s) => s.skill)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-800">{skill.name}</span>
                  {skill.category && (
                    <span className="rounded bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700">
                      {skill.category}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {profile.educations.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Education</h2>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.educations.map((edu) => (
              <div key={edu.id} className="border-b border-zinc-100 pb-2 last:border-0">
                <p className="font-semibold text-zinc-900">{edu.institution}</p>
                <p className="text-xs text-zinc-600">
                  {edu.degree}
                  {edu.field ? ` — ${edu.field}` : ""}
                </p>
                {(edu.startYear || edu.endYear) && (
                  <p className="text-xs text-zinc-600">
                    {edu.startYear ?? "?"} - {edu.endYear ?? "?"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {profile.certs.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">
            Certifications
          </h2>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.certs.map((cert) => (
              <div key={cert.id} className="border-b border-zinc-100 pb-2 last:border-0">
                <p className="font-semibold text-zinc-900">{cert.name}</p>
                <p className="text-xs text-zinc-600">
                  {cert.issuer ?? "Issuer not set"}
                  {cert.issuedYear ? ` • ${cert.issuedYear}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
