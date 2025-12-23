"use client";

import { useAbout } from "./useAbout";
import type { Profile } from "./types";
import { styles } from "./style-constants";
import { EditProfileModal } from "./components/EditProfileModal";
import { ProfileHeader } from "./components/ProfileHeader";
import { Modal } from "./modals/Modal";
import {
  updateExperience,
  updateProject,
  updateEducation,
  updateCertification,
  updateSkill,
} from "@/app/actions/profile";
import { ExperienceSection } from "./components/ExperienceSection";
import { EducationSection } from "./components/EducationSection";
import { CertificationsSection } from "./components/CertificationsSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { SkillsSection } from "./components/SkillsSection";

type Props = {
  profile: Profile;
};

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
      <ProfileHeader profile={profile} onEdit={() => setEditOpen(true)} />
      <EditProfileModal
        profile={profile}
        isPending={isPending}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onAfterSave={() => setEditOpen(false)}
        startTransition={startTransition}
      />

      <ExperienceSection
        profileId={profile.id}
        experiences={profile.experiences}
        onEdit={setEditingExp}
      />

      <EducationSection
        profileId={profile.id}
        educations={profile.educations}
        onEdit={setEditingEdu}
      />

      <CertificationsSection
        profileId={profile.id}
        certs={profile.certs}
        onEdit={setEditingCert}
      />

      <ProjectsSection
        profileId={profile.id}
        projects={profile.projects}
        onEdit={setEditingProject}
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
      />

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

