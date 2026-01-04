"use client";

import { useState } from "react";
import { useAbout } from "./useAbout";
import type { Profile } from "@/types/profile";
import { styles } from "./style-constants";
import { ProfileHeader } from "./components/ProfileHeader";
import { Modal } from "./Modal";
import { ExperienceSection } from "./components/ExperienceSection";
import { EducationSection } from "./components/EducationSection";
import { CertificationsSection } from "./components/CertificationsSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";
import { ProfileBackupSection } from "./components/ProfileBackupSection";
import { BulletTextarea } from "@/app/components/BulletTextarea";
import { normalizeBullets } from "@/lib/normalizeBullets";
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
  updateCertification,
  updateEducation,
  updateExperience,
  updateProfileDetails,
  updateProject,
  updateSkill,
} from "@/app/local/profile-store";

type Props = {
  profile: Profile;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  updateProfile: (updater: (current: Profile) => Profile, opts?: { flush?: boolean }) => void;
};

type EditProfileModalProps = {
  profile: Profile;
  isPending: boolean;
  open: boolean;
  onClose: () => void;
  onAfterSave: () => void;
  startTransition: (cb: () => void) => void;
  onSave: (updates: Partial<Profile>) => void;
};

function EditProfileModal({
  profile,
  isPending,
  open,
  onClose,
  onAfterSave,
  startTransition,
  onSave,
}: EditProfileModalProps) {
  return (
    <Modal triggerLabel="" title="Edit Profile" open={open} onClose={onClose}>
      <form
        className={styles.formContainer}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const fullName = String(formData.get("fullName") ?? "").trim();
          if (!fullName) return;

          onSave({
            fullName,
            summary: String(formData.get("summary") ?? "").trim() || null,
            title: String(formData.get("title") ?? "").trim() || null,
            email: String(formData.get("email") ?? "").trim() || null,
            phone: String(formData.get("phone") ?? "").trim() || null,
            location: String(formData.get("location") ?? "").trim() || null,
            githubUrl: String(formData.get("githubUrl") ?? "").trim() || null,
            linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim() || null,
            websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || null,
          });

          startTransition(onAfterSave);
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
            placeholder="Job title / position (e.g., Software Engineer)"
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Email</span>
          <input name="email" defaultValue={profile.email ?? ""} className={styles.input} />
        </label>
        <label className={styles.formField}>
          <span className={styles.labelText}>Phone</span>
          <input name="phone" defaultValue={profile.phone ?? ""} className={styles.input} />
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
          <button type="submit" disabled={isPending} className={styles.primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AboutLayout({ profile, isPending, startTransition, updateProfile }: Props) {
  const {
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
    handleDeleteCategory,
    startEditCategory,
    saveCategoryEdit,
    cancelCategoryEdit,
    draggingSkill,
    handleSkillDragStart,
    handleSkillDragEnd,
    handleSkillDrop,
  } = useAbout(profile, { isPending, startTransition }, (updater) => updateProfile(updater));

  const [editingExpBullets, setEditingExpBullets] = useState<string[]>([]);

  return (
    <div className={styles.pageRoot}>
      <ProfileBackupSection
        profile={profile}
        onReplaceProfile={(next) => updateProfile(() => next, { flush: true })}
      />
      <ProfileHeader profile={profile} onEdit={() => setEditOpen(true)} />
      <EditProfileModal
        profile={profile}
        isPending={isPending}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onAfterSave={() => setEditOpen(false)}
        startTransition={startTransition}
        onSave={(updates) =>
          updateProfile((current) => updateProfileDetails(current, updates), { flush: true })
        }
      />

      <ExperienceSection
        profileId={profile.id}
        experiences={profile.experiences}
        onEdit={(exp) => {
          setEditingExpBullets(exp.impactBullets ?? []);
          setEditingExp(exp);
        }}
        onAdd={(input) => updateProfile((current) => addExperience(current, input), { flush: true })}
        onDelete={(id) => updateProfile((current) => deleteExperience(current, id), { flush: true })}
      />

      <EducationSection
        profileId={profile.id}
        educations={profile.educations}
        onEdit={setEditingEdu}
        onAdd={(input) => updateProfile((current) => addEducation(current, input), { flush: true })}
        onDelete={(id) => updateProfile((current) => deleteEducation(current, id), { flush: true })}
      />

      <CertificationsSection
        profileId={profile.id}
        certs={profile.certs}
        onEdit={setEditingCert}
        onAdd={(input) => updateProfile((current) => addCertification(current, input), { flush: true })}
        onDelete={(id) => updateProfile((current) => deleteCertification(current, id), { flush: true })}
      />

      <ProjectsSection
        profileId={profile.id}
        projects={profile.projects}
        onEdit={setEditingProject}
        onAdd={(input) => updateProfile((current) => addProject(current, input), { flush: true })}
        onDelete={(id) => updateProfile((current) => deleteProject(current, id), { flush: true })}
      />

      <SkillsSection
        profileId={profile.id}
        skills={skills}
        categories={categories}
        groupedSkills={groupedSkills}
        sortedCategories={sortedCategories}
        openCategories={openCategories}
        setOpenCategories={setOpenCategories}
        categoryBusy={categoryBusy}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        setEditingCategoryName={setEditingCategoryName}
        startEditCategory={startEditCategory}
        saveCategoryEdit={saveCategoryEdit}
        cancelCategoryEdit={cancelCategoryEdit}
        handleDeleteCategory={handleDeleteCategory}
        draggingSkill={draggingSkill}
        handleSkillDragStart={handleSkillDragStart}
        handleSkillDragEnd={handleSkillDragEnd}
        handleSkillDrop={handleSkillDrop}
        onEditSkill={setEditingSkill}
        onAddSkill={(name, categoryName) =>
          updateProfile((current) => addSkill(current, { name, categoryName }), { flush: true })
        }
        onDeleteSkill={(id) =>
          updateProfile((current) => deleteSkill(current, id), { flush: true })
        }
        onUpdateSkill={(id, name, categoryName) =>
          updateProfile((current) => updateSkill(current, id, { name, categoryName }), {
            flush: true,
          })
        }
      />

      {/* Edit Modals */}
      <Modal
        triggerLabel=""
        title="Edit Experience"
        open={!!editingExp}
        onClose={() => {
          setEditingExp(null);
          setEditingExpBullets([]);
        }}
      >
        {editingExp && (
          <form
            className={styles.formContainer}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = Number(fd.get("id"));
              const role = String(fd.get("role") ?? "").trim();
              const company = String(fd.get("company") ?? "").trim();
              const location = String(fd.get("location") ?? "").trim() || null;
              const period = String(fd.get("period") ?? "").trim() || null;
              const impactBullets = normalizeBullets(editingExpBullets);
              if (!id || !role || !company) return;
              startTransition(() => {
                updateProfile(
                  (current) =>
                    updateExperience(current, id, { role, company, location, period, impactBullets }),
                  { flush: true },
                );
                setEditingExp(null);
              });
            }}
          >
            <input type="hidden" name="id" value={editingExp.id} />
            <label className={styles.formField}><span className={styles.labelText}>Role</span><input name="role" defaultValue={editingExp.role} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Company</span><input name="company" defaultValue={editingExp.company} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Location</span><input name="location" defaultValue={editingExp.location ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Period</span><input name="period" defaultValue={editingExp.period ?? ""} className={styles.input} /></label>
            <BulletTextarea
              label="Impact"
              bullets={editingExpBullets}
              onChange={setEditingExpBullets}
              className={styles.input}
              rows={5}
              placeholder="• Impact bullet"
            />
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.cancelButton}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Project" open={!!editingProject} onClose={() => setEditingProject(null)}>
        {editingProject && (
          <form
            className={styles.formContainer}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = Number(fd.get("id"));
              const title = String(fd.get("title") ?? "").trim();
              const description = String(fd.get("description") ?? "").trim() || null;
              const technologies = String(fd.get("technologies") ?? "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              const link = String(fd.get("link") ?? "").trim() || null;
              if (!id || !title) return;
              startTransition(() => {
                updateProfile((current) => updateProject(current, id, { title, description, technologies, link }), { flush: true });
                setEditingProject(null);
              });
            }}
          >
            <input type="hidden" name="id" value={editingProject.id} />
            <label className={styles.formField}><span className={styles.labelText}>Title</span><input name="title" defaultValue={editingProject.title} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Description</span><textarea name="description" rows={3} defaultValue={editingProject.description ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Technologies</span><input name="technologies" defaultValue={editingProject.technologies?.join(", ") ?? ""} placeholder="React, Node.js, etc." className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Link</span><input name="link" type="url" defaultValue={editingProject.link ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.cancelButton}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Education" open={!!editingEdu} onClose={() => setEditingEdu(null)}>
        {editingEdu && (
          <form
            className={styles.formContainer}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = Number(fd.get("id"));
              const institution = String(fd.get("institution") ?? "").trim();
              const degree = String(fd.get("degree") ?? "").trim() || null;
              const field = String(fd.get("field") ?? "").trim() || null;
              const startYearRaw = String(fd.get("startYear") ?? "").trim();
              const endYearRaw = String(fd.get("endYear") ?? "").trim();
              const startYear = startYearRaw ? Number(startYearRaw) : null;
              const endYear = endYearRaw ? Number(endYearRaw) : null;
              const details = String(fd.get("details") ?? "").trim() || null;
              if (!id || !institution) return;
              startTransition(() => {
                updateProfile((current) => updateEducation(current, id, {
                  institution,
                  degree,
                  field,
                  startYear: Number.isFinite(startYear as number) ? startYear : null,
                  endYear: Number.isFinite(endYear as number) ? endYear : null,
                  details,
                }), { flush: true });
                setEditingEdu(null);
              });
            }}
          >
            <input type="hidden" name="id" value={editingEdu.id} />
            <label className={styles.formField}><span className={styles.labelText}>Institution</span><input name="institution" defaultValue={editingEdu.institution} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Degree</span><input name="degree" defaultValue={editingEdu.degree ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Field</span><input name="field" defaultValue={editingEdu.field ?? ""} className={styles.input} /></label>
            <div className={styles.twoColGrid}><label className={styles.formField}><span className={styles.labelText}>Start Year</span><input name="startYear" type="number" defaultValue={editingEdu.startYear ?? ""} className={styles.input} /></label><label className={styles.formField}><span className={styles.labelText}>End Year</span><input name="endYear" type="number" defaultValue={editingEdu.endYear ?? ""} className={styles.input} /></label></div>
            <label className={styles.formField}><span className={styles.labelText}>Details</span><textarea name="details" rows={2} defaultValue={editingEdu.details ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.cancelButton}>Cancel</button></div>
          </form>
        )}
      </Modal>

      <Modal triggerLabel="" title="Edit Certification" open={!!editingCert} onClose={() => setEditingCert(null)}>
        {editingCert && (
          <form
            className={styles.formContainer}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = Number(fd.get("id"));
              const name = String(fd.get("name") ?? "").trim();
              const issuer = String(fd.get("issuer") ?? "").trim() || null;
              const issuedYearRaw = String(fd.get("issuedYear") ?? "").trim();
              const issuedYear = issuedYearRaw ? Number(issuedYearRaw) : null;
              const credentialUrl = String(fd.get("credentialUrl") ?? "").trim() || null;
              if (!id || !name) return;
              startTransition(() => {
                updateProfile((current) => updateCertification(current, id, {
                  name,
                  issuer,
                  issuedYear: Number.isFinite(issuedYear as number) ? issuedYear : null,
                  credentialUrl,
                }), { flush: true });
                setEditingCert(null);
              });
            }}
          >
            <input type="hidden" name="id" value={editingCert.id} />
            <label className={styles.formField}><span className={styles.labelText}>Name</span><input name="name" defaultValue={editingCert.name} className={styles.input} required /></label>
            <label className={styles.formField}><span className={styles.labelText}>Issuer</span><input name="issuer" defaultValue={editingCert.issuer ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Issued Year</span><input name="issuedYear" type="number" defaultValue={editingCert.issuedYear ?? ""} className={styles.input} /></label>
            <label className={styles.formField}><span className={styles.labelText}>Credential URL</span><input name="credentialUrl" type="url" defaultValue={editingCert.credentialUrl ?? ""} className={styles.input} /></label>
            <div className={styles.actionsRowPadded}><button type="submit" disabled={isPending} className={styles.primaryButton}>{isPending ? "Saving..." : "Save"}</button><button type="button" data-close-modal="true" className={styles.cancelButton}>Cancel</button></div>
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
              const skillId = Number(fd.get("skillId"));
              const name = String(fd.get("name") ?? "").trim();
              const categoryName = String(fd.get("category") ?? "").trim();
              if (!skillId || !name || !categoryName) return;
              startTransition(() => {
                updateProfile(
                  (current) => updateSkill(current, skillId, { name, categoryName }),
                  { flush: true },
                );
                setEditingSkill(null);
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
              {editCategoryMode === "existing" ? (
                <select
                  name="category"
                  required
                  className={styles.input}
                  value={editCategoryValue}
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
              ) : (
                <select
                  className={styles.input}
                  value="__NEW__"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__NEW__") return;
                    setEditCategoryMode("existing");
                    setEditCategoryValue(val);
                    setEditCategoryOther("");
                  }}
                >
                  <option value="__NEW__">+ New category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              {editCategoryMode === "new" ? (
                <input
                  name="category"
                  required
                  placeholder="New category name"
                  className={styles.input}
                  value={editCategoryOther}
                  onChange={(e) => setEditCategoryOther(e.target.value)}
                />
              ) : null}
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

