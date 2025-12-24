"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Certification } from "@/types/certification";
import { Modal } from "../Modal";
import { addCertification, deleteCertification } from "@/app/actions/certification-actions";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  certs: Certification[];
  onEdit: (cert: Certification) => void;
};

function AddCertificationModal({ profileId }: { profileId: number }) {
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
          action={(formData) => {
            startTransition(async () => {
              await addCertification(formData);
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

export function CertificationsSection({ profileId, certs, onEdit }: Props) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.stackSm}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
        </div>
        <AddCertificationModal profileId={profileId} />
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
                <form action={deleteCertification}>
                  <input type="hidden" name="id" value={cert.id} />
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
          No certifications yet. Use the form above to add one.
        </p>
      )}
    </section>
  );
}
