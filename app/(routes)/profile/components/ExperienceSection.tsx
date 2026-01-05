"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Experience } from "@/types/experience";
import { Modal } from "../Modal";
import { BulletTextarea } from "@/app/components/BulletTextarea";
import { normalizeBullets } from "@/lib/normalizeBullets";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  experiences: Experience[];
  onEdit: (exp: Experience) => void;
  onAdd: (input: Omit<Experience, "id">) => void;
  onDelete: (id: number) => void;
};

function AddExperienceModal({ profileId, onAdd }: { profileId: number; onAdd: Props["onAdd"] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [impactBullets, setImpactBullets] = useState<string[]>([""]);

  return (
    <>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={() => {
          setImpactBullets([""]);
          setOpen(true);
        }}
      >
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
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const role = String(formData.get("role") ?? "").trim();
            const company = String(formData.get("company") ?? "").trim();
            const location = String(formData.get("location") ?? "").trim() || null;
            const period = String(formData.get("period") ?? "").trim() || null;
            const normalizedBullets = normalizeBullets(impactBullets);
            if (!role || !company) return;
            startTransition(() => {
              onAdd({ role, company, location, period, impactBullets: normalizedBullets });
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
            <BulletTextarea
              label="Impact"
              bullets={impactBullets}
              onChange={setImpactBullets}
              className={styles.input}
              rows={5}
              placeholder="• Impact bullet"
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
    </>
  );
}

export function ExperienceSection({ profileId, experiences, onEdit, onAdd, onDelete }: Props) {
  if (!experiences.length) {
    return (
      <section className={styles.sectionCardMd}>
        <div className={styles.sectionHeaderSpaced}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>Experience</h2>
          </div>
          <AddExperienceModal profileId={profileId} onAdd={onAdd} />
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
        <AddExperienceModal profileId={profileId} onAdd={onAdd} />
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
              {exp.impactBullets.length > 0 && (
                <ul className={styles.bulletList}>
                  {exp.impactBullets.map((line: string, idx: number) => (
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
              <button type="button" className={dangerButton} onClick={() => onDelete(exp.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

