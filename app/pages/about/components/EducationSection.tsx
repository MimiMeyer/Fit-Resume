"use client";

import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Education } from "../types";
import { AddEducationModal, dangerButton } from "@/components/AboutAddModals";
import { deleteEducation } from "@/app/actions/profile";

type Props = {
  profileId: number;
  educations: Education[];
  onEdit: (edu: Education) => void;
};

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
