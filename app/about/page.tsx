import {
  addCertification,
  addEducation,
  addExperience,
  addProject,
  addSkill,
  deleteCertification,
  deleteEducation,
  deleteExperience,
  deleteProject,
  deleteSkill,
  getProfile,
  updateProfileDetails,
} from "@/app/actions/profile";

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

  const skills = profile.skills
    .map((s) => s.skill)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
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

        <form
          action={updateProfileDetails}
          className="grid gap-4 text-sm text-zinc-800 md:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Full name</span>
            <input
              name="fullName"
              defaultValue={profile.fullName}
              className="w-full rounded border border-zinc-200 px-3 py-2"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Headline</span>
            <input
              name="headline"
              defaultValue={profile.headline ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="font-semibold text-zinc-900">Summary</span>
            <textarea
              name="summary"
              rows={3}
              defaultValue={profile.summary ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Title</span>
            <input
              name="title"
              defaultValue={profile.title ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Email</span>
            <input
              name="email"
              defaultValue={profile.email ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Phone</span>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Location</span>
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">LinkedIn</span>
            <input
              name="linkedinUrl"
              defaultValue={profile.linkedinUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">GitHub</span>
            <input
              name="githubUrl"
              defaultValue={profile.githubUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-zinc-900">Website</span>
            <input
              name="websiteUrl"
              defaultValue={profile.websiteUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="justify-self-start rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Save profile
          </button>
        </form>
      </section>

      {profile.experiences.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
            <form action={addExperience} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="role"
                placeholder="Role"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="company"
                placeholder="Company"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="period"
                placeholder="Period"
                className="w-36 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="impact"
                placeholder="Impact"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
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
                    {exp.period ? ` - ${exp.period}` : ""}
                  </p>
                  {exp.impact && (
                    <p className="text-sm text-zinc-700">{exp.impact}</p>
                  )}
                </div>
                <form action={deleteExperience} className="mt-2">
                  <input type="hidden" name="id" value={exp.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.projects.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
            <form action={addProject} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="title"
                placeholder="Title"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="description"
                placeholder="Description"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="link"
                placeholder="Link"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="technologies"
                placeholder="Tech (comma-separated)"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
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
                <form action={deleteProject} className="mt-2">
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.experiences.length ? null : (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
            <form action={addExperience} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="role"
                placeholder="Role"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="company"
                placeholder="Company"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="period"
                placeholder="Period"
                className="w-36 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="impact"
                placeholder="Impact"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <p className="text-sm text-zinc-700">
            No experience added yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.projects.length ? null : (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
            <form action={addProject} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="title"
                placeholder="Title"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="description"
                placeholder="Description"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="link"
                placeholder="Link"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="technologies"
                placeholder="Tech (comma-separated)"
                className="w-56 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <p className="text-sm text-zinc-700">
            No projects added yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.educations.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Education</h2>
            <form action={addEducation} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="institution"
                placeholder="Institution"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="degree"
                placeholder="Degree"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="field"
                placeholder="Field"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="startYear"
                placeholder="Start"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="endYear"
                placeholder="End"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.educations.map((edu) => (
              <div
                key={edu.id}
                className="border-b border-zinc-100 pb-2 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {edu.institution}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {edu.degree}
                      {edu.field ? ` - ${edu.field}` : ""}
                    </p>
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-xs text-zinc-600">
                        {edu.startYear ?? "?"} - {edu.endYear ?? "?"}
                      </p>
                    )}
                  </div>
                  <form action={deleteEducation}>
                    <input type="hidden" name="id" value={edu.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Education</h2>
            <form action={addEducation} className="flex flex-wrap gap-2 text-xs">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="institution"
                placeholder="Institution"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="degree"
                placeholder="Degree"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="field"
                placeholder="Field"
                className="w-40 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="startYear"
                placeholder="Start"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="endYear"
                placeholder="End"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <p className="text-sm text-zinc-700">
            No education added yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.certs.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Certifications
            </h2>
            <form
              action={addCertification}
              className="flex flex-wrap gap-2 text-xs"
            >
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="name"
                placeholder="Name"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="issuer"
                placeholder="Issuer"
                className="w-36 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="issuedYear"
                placeholder="Year"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="credentialUrl"
                placeholder="Credential URL"
                className="w-48 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.certs.map((cert) => (
              <div
                key={cert.id}
                className="border-b border-zinc-100 pb-2 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900">{cert.name}</p>
                    <p className="text-xs text-zinc-600">
                      {cert.issuer ?? "Issuer not set"}
                      {cert.issuedYear ? ` - ${cert.issuedYear}` : ""}
                    </p>
                  </div>
                  <form action={deleteCertification}>
                    <input type="hidden" name="id" value={cert.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Certifications
            </h2>
            <form
              action={addCertification}
              className="flex flex-wrap gap-2 text-xs"
            >
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                name="name"
                placeholder="Name"
                className="w-44 rounded border border-zinc-200 px-2 py-1"
                required
              />
              <input
                name="issuer"
                placeholder="Issuer"
                className="w-36 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="issuedYear"
                placeholder="Year"
                className="w-20 rounded border border-zinc-200 px-2 py-1"
              />
              <input
                name="credentialUrl"
                placeholder="Credential URL"
                className="w-48 rounded border border-zinc-200 px-2 py-1"
              />
              <button
                type="submit"
                className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
              >
                Add
              </button>
            </form>
          </div>
          <p className="text-sm text-zinc-700">
            No certifications yet. Use the form above to add one.
          </p>
        </section>
      )}

      <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Skills</h2>
          <form action={addSkill} className="flex flex-wrap gap-2 text-xs">
            <input type="hidden" name="profileId" value={profile.id} />
            <input
              name="name"
              placeholder="Skill"
              className="w-40 rounded border border-zinc-200 px-2 py-1"
              required
            />
            <input
              name="category"
              placeholder="Category"
              className="w-40 rounded border border-zinc-200 px-2 py-1"
            />
            <button
              type="submit"
              className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-white"
            >
              Add
            </button>
          </form>
        </div>
        {skills.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
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
                <form action={deleteSkill}>
                  <input type="hidden" name="profileId" value={profile.id} />
                  <input type="hidden" name="skillId" value={skill.id} />
                  <button
                    type="submit"
                    className="text-[11px] font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-700">
            No skills added yet. Use the form above to add one.
          </p>
        )}
      </section>
    </div>
  );
}

