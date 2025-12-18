"use client";

import { useAbout } from "./useAbout";
import type { Profile } from "../../types/profile";
import { PenIcon } from "../../icons/pen";
import { TrashIcon } from "../../icons/trash";
import { styles } from "./style-constants";
import { Modal } from "@/components/Modal";
import {
  AddCertificationModal,
  AddEducationModal,
  AddExperienceModal,
  AddProjectModal,
  AddSkillModal,
  dangerButton,
} from "@/components/AboutAddModals";
import {
  deleteExperience,
  deleteProject,
  deleteEducation,
  deleteCertification,
  deleteSkill,
  updateProfileDetails,
  updateExperience,
  updateProject,
  updateEducation,
  updateCertification,
  updateSkill,
} from "@/app/actions/profile";

type Props = {
  profile: Profile;
};

function skillChipClass(isDragging: boolean) {
  return isDragging
    ? `${styles.skillChipBase} ${styles.skillChipDragging}`
    : styles.skillChipBase;
}

export function AboutLayout({ profile }: Props) {
  const {
    isPending,
    startTransition,
    editOpen,
    setEditOpen,
    editingExp,
    setEditingExp,
    editingProject,
    setEditingProject,
    editingEdu,
    setEditingEdu,
    editingCert,
    setEditingCert,
    editingSkill,
    setEditingSkill,
    openCategories,
    setOpenCategories,
    categories,
    categoryBusy,
    editCategoryMode,
    setEditCategoryMode,
    editCategoryValue,
    setEditCategoryValue,
    editCategoryOther,
    setEditCategoryOther,
    editingCategoryId,
    editingCategoryName,
    setEditingCategoryName,
    skills,
    groupedSkills,
    sortedCategories,
    loadCategories,
    handleDeleteCategory,
    startEditCategory,
    saveCategoryEdit,
    cancelCategoryEdit,
    draggingSkill,
    handleSkillDragStart,
    handleSkillDragEnd,
    handleSkillDrop,
  } = useAbout(profile);

  return (
<div className={styles.pageRoot}>
      <section className={styles.aboutCard}>
        <div className={styles.headerRow}>
          <header className={styles.headerStack}>
            <p className={styles.eyebrow}>
              About Me
            </p>
            <h1 className={styles.pageTitle}>
              {profile.fullName}
            </h1>
            <p className={styles.bodyText}>
              {profile.title ?? profile.headline ?? "Role not set"}
            </p>
            <div className={styles.pillRow}>
              {profile.location && (
                <span className={styles.pill}>
                  {profile.location}
                </span>
              )}
              {profile.email && (
                <span className={styles.pill}>
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className={styles.pill}>
                  {profile.phone}
                </span>
              )}
              {profile.linkedinUrl && (
                <a
                  className={styles.linkPill}
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a
                  className={styles.linkPill}
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}
            </div>
            {profile.summary && (
              <p className={styles.bodyText}>{profile.summary}</p>
            )}
          </header>
          <button
            onClick={() => setEditOpen(true)}
            className={styles.iconOnlyWithMargin}
            aria-label="Edit profile"
          >
            <PenIcon className={styles.iconSm} />
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
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              await updateProfileDetails(formData);
              setEditOpen(false);
            });
          }}
        >
          <label className={styles.formField}>
            <span className={styles.labelText}>Full name</span>
            <input
              name="fullName"
              defaultValue={profile.fullName}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Title</span>
            <input
              name="title"
              defaultValue={profile.title ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Email</span>
            <input
              name="email"
              defaultValue={profile.email ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Phone</span>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Summary</span>
            <textarea
              name="summary"
              rows={4}
              defaultValue={profile.summary ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Location</span>
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Headline</span>
            <input
              name="headline"
              defaultValue={profile.headline ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>LinkedIn</span>
            <input
              name="linkedinUrl"
              defaultValue={profile.linkedinUrl ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>GitHub</span>
            <input
              name="githubUrl"
              defaultValue={profile.githubUrl ?? ""}
              className={styles.input}
            />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Website</span>
            <input
              name="websiteUrl"
              defaultValue={profile.websiteUrl ?? ""}
              className={styles.input}
            />
          </label>
          <div className={styles.actionsRowPadded}>
            <button
              type="submit"
              disabled={isPending}
              className={styles.primaryButton}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" data-close-modal="true" className={styles.stackSm2}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {profile.experiences.length ? (
        <section className={styles.sectionCardMd}>
          <div className={styles.sectionHeaderSpaced}>
            <div className={styles.stackSm}>
              <h2 className={styles.sectionTitle}>Experience</h2>
            </div>
            <AddExperienceModal profileId={profile.id} />
          </div>
          <div className={styles.stackMd}>
            {profile.experiences.map((exp) => (
              <article
                key={exp.id}
                className={styles.itemCard}
              >
                <div className={styles.stackSmFlex}>
                  <p className={styles.sectionTitle}>
                    {exp.role}
                  </p>
                  <p className={styles.mutedText}>
                    {exp.company}
                    {exp.location ? ` â€” ${exp.location}` : ""}
                    {exp.period ? ` â€¢ ${exp.period}` : ""}
                  </p>
                  {exp.impact && exp.impact.split("\n").filter(Boolean).length > 0 && (
                    <ul className={styles.bulletList}>
                      {exp.impact
                        .split("\n")
                        .filter(Boolean)
                        .map((line: string, idx: number) => (
                          <li key={idx} className={styles.bulletRow}>
                            <span className={styles.bulletDot} />
                            <span>{line}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <div className={styles.actionsRow}>
                  <button
                    onClick={() => setEditingExp(exp)}
                    className={styles.editButton}
                    aria-label="Edit experience"
                  >
                    <PenIcon className={styles.iconSm} />
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
        <section className={styles.sectionCardMd}>
          <div className={styles.sectionHeaderSpaced}>
            <div className={styles.stackSm}>
              <h2 className={styles.sectionTitle}>Experience</h2>
              <p className={styles.mutedText}>Add your first role.</p>
            </div>
            <AddExperienceModal profileId={profile.id} />
          </div>
          <p className={styles.bodyText}>
            No experience added yet. Use the form above to add one.
          </p>
        </section>
      )}

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>Education</h2>
          </div>
          <AddEducationModal profileId={profile.id} />
        </div>
        {profile.educations.length ? (
          <div className={styles.sectionBody}>
            {profile.educations.map((edu) => (
              <div
                key={edu.id}
                className={styles.listRow}
              >
                <div className={styles.flex1}>
                  <p className={styles.strongText}>
                    {edu.institution}
                  </p>
                  <p className={styles.mutedText}>
                    {edu.degree}
                    {edu.field ? ` - ${edu.field}` : ""}
                  </p>
                  {(edu.startYear || edu.endYear) && (
                    <p className={styles.mutedText}>
                      {edu.startYear ?? "?"} - {edu.endYear ?? "?"}
                    </p>
                  )}
                </div>
                <div className={styles.actionsRow}>
                  <button
                    onClick={() => setEditingEdu(edu)}
                    className={styles.editButton}
                    aria-label="Edit education"
                  >
                    <PenIcon className={styles.iconSm} />
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
        ) : (
          <p className={styles.bodyText}>
            No education added yet. Use the form above to add one.
          </p>
        )}
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>
              Certifications
            </h2>
          </div>
          <AddCertificationModal profileId={profile.id} />
        </div>
        {profile.certs.length ? (
          <div className={styles.sectionBody}>
            {profile.certs.map((cert) => (
              <div
                key={cert.id}
                className={styles.listRow}
              >
                <div className={styles.flex1}>
                  <p className={styles.strongText}>{cert.name}</p>
                  <p className={styles.mutedText}>
                    {cert.issuer ?? "Issuer not set"}
                    {cert.issuedYear ? ` - ${cert.issuedYear}` : ""}
                  </p>
                </div>
                <div className={styles.actionsRow}>
                  <button
                    onClick={() => setEditingCert(cert)}
                    className={styles.editButton}
                    aria-label="Edit certification"
                  >
                    <PenIcon className={styles.iconSm} />
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
        ) : (
          <p className={styles.bodyText}>
            No certifications yet. Use the form above to add one.
          </p>
        )}
      </section>

      {profile.projects.length ? (
        <section className={styles.sectionCardMd}>
          <div className={styles.sectionHeaderSpaced}>
            <div className={styles.stackSm}>
              <h2 className={styles.sectionTitle}>Projects</h2>
            </div>
            <AddProjectModal profileId={profile.id} />
          </div>
          <div className={styles.stackMd}>
            {profile.projects.map((project) => (
              <article
                key={project.id}
                className={styles.itemCard}
              >
                <div className={styles.stackSmFlex}>
                  <p className={styles.sectionTitle}>
                    {project.title}
                  </p>
                  {project.description && (
                    <p className={styles.bodyText}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies?.length ? (
                    <div className={styles.tagWrap}>
                      {(project.technologies ?? []).map((tech: string) => (
                        <span
                          key={tech}
                          className={styles.pillSm}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {project.link ? (
                    <a
                      href={project.link}
                      className={styles.accentLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                </div>
                <div className={styles.actionsRow}>
                  <button
                    onClick={() => setEditingProject(project)}
                    className={styles.editButton}
                    aria-label="Edit project"
                  >
                    <PenIcon className={styles.iconSm} />
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
        <section className={styles.sectionCardMd}>
          <div className={styles.sectionHeaderSpaced}>
            <div className={styles.stackSm}>
              <h2 className={styles.sectionTitle}>Projects</h2>
              <p className={styles.mutedText}>Add your first project.</p>
            </div>
            <AddProjectModal profileId={profile.id} />
          </div>
          <p className={styles.bodyText}>
            No projects added yet. Use the form above to add one.
          </p>
        </section>
      )}

      <section className={styles.sectionCardMd}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <AddSkillModal profileId={profile.id} />
        </div>

        {skills.length ? (
          <div className={styles.stackMdPadded}>
            {sortedCategories.map((category) => (
              <div
                key={category}
                className={styles.categoryCard}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={() => handleSkillDrop(category)}
              >
                <div className={styles.skillsHeader}>
                  <div className={styles.categoryHeaderLeft}>
                    {(() => {
                      const cat = categories.find((c) => c.name === category);
                      const isEditing = cat && editingCategoryId === cat.id;
                      return (
                        <>
                          {isEditing ? (
                            <input
                              className={styles.categoryEditInput}
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
                              className={styles.categoryToggle}
                            >
                              <span>{category}</span>
                              <span className={styles.countBadge}>
                                {groupedSkills[category].length}
                              </span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className={styles.skillsHeaderActions}>
                    {(() => {
                      const cat = categories.find((c) => c.name === category);
                      if (!cat) return null;
                      return (
                        <>
                          <AddSkillModal
                            profileId={profile.id}
                            presetCategory={category}
                            triggerLabel="+skill"
                            triggerClassName={styles.addButton}
                          />
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className={styles.editButton}
                            aria-label={`Edit category ${cat.name}`}
                            disabled={categoryBusy}
                          >
                            <PenIcon className={styles.iconSm} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className={styles.skillRemove}
                            aria-label={`Delete category ${cat.name}`}
                            disabled={categoryBusy}
                          >
                            <TrashIcon className={styles.iconSm} />
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
                {(openCategories[category] ?? true) && (
                  <div className={styles.chipWrap}>
                    {groupedSkills[category].map((skill) => (
                      <div
                        key={skill.id}
                        className={skillChipClass(draggingSkill?.id === skill.id)}
                        draggable
                        onDragStart={() => handleSkillDragStart(skill)}
                        onDragEnd={handleSkillDragEnd}
                      >
                        <span className={styles.skillName}>{skill.name}</span>
                        <div className={styles.hoverReveal}>
                          <button
                            onClick={() => setEditingSkill(skill)}
                            className={styles.editButton}
                            aria-label="Edit skill"
                          >
                            <PenIcon className={styles.iconSm} />
                          </button>
                          <form action={deleteSkill}>
                            <input type="hidden" name="skillId" value={skill.id} />
                            <button
                              type="submit"
                              className={styles.skillRemove}
                              aria-label="Remove skill"
                            >
                              <TrashIcon className={styles.iconSm} />
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
          <p className={styles.bodyText}>
            No skills added yet. Use the form above to add one.
          </p>
        )}
      </section>

      {/* Edit Modals */}
      <Modal triggerLabel="" title="Edit Experience" open={!!editingExp} onClose={() => setEditingExp(null)}>
        {editingExp && (
          <form action={updateExperience} className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateExperience(fd); setEditingExp(null); }); }}>
            <input type="hidden" name="id" value={editingExp.id} />
            <label className={styles.formField}><span className={styles.labelText}>Role</span><input name="role" defaultValue={editingExp.role} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Company</span><input name="company" defaultValue={editingExp.company} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Location</span><input name="location" defaultValue={editingExp.location ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Period</span><input name="period" defaultValue={editingExp.period ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Impact</span><textarea name="impact" rows={3} defaultValue={editingExp.impact ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.stackSm2}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Project" open={!!editingProject} onClose={() => setEditingProject(null)}>
        {editingProject && (
          <form action={updateProject} className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateProject(fd); setEditingProject(null); }); }}>
            <input type="hidden" name="id" value={editingProject.id} />
            <label className={styles.formField}><span className={styles.labelText}>Title</span><input name="title" defaultValue={editingProject.title} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Description</span><textarea name="description" rows={3} defaultValue={editingProject.description ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Technologies</span><input name="technologies" defaultValue={editingProject.technologies?.join(", ") ?? ""} placeholder="React, Node.js, etc." className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Link</span><input name="link" type="url" defaultValue={editingProject.link ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.stackSm2}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Education" open={!!editingEdu} onClose={() => setEditingEdu(null)}>
        {editingEdu && (
          <form action={updateEducation} className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateEducation(fd); setEditingEdu(null); }); }}>
            <input type="hidden" name="id" value={editingEdu.id} />
            <label className={styles.formField}><span className={styles.labelText}>Institution</span><input name="institution" defaultValue={editingEdu.institution} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Degree</span><input name="degree" defaultValue={editingEdu.degree ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Field</span><input name="field" defaultValue={editingEdu.field ?? ""} className={styles.input} /></label>
            <div className={styles.twoColGrid}><label className={styles.formField}><span className={styles.labelText}>Start Year</span><input name="startYear" type="number" defaultValue={editingEdu.startYear ?? ""} className={styles.input} /></label><label className={styles.formField}><span className={styles.labelText}>End Year</span><input name="endYear" type="number" defaultValue={editingEdu.endYear ?? ""} className={styles.input} /></label></div>
            <label className={styles.formField}><span className={styles.labelText}>Details</span><textarea name="details" rows={2} defaultValue={editingEdu.details ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.stackSm2}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Certification" open={!!editingCert} onClose={() => setEditingCert(null)}>
        {editingCert && (
          <form action={updateCertification} className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(async () => { await updateCertification(fd); setEditingCert(null); }); }}>
            <input type="hidden" name="id" value={editingCert.id} />
            <label className={styles.formField}><span className={styles.labelText}>Name</span><input name="name" defaultValue={editingCert.name} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Issuer</span><input name="issuer" defaultValue={editingCert.issuer ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Issued Year</span><input name="issuedYear" type="number" defaultValue={editingCert.issuedYear ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Credential URL</span><input name="credentialUrl" type="url" defaultValue={editingCert.credentialUrl ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.stackSm2}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Skill" open={!!editingSkill} onClose={() => setEditingSkill(null)}>
        {editingSkill && (
          <form
            className={styles.formContainer}
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
            <label className={styles.formField}>
              <span className={styles.labelText}>Skill Name</span>
              <input
                name="name"
                defaultValue={editingSkill.name}
                className={styles.input}
                required
              />
            </label>

            <div className={styles.formSection}>
              <span className={styles.labelText}>Category</span>
              <select
                className={styles.input}
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
                  className={styles.input}
                  value={editCategoryOther}
                  onChange={(e) => setEditCategoryOther(e.target.value)}
                />
              )}
            </div>

            <div className={styles.actionsRowPadded}>
              <button
                type="submit"
                disabled={isPending}
                className={styles.primaryButtonAlt}
              >
                {isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                data-close-modal="true"
                className={styles.secondaryButtonAlt}
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

