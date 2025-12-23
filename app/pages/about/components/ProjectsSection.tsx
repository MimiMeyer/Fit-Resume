"use client";

import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Project } from "../types";
import { AddProjectModal, dangerButton } from "../modals/AboutAddModals";
import { deleteProject } from "@/app/actions/profile";

type Props = {
  profileId: number;
  projects: Project[];
  onEdit: (project: Project) => void;
};

export function ProjectsSection({ profileId, projects, onEdit }: Props) {
  if (!projects.length) {
    return (
      <section className={styles.sectionCardMd}>
        <div className={styles.sectionHeaderSpaced}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <p className={styles.mutedText}>Add your first project.</p>
          </div>
          <AddProjectModal profileId={profileId} />
        </div>
        <p className={styles.bodyText}>
          No projects added yet. Use the form above to add one.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.sectionCardMd}>
      <div className={styles.sectionHeaderSpaced}>
        <div className={styles.stackSm}>
          <h2 className={styles.sectionTitle}>Projects</h2>
        </div>
        <AddProjectModal profileId={profileId} />
      </div>
      <div className={styles.stackMd}>
        {projects.map((project) => (
          <article key={project.id} className={styles.itemCard}>
            <div className={styles.stackSmFlex}>
              <p className={styles.sectionTitle}>{project.title}</p>
              {project.description && (
                <p className={styles.bodyText}>{project.description}</p>
              )}
              {project.technologies?.length ? (
                <div className={styles.tagWrap}>
                  {(project.technologies ?? []).map((tech: string) => (
                    <span key={tech} className={styles.pillSm}>
                      {tech}
                    </span>
                  ))}
                </div>
              ) : null}
              {project.link ? (
                <a
                  href={project.link}
                  className={styles.accentLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              ) : null}
            </div>
            <div className={styles.actionsRow}>
              <button
                onClick={() => onEdit(project)}
                className={styles.editButton}
                aria-label="Edit project"
              >
                <PenIcon className={styles.iconSm} />
              </button>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={project.id} />
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
