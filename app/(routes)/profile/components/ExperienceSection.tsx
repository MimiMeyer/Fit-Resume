"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Experience } from "@/types/experience";
import { Modal } from "../Modal";
import { addExperience, deleteExperience } from "@/app/actions/experience-actions";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  experiences: Experience[];
  onEdit: (exp: Experience) => void;
};

function AddExperienceModal({ profileId }: { profileId: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.primaryButton} onClick={() => setOpen(true)}>
        Add Role
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add experience"
        description="Share your role, company, and a quick highlight."
      >
        <form
          className={styles.formContainer}
          action={(formData) => {
            startTransition(async () => {
              await addExperience(formData);
              setOpen(false);
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <label className={styles.formField}>
            <span className={styles.labelText}>Role</span>
            <input name="role" className={styles.input} required />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Company</span>
            <input name="company" className={styles.input} required />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Location</span>
            <input name="location" className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Period</span>
            <input name="period" className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Impact</span>
            <textarea name="impact" rows={3} className={styles.input} />
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

export function ExperienceSection({ profileId, experiences, onEdit }: Props) {
  if (!experiences.length) {
    return (
      <section className={styles.sectionCardMd}>
        <div className={styles.sectionHeaderSpaced}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            <p className={styles.mutedText}>Add your first role.</p>
          </div>
          <AddExperienceModal profileId={profileId} />
        </div>
        <p className={styles.bodyText}>No experience yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.sectionCardMd}>
      <div className={styles.sectionHeaderSpaced}>
        <div className={styles.stackSm}>
          <h2 className={styles.sectionTitle}>Experience</h2>
        </div>
        <AddExperienceModal profileId={profileId} />
      </div>
      <div className={styles.stackMd}>
        {experiences.map((exp) => (
          <article key={exp.id} className={styles.itemCard}>
            <div className={styles.stackSmFlex}>
              <p className={styles.sectionTitle}>{exp.role}</p>
              <p className={styles.mutedText}>
                {exp.company}
                {exp.location ? ` • ${exp.location}` : ""}
                {exp.period ? ` • ${exp.period}` : ""}
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
              <button onClick={() => onEdit(exp)} className={styles.editButton} aria-label="Edit experience">
                <PenIcon className={styles.iconSm} />
              </button>
              <form action={deleteExperience}>
                <input type="hidden" name="id" value={exp.id} />
                <button type="submit" className={dangerButton}>
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

