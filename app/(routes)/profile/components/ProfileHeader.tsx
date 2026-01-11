"use client";

import type { Profile } from "@/types/profile";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import { sanitizeHref } from "@/lib/htmlSanitize";

type Props = {
  profile: Profile;
  onEdit: () => void;
};

export function ProfileHeader({ profile, onEdit }: Props) {
  const linkedInHref = profile.linkedinUrl ? sanitizeHref(profile.linkedinUrl) : null;
  const githubHref = profile.githubUrl ? sanitizeHref(profile.githubUrl) : null;
  const websiteHref = profile.websiteUrl ? sanitizeHref(profile.websiteUrl) : null;

  return (
    <section className={styles.aboutCard}>
      <div className={styles.headerRow}>
        <header className={styles.headerStack}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <h1 className={styles.pageTitle}>{profile.fullName}</h1>
          <p className={styles.bodyText}>
            {profile.title ?? "Role not set"}
          </p>
          <div className={styles.pillRow}>
            {profile.location && <span className={styles.pill}>{profile.location}</span>}
            {profile.email && <span className={styles.pill}>{profile.email}</span>}
            {profile.phone && <span className={styles.pill}>{profile.phone}</span>}
            {linkedInHref && (
              <a
                className={styles.linkPill}
                href={linkedInHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                LinkedIn
              </a>
            )}
            {githubHref && (
              <a
                className={styles.linkPill}
                href={githubHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </a>
            )}
            {websiteHref && (
              <a
                className={styles.linkPill}
                href={websiteHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                Website
              </a>
            )}
          </div>
          {profile.summary && <p className={styles.bodyText}>{profile.summary}</p>}
        </header>
        <button
          onClick={onEdit}
          className={styles.iconOnlyWithMargin}
          aria-label="Edit profile"
        >
          <PenIcon className={styles.iconSm} />
        </button>
      </div>
    </section>
  );
}
