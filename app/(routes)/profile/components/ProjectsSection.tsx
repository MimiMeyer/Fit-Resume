"use client";

import { useState, useTransition } from "react";
import { PenIcon } from "@/app/icons/pen";
import { styles } from "../style-constants";
import type { Project } from "@/types/project";
import { Modal } from "../Modal";

const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

type Props = {
  profileId: number;
  projects: Project[];
  onEdit: (project: Project) => void;
  onAdd: (input: Omit<Project, "id">) => void;
  onDelete: (id: number) => void;
};

function AddProjectModal({ profileId, onAdd }: { profileId: number; onAdd: Props["onAdd"] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.primaryButton} onClick={() => setOpen(true)}>
        Add Project
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add project"
        description="Add a project title, quick description, and optional link."
      >
        <form
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const title = String(formData.get("title") ?? "").trim();
            const description = String(formData.get("description") ?? "").trim() || null;
            const technologies = String(formData.get("technologies") ?? "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            const link = String(formData.get("link") ?? "").trim() || null;
            if (!title) return;
            startTransition(() => {
              onAdd({ title, description, technologies, link });
              setOpen(false);
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <label className={styles.formField}>
            <span className={styles.labelText}>Title</span>
            <input name="title" className={styles.input} required />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Description</span>
            <textarea name="description" rows={3} className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Technologies</span>
            <input name="technologies" placeholder="React, Node.js, etc." className={styles.input} />
          </label>
          <label className={styles.formField}>
            <span className={styles.labelText}>Link</span>
            <input name="link" type="url" className={styles.input} />
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

export function ProjectsSection({ profileId, projects, onEdit, onAdd, onDelete }: Props) {
  if (!projects.length) {
    return (
      <section className={styles.sectionCardMd}>
        <div className={styles.sectionHeaderSpaced}>
          <div className={styles.stackSm}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <p className={styles.mutedText}>Add your first project.</p>
          </div>
          <AddProjectModal profileId={profileId} onAdd={onAdd} />
        </div>
        <p className={styles.bodyText}>
          No projects yet.
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
        <AddProjectModal profileId={profileId} onAdd={onAdd} />
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
              <button type="button" className={dangerButton} onClick={() => onDelete(project.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
