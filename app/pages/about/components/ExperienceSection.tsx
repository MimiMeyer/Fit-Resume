"use client";

import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Experience } from "../types";
import { AddExperienceModal, dangerButton } from "../modals/AboutAddModals";
import { deleteExperience } from "@/app/actions/profile";

type Props = {
  profileId: number;
  experiences: Experience[];
  onEdit: (exp: Experience) => void;
};

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
        <p className={styles.bodyText}>
          No experience added yet. Use the form above to add one.
        </p>
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
              <button
                onClick={() => onEdit(exp)}
                className={styles.editButton}
                aria-label="Edit experience"
              >
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
