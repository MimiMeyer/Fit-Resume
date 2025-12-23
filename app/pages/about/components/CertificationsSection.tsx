"use client";

import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Certification } from "../types";
import { AddCertificationModal, dangerButton } from "../modals/AboutAddModals";
import { deleteCertification } from "@/app/actions/profile";

type Props = {
  profileId: number;
  certs: Certification[];
  onEdit: (cert: Certification) => void;
};

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
