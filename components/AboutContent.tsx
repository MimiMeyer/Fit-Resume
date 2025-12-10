"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteExperience, deleteProject, deleteEducation, deleteCertification, deleteSkill, updateProfileDetails, updateExperience, updateProject, updateEducation, updateCertification, updateSkill } from "@/app/actions/profile";
import { Modal } from "@/components/Modal";
import {
  AddCertificationModal,
  AddEducationModal,
  AddExperienceModal,
  AddProjectModal,
  AddSkillModal,
  dangerButton,
  primaryButton,
} from "@/components/AboutAddModals";

type Profile = {
  id: number;
  fullName: string;
  headline?: string | null;
  summary?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  experiences: any[];
  projects: any[];
  educations: any[];
  certs: any[];
  skills: any[];
};

type Props = {
  profile: Profile;
};

export function AboutContent({ profile }: Props) {
  const router = useRouter();
  const addButtonClass =
    "inline-flex h-8 px-3 items-center justify-center gap-1 rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700";
  const editButtonClass =
    "inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700";
  const iconOnlyClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700";
  const skillRemoveClass =
    "inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-500 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700";
  const PenIcon = () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-zinc-900"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 16.75 16.75 4a1.8 1.8 0 0 1 2.55 0l0.7 0.7a1.8 1.8 0 0 1 0 2.55L7.25 20H4z" />
      <path d="M15.5 5.5 18.5 8.5" />
      <path d="M4 20h3.25L4 16.75Z" fill="currentColor" stroke="none" />
    </svg>
  );
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingEdu, setEditingEdu] = useState<any>(null);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Array<{ id: number; name: string; count: number }>>([]);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [editCategoryMode, setEditCategoryMode] = useState<"existing" | "new">("existing");
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editCategoryOther, setEditCategoryOther] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [draggingSkill, setDraggingSkill] = useState<any>(null);
  
  const [skills, setSkills] = useState(
    [...(profile.skills || [])].sort((a: any, b: any) => a.name.localeCompare(b.name))
  );

  // Group skills by category
  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    const category = skill.category?.name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedSkills).sort();

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleProfileRefresh = () => {
      loadCategories();
      router.refresh();
    };
    window.addEventListener("profile-refresh", handleProfileRefresh);
    return () => window.removeEventListener("profile-refresh", handleProfileRefresh);
  }, [router]);

  useEffect(() => {
    if (editingSkill) {
      const existing = editingSkill.category?.name ?? "";
      setEditCategoryMode(existing ? "existing" : "new");
      setEditCategoryValue(existing);
      setEditCategoryOther("");
    } else {
      setEditCategoryMode("existing");
      setEditCategoryValue("");
      setEditCategoryOther("");
    }
  }, [editingSkill]);

  useEffect(() => {
    setSkills(
      [...(profile.skills || [])].sort((a: any, b: any) => a.name.localeCompare(b.name))
    );
  }, [profile.skills]);

  const handleDeleteCategory = async (cat: { id: number; name: string }) => {
    setCategoryBusy(true);
    try {
      const toRemove = cat.name.toUpperCase();
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id }),
      });
      if (res.ok) {
        // Optimistically drop the category and its skills locally
        if (toRemove) {
          setSkills((prev) =>
            prev.filter(
              (skill) =>
                (skill.category?.name ?? "Uncategorized").toUpperCase() !== toRemove
            )
          );
        }
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setOpenCategories((prev) => {
          const next = { ...prev };
          delete next[toRemove];
          return next;
        });
        await loadCategories();
        router.refresh();
        window.dispatchEvent(new Event("categories-refresh"));
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    } finally {
      setCategoryBusy(false);
    }
  };

  const startEditCategory = (category: { id: number; name: string }) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const saveCategoryEdit = async () => {
    const nextName = editingCategoryName.trim();
    if (!editingCategoryId || !nextName) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
      return;
    }
    setCategoryBusy(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategoryId, name: nextName }),
      });
      if (res.ok) {
        await loadCategories();
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to edit category", err);
    } finally {
      setCategoryBusy(false);
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleSkillDragStart = (skill: any) => {
    setDraggingSkill(skill);
  };

  const handleSkillDragEnd = () => {
    setDraggingSkill(null);
  };

  const handleSkillDrop = (targetCategory: string) => {
    if (!draggingSkill) return;
    const currentCategory = draggingSkill.category?.name || "Uncategorized";
    if (currentCategory === targetCategory) {
      setDraggingSkill(null);
      return;
    }
    const fd = new FormData();
    fd.set("skillId", String(draggingSkill.id));
    fd.set("name", draggingSkill.name);
    fd.set("category", targetCategory);
    startTransition(async () => {
      await updateSkill(fd);
      setDraggingSkill(null);
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <div className="flex items-start justify-between">
          <header className="flex flex-col gap-2 flex-1">
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
          <button
            onClick={() => setEditOpen(true)}
            className={`${iconOnlyClass} ml-4`}
            aria-label="Edit profile"
          >
            <PenIcon />
          </button>
        </div>
      </section>

      <Modal
        triggerLabel=""
        title="Edit Profile"
        open={editOpen}
        onClose={() => setEditOpen(false)}
      >
        <form
          action={updateProfileDetails}
          className="space-y-4 text-sm text-zinc-800"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              await updateProfileDetails(formData);
              setEditOpen(false);
            });
          }}
        >
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Full name</span>
            <input
              name="fullName"
              defaultValue={profile.fullName}
              className="w-full rounded border border-zinc-200 px-3 py-2"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Title</span>
            <input
              name="title"
              defaultValue={profile.title ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Email</span>
            <input
              name="email"
              defaultValue={profile.email ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Phone</span>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Summary</span>
            <textarea
              name="summary"
              rows={4}
              defaultValue={profile.summary ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Location</span>
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Headline</span>
            <input
              name="headline"
              defaultValue={profile.headline ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">LinkedIn</span>
            <input
              name="linkedinUrl"
              defaultValue={profile.linkedinUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">GitHub</span>
            <input
              name="githubUrl"
              defaultValue={profile.githubUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 block">
            <span className="block text-xs font-semibold text-zinc-700">Website</span>
            <input
              name="websiteUrl"
              defaultValue={profile.websiteUrl ?? ""}
              className="w-full rounded border border-zinc-200 px-3 py-2"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" data-close-modal="true" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {profile.experiences.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
              <p className="text-xs text-zinc-600">
                Add new roles; remove anything that's out of date.
              </p>
            </div>
            <AddExperienceModal profileId={profile.id} />
          </div>
          <div className="space-y-3">
            {profile.experiences.map((exp: any) => (
              <article
                key={exp.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1 flex-1">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingExp(exp)}
                    className={editButtonClass}
                    aria-label="Edit experience"
                  >
                    <PenIcon />
                  </button>
                  <form action={deleteExperience}>
                    <input type="hidden" name="id" value={exp.id} />
                    <button
                      type="submit"
                      className={dangerButton}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.experiences.length ? null : (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Experience</h2>
              <p className="text-xs text-zinc-600">Add your first role.</p>
            </div>
            <AddExperienceModal profileId={profile.id} />
          </div>
          <p className="text-sm text-zinc-700">
            No experience added yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.educations.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Education</h2>
              <p className="text-xs text-zinc-600">Add schools, degrees, or bootcamps.</p>
            </div>
            <AddEducationModal profileId={profile.id} />
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.educations.map((edu: any) => (
              <div
                key={edu.id}
                className="border-b border-zinc-100 pb-2 last:border-0 flex items-start justify-between gap-3"
              >
                <div className="flex-1">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEdu(edu)}
                    className={editButtonClass}
                    aria-label="Edit education"
                  >
                    <PenIcon />
                  </button>
                  <form action={deleteEducation}>
                    <input type="hidden" name="id" value={edu.id} />
                    <button
                      type="submit"
                      className={dangerButton}
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
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Education</h2>
              <p className="text-xs text-zinc-600">Add schools, degrees, or bootcamps.</p>
            </div>
            <AddEducationModal profileId={profile.id} />
          </div>
          <p className="text-sm text-zinc-700">
            No education added yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.certs.length ? (
        <section className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">
                Certifications
              </h2>
              <p className="text-xs text-zinc-600">Add licenses or badges.</p>
            </div>
            <AddCertificationModal profileId={profile.id} />
          </div>
          <div className="space-y-2 text-sm text-zinc-700">
            {profile.certs.map((cert: any) => (
              <div
                key={cert.id}
                className="border-b border-zinc-100 pb-2 last:border-0 flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">{cert.name}</p>
                  <p className="text-xs text-zinc-600">
                    {cert.issuer ?? "Issuer not set"}
                    {cert.issuedYear ? ` - ${cert.issuedYear}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCert(cert)}
                    className={editButtonClass}
                    aria-label="Edit certification"
                  >
                    <PenIcon />
                  </button>
                  <form action={deleteCertification}>
                    <input type="hidden" name="id" value={cert.id} />
                    <button
                      type="submit"
                      className={dangerButton}
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
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">
                Certifications
              </h2>
              <p className="text-xs text-zinc-600">Add licenses or badges.</p>
            </div>
            <AddCertificationModal profileId={profile.id} />
          </div>
          <p className="text-sm text-zinc-700">
            No certifications yet. Use the form above to add one.
          </p>
        </section>
      )}

      {profile.projects.length ? (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
              <p className="text-xs text-zinc-600">
                Keep personal and work highlights up to date.
              </p>
            </div>
            <AddProjectModal profileId={profile.id} />
          </div>
          <div className="space-y-3">
            {profile.projects.map((project: any) => (
              <article
                key={project.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1 flex-1">
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
                      {project.technologies.map((tech: string) => (
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className={editButtonClass}
                    aria-label="Edit project"
                  >
                    <PenIcon />
                  </button>
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <button
                      type="submit"
                      className={dangerButton}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Projects</h2>
              <p className="text-xs text-zinc-600">Add your first project.</p>
            </div>
            <AddProjectModal profileId={profile.id} />
          </div>
          <p className="text-sm text-zinc-700">
            No projects added yet. Use the form above to add one.
          </p>
        </section>
      )}

      <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Skills</h2>
          <AddSkillModal profileId={profile.id} />
        </div>

        {skills.length ? (
          <div className="space-y-4 pt-1">
            {sortedCategories.map((category) => (
              <div
                key={category}
                className="rounded-xl border border-indigo-100 bg-gradient-to-r from-white via-[#f3f1ff] to-white shadow-sm"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={() => handleSkillDrop(category)}
              >
                <div className="mb-2 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 px-4 pt-3">
                    {(() => {
                      const cat = categories.find((c) => c.name === category);
                      const isEditing = cat && editingCategoryId === cat.id;
                      return (
                        <>
                          {isEditing ? (
                            <input
                              className="w-48 rounded border border-indigo-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onBlur={saveCategoryEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveCategoryEdit();
                                } else if (e.key === "Escape") {
                                  cancelCategoryEdit();
                                }
                              }}
                              autoFocus
                              disabled={categoryBusy}
                            />
                          ) : (
                            <button
                              onClick={() =>
                                setOpenCategories((prev) => ({
                                  ...prev,
                                  [category]: !(prev[category] ?? true),
                                }))
                              }
                              className="flex items-center gap-2 font-semibold text-zinc-900 transition hover:text-indigo-800"
                            >
                              <span>{category}</span>
                              <span className="text-xs bg-indigo-100 text-indigo-900 rounded-full px-2 py-0.5">
                                {groupedSkills[category].length}
                              </span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {(() => {
                      const cat = categories.find((c) => c.name === category);
                      if (!cat) return null;
                      return (
                        <>
                          <AddSkillModal
                            profileId={profile.id}
                            presetCategory={category}
                            triggerLabel="+skill"
                            triggerClassName={addButtonClass}
                          />
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className={editButtonClass}
                            aria-label={`Edit category ${cat.name}`}
                            disabled={categoryBusy}
                          >
                            <PenIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className={skillRemoveClass}
                            aria-label={`Delete category ${cat.name}`}
                            disabled={categoryBusy}
                          >
                            ×
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
                {(openCategories[category] ?? true) && (
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {groupedSkills[category].map((skill: any) => (
                      <div
                        key={skill.id}
                        className={`group inline-flex items-center justify-between rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs gap-1 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-150 hover:bg-indigo-50 focus-visible:bg-indigo-50 ${
                          draggingSkill?.id === skill.id ? "opacity-50" : ""
                        }`}
                        draggable
                        onDragStart={() => handleSkillDragStart(skill)}
                        onDragEnd={handleSkillDragEnd}
                      >
                        <span className="text-zinc-800 font-medium">{skill.name}</span>
                        <div className="flex gap-1 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px] group-focus-within:opacity-100 group-focus-within:max-w-[200px] transition-all duration-150 overflow-hidden">
                          <button
                            onClick={() => setEditingSkill(skill)}
                            className={editButtonClass}
                            aria-label="Edit skill"
                          >
                            <PenIcon />
                          </button>
                          <form action={deleteSkill}>
                            <input type="hidden" name="skillId" value={skill.id} />
                            <button
                              type="submit"
                              className={skillRemoveClass}
                              aria-label="Remove skill"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-700">
            No skills added yet. Use the form above to add one.
          </p>
        )}
      </section>

      {/* Edit Modals */}
      <Modal triggerLabel="" title="Edit Experience" open={!!editingExp} onClose={() => setEditingExp(null)}>
        {editingExp && (
          <form action={updateExperience} className="space-y-4 text-sm text-zinc-800" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateExperience(fd); setEditingExp(null); }); }}>
            <input type="hidden" name="id" value={editingExp.id} />
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Role</span><input name="role" defaultValue={editingExp.role} className="w-full rounded border border-zinc-200 px-3 py-2" required /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Company</span><input name="company" defaultValue={editingExp.company} className="w-full rounded border border-zinc-200 px-3 py-2" required /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Period</span><input name="period" defaultValue={editingExp.period ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Impact</span><textarea name="impact" rows={3} defaultValue={editingExp.impact ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <div className="flex gap-2 pt-2"><button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60">{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Project" open={!!editingProject} onClose={() => setEditingProject(null)}>
        {editingProject && (
          <form action={updateProject} className="space-y-4 text-sm text-zinc-800" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateProject(fd); setEditingProject(null); }); }}>
            <input type="hidden" name="id" value={editingProject.id} />
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Title</span><input name="title" defaultValue={editingProject.title} className="w-full rounded border border-zinc-200 px-3 py-2" required /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Description</span><textarea name="description" rows={3} defaultValue={editingProject.description ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Technologies</span><input name="technologies" defaultValue={editingProject.technologies?.join(", ") ?? ""} placeholder="React, Node.js, etc." className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Link</span><input name="link" type="url" defaultValue={editingProject.link ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <div className="flex gap-2 pt-2"><button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60">{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Education" open={!!editingEdu} onClose={() => setEditingEdu(null)}>
        {editingEdu && (
          <form action={updateEducation} className="space-y-4 text-sm text-zinc-800" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateEducation(fd); setEditingEdu(null); }); }}>
            <input type="hidden" name="id" value={editingEdu.id} />
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Institution</span><input name="institution" defaultValue={editingEdu.institution} className="w-full rounded border border-zinc-200 px-3 py-2" required /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Degree</span><input name="degree" defaultValue={editingEdu.degree ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Field</span><input name="field" defaultValue={editingEdu.field ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Start Year</span><input name="startYear" type="number" defaultValue={editingEdu.startYear ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label><label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">End Year</span><input name="endYear" type="number" defaultValue={editingEdu.endYear ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label></div>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Details</span><textarea name="details" rows={2} defaultValue={editingEdu.details ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <div className="flex gap-2 pt-2"><button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60">{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Certification" open={!!editingCert} onClose={() => setEditingCert(null)}>
        {editingCert && (
          <form action={updateCertification} className="space-y-4 text-sm text-zinc-800" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateCertification(fd); setEditingCert(null); }); }}>
            <input type="hidden" name="id" value={editingCert.id} />
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Name</span><input name="name" defaultValue={editingCert.name} className="w-full rounded border border-zinc-200 px-3 py-2" required /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Issuer</span><input name="issuer" defaultValue={editingCert.issuer ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Issued Year</span><input name="issuedYear" type="number" defaultValue={editingCert.issuedYear ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 block"><span className="block text-xs font-semibold text-zinc-700">Credential URL</span><input name="credentialUrl" type="url" defaultValue={editingCert.credentialUrl ?? ""} className="w-full rounded border border-zinc-200 px-3 py-2" /></label>
            <div className="flex gap-2 pt-2"><button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60">{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Skill" open={!!editingSkill} onClose={() => setEditingSkill(null)}>
        {editingSkill && (
          <form
            className="space-y-4 text-sm text-zinc-800"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const categoryName =
                editCategoryMode === "new"
                  ? editCategoryOther.trim()
                  : editCategoryValue.trim();
              if (!categoryName) {
                alert("Please select or add a category");
                return;
              }
              fd.set("category", categoryName);
              startTransition(async () => {
                await updateSkill(fd);
                setEditingSkill(null);
                await loadCategories();
              });
            }}
          >
            <input type="hidden" name="skillId" value={editingSkill.id} />
            <label className="space-y-1 block">
              <span className="block text-xs font-semibold text-zinc-700">Skill Name</span>
              <input
                name="name"
                defaultValue={editingSkill.name}
                className="w-full rounded border border-zinc-200 px-3 py-2"
                required
              />
            </label>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-zinc-700">Category</span>
              <select
                className="w-full rounded border border-zinc-200 px-3 py-2"
                value={editCategoryMode === "existing" ? editCategoryValue : "__NEW__"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__NEW__") {
                    setEditCategoryMode("new");
                    setEditCategoryValue("");
                    setEditCategoryOther("");
                  } else {
                    setEditCategoryMode("existing");
                    setEditCategoryValue(val);
                    setEditCategoryOther("");
                  }
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                <option value="__NEW__">+ New category</option>
              </select>
              {editCategoryMode === "new" && (
                <input
                  name="categoryOther"
                  placeholder="New category name"
                  className="w-full rounded border border-zinc-200 px-3 py-2"
                  value={editCategoryOther}
                  onChange={(e) => setEditCategoryOther(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                data-close-modal="true"
                className="rounded border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

