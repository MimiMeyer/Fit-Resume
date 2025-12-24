"use client";

import type { Profile } from "@/types/profile";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";

type Props = {
  profile: Profile;
  onEdit: () => void;
};

export function ProfileHeader({ profile, onEdit }: Props) {
  return (
    <section className={styles.aboutCard}>
      <div className={styles.headerRow}>
        <header className={styles.headerStack}>
          <p className={styles.eyebrow}>About Me</p>
          <h1 className={styles.pageTitle}>{profile.fullName}</h1>
          <p className={styles.bodyText}>
            {profile.title ?? profile.headline ?? "Role not set"}
          </p>
          <div className={styles.pillRow}>
            {profile.location && <span className={styles.pill}>{profile.location}</span>}
            {profile.email && <span className={styles.pill}>{profile.email}</span>}
            {profile.phone && <span className={styles.pill}>{profile.phone}</span>}
            {profile.linkedinUrl && (
              <a
                className={styles.linkPill}
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a
                className={styles.linkPill}
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
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
