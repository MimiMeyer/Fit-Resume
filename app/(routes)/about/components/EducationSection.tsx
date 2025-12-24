"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Education } from "@/types/education";
import { Modal } from "../Modal";
import { addEducation, deleteEducation } from "@/app/actions/education-actions";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  educations: Education[];
  onEdit: (edu: Education) => void;
};

function AddEducationModal({ profileId }: { profileId: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.primaryButton} onClick={() => setOpen(true)}>
        Add
      </button>
      <Modal triggerLabel="" open={open} onClose={() => setOpen(false)} title="Add education">
        <form
          action={addEducation}
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              await addEducation(formData);
              setOpen(false);
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <label className={styles.formField}>
            <span className={styles.labelText}>Institution</span>
            <input name="institution" className={styles.input} required />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Degree</span>
            <input name="degree" className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Field</span>
            <input name="field" className={styles.input} />
          </label>
          <div className={styles.twoColGrid}>
            <label className={styles.formField}>
              <span className={styles.labelText}>Start Year</span>
              <input name="startYear" type="number" className={styles.input} />
            </label>
            <label className={styles.formField}>
              <span className={styles.labelText}>End Year</span>
              <input name="endYear" type="number" className={styles.input} />
            </label>
          </div>
          <label className={styles.formField}>
            <span className={styles.labelText}>Details</span>
            <textarea name="details" rows={2} className={styles.input} />
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
    </>
  );
}

export function EducationSection({ profileId, educations, onEdit }: Props) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.stackSm}>
          <h2 className={styles.sectionTitle}>Education</h2>
        </div>
        <AddEducationModal profileId={profileId} />
      </div>
      {educations.length ? (
        <div className={styles.sectionBody}>
          {educations.map((edu) => (
            <div key={edu.id} className={styles.listRow}>
              <div className={styles.flex1}>
                <p className={styles.strongText}>{edu.institution}</p>
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
                  onClick={() => onEdit(edu)}
                  className={styles.editButton}
                  aria-label="Edit education"
                >
                  <PenIcon className={styles.iconSm} />
                </button>
                <form action={deleteEducation}>
                  <input type="hidden" name="id" value={edu.id} />
                  <button type="submit" className={dangerButton}>
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
  );
}
