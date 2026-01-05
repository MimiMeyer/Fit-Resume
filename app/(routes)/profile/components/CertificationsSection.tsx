"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Certification } from "@/types/certification";
import { Modal } from "../Modal";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  certs: Certification[];
  onEdit: (cert: Certification) => void;
  onAdd: (input: Omit<Certification, "id">) => void;
  onDelete: (id: number) => void;
};

function AddCertificationModal({ profileId, onAdd }: { profileId: number; onAdd: Props["onAdd"] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.primaryButton} onClick={() => setOpen(true)}>
        Add
      </button>
      <Modal triggerLabel="" open={open} onClose={() => setOpen(false)} title="Add certification">
        <form
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = String(formData.get("name") ?? "").trim();
            const issuer = String(formData.get("issuer") ?? "").trim() || null;
            const issuedYearRaw = String(formData.get("issuedYear") ?? "").trim();
            const issuedYear = issuedYearRaw ? Number(issuedYearRaw) : null;
            const credentialUrl = String(formData.get("credentialUrl") ?? "").trim() || null;
            if (!name) return;
            startTransition(() => {
              onAdd({
                name,
                issuer,
                issuedYear: Number.isFinite(issuedYear as number) ? issuedYear : null,
                credentialUrl,
              });
              setOpen(false);
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <label className={styles.formField}>
            <span className={styles.labelText}>Name</span>
            <input name="name" className={styles.input} required />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Issuer</span>
            <input name="issuer" className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Issued Year</span>
            <input name="issuedYear" type="number" className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Credential URL</span>
            <input name="credentialUrl" type="url" className={styles.input} />
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

export function CertificationsSection({ profileId, certs, onEdit, onAdd, onDelete }: Props) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.stackSm}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
        </div>
        <AddCertificationModal profileId={profileId} onAdd={onAdd} />
      </div>
      {certs.length ? (
        <div className={styles.sectionBody}>
          {certs.map((cert) => (
            <div key={cert.id} className={styles.listRow}>
              <div className={styles.flex1}>
                <p className={styles.strongText}>{cert.name}</p>
                <p className={styles.mutedText}>
                  {cert.issuer ?? "Issuer not set"}
                  {cert.issuedYear ? ` - ${cert.issuedYear}` : ""}
                </p>
              </div>
              <div className={styles.actionsRow}>
                <button
                  onClick={() => onEdit(cert)}
                  className={styles.editButton}
                  aria-label="Edit certification"
                >
                  <PenIcon className={styles.iconSm} />
                </button>
                <button type="button" className={dangerButton} onClick={() => onDelete(cert.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.bodyText}>
          No certifications yet.
        </p>
      )}
    </section>
  );
}
