"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/(routes)/profile/Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditSectionButtons } from "./content/EditSectionButtons";
import type { ReactNode } from "react";
import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorResumeDraft,
  TailorSkillDraft,
} from "../draft";
import { updateProfileDetails } from "@/app/actions/profile-actions";
import { saveExperiencesSection } from "@/app/actions/experience-actions";
import { saveProjectsSection } from "@/app/actions/project-actions";
import { saveEducationSection } from "@/app/actions/education-actions";
import { saveCertificationsSection } from "@/app/actions/certification-actions";
import { saveSkillsSection } from "@/app/actions/skill-actions";

type Props = {
  profileId: number;
  profileDetails: {
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
  };
  draft: TailorResumeDraft | null;
  setDraft: (next: TailorResumeDraft | null) => void;
  header: TailorHeaderDraft;
  experiences: TailorExperienceDraft[];
  projects: TailorProjectDraft[];
  skills: TailorSkillDraft[];
  educations: TailorEducationDraft[];
  certifications: TailorCertificationDraft[];
};

type OpenModal =
  | null
  | "header"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications";

type ConfirmState = null | { message: string };
type InlineErrorState = null | { message: string };

function SectionModalShell({
  open,
  title,
  inlineError,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  inlineError: InlineErrorState;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal triggerLabel="" title={title} open={open} onClose={onClose}>
      {inlineError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {inlineError.message}
        </div>
      ) : null}
      {children}
    </Modal>
  );
}

function nextDraft(base: TailorResumeDraft | null): TailorResumeDraft {
  return base ?? { version: 1, updatedAt: Date.now() };
}

function isBlankString(val: string) {
  return val.trim().length === 0;
}

function allBlank(values: string[]) {
  return values.every((v) => isBlankString(v));
}

function validateHeaderDraft(draft: TailorHeaderDraft): string | null {
  if (isBlankString(draft.fullName)) return "Full name is required.";
  return null;
}

function normalizeList<T>(items: T[], isBlank: (item: T) => boolean) {
  return items.filter((i) => !isBlank(i));
}

function validateExperiences(items: TailorExperienceDraft[]): string | null {
  const normalized = normalizeList(items, (e) =>
    allBlank([e.role, e.company, e.location, e.period, e.impact]),
  );
  const invalid = normalized.find((e) => isBlankString(e.role) || isBlankString(e.company));
  if (invalid) return "Each experience needs at least Role and Company (or delete the blank item).";
  return null;
}

function validateProjects(items: TailorProjectDraft[]): string | null {
  const normalized = normalizeList(items, (p) =>
    allBlank([p.title, p.description, p.link, (p.technologies || []).join(",")]),
  );
  const invalid = normalized.find((p) => isBlankString(p.title));
  if (invalid) return "Each project needs a Title (or delete the blank item).";
  return null;
}

function validateSkills(items: TailorSkillDraft[]): string | null {
  const normalized = normalizeList(items, (s) => allBlank([s.name, s.category]));
  const invalid = normalized.find((s) => isBlankString(s.name) || isBlankString(s.category));
  if (invalid) return "Each skill needs both Skill and Category (or delete the blank item).";
  return null;
}

function validateEducations(items: TailorEducationDraft[]): string | null {
  const normalized = normalizeList(items, (e) =>
    allBlank([e.institution, e.degree, e.field, e.details]),
  );
  const invalid = normalized.find((e) => isBlankString(e.institution));
  if (invalid) return "Each education item needs an Institution (or delete the blank item).";
  return null;
}

function validateCertifications(items: TailorCertificationDraft[]): string | null {
  const normalized = normalizeList(items, (c) =>
    allBlank([c.name, c.issuer, c.credentialUrl]),
  );
  const invalid = normalized.find((c) => isBlankString(c.name));
  if (invalid) return "Each certification needs a Name (or delete the blank item).";
  return null;
}

function normalizeExperiences(items: TailorExperienceDraft[]) {
  return normalizeList(items, (e) => allBlank([e.role, e.company, e.location, e.period, e.impact]));
}

function normalizeProjects(items: TailorProjectDraft[]) {
  return normalizeList(items, (p) =>
    allBlank([p.title, p.description, p.link, (p.technologies || []).join(",")]),
  );
}

function normalizeSkills(items: TailorSkillDraft[]) {
  return normalizeList(items, (s) => allBlank([s.name, s.category]));
}

function normalizeEducations(items: TailorEducationDraft[]) {
  return normalizeList(items, (e) => allBlank([e.institution, e.degree, e.field, e.details]));
}

function normalizeCertifications(items: TailorCertificationDraft[]) {
  return normalizeList(items, (c) => allBlank([c.name, c.issuer, c.credentialUrl]));
}

function updateDraftSection<K extends keyof TailorResumeDraft>(
  draft: TailorResumeDraft | null,
  key: K,
  value: TailorResumeDraft[K],
): TailorResumeDraft {
  return {
    ...nextDraft(draft),
    updatedAt: Date.now(),
    [key]: value,
  };
}

function clearDraftSection<K extends keyof TailorResumeDraft>(
  draft: TailorResumeDraft | null,
  key: K,
): TailorResumeDraft | null {
  if (!draft) return null;
  const next = { ...draft };
  delete (next as Partial<TailorResumeDraft>)[key];
  const keys = Object.keys(next).filter((k) => k !== "version" && k !== "updatedAt");
  if (!keys.length) return null;
  return { ...next, updatedAt: Date.now() };
}

export function ContentPanel({
  profileId,
  profileDetails,
  draft,
  setDraft,
  header,
  experiences,
  projects,
  skills,
  educations,
  certifications,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<OpenModal>(null);
  const [isPending, startTransition] = useTransition();
  const confirmActionRef = useRef<(() => void) | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [inlineError, setInlineError] = useState<InlineErrorState>(null);

  const requestConfirm = (message: string, action: () => void) => {
    confirmActionRef.current = action;
    setConfirm({ message });
  };

  const showError = (_title: string, message: string) => {
    setInlineError({ message });
  };

  const closeConfirm = () => {
    confirmActionRef.current = null;
    setConfirm(null);
  };

  const clearInlineError = () => setInlineError(null);

  const closeModal = () => {
    setOpen(null);
    clearInlineError();
  };

  const hasHeaderDraft = draft?.header !== undefined;
  const hasExpDraft = draft?.experiences !== undefined;
  const hasProjectsDraft = draft?.projects !== undefined;
  const hasSkillsDraft = draft?.skills !== undefined;
  const hasEduDraft = draft?.educations !== undefined;
  const hasCertDraft = draft?.certifications !== undefined;

  const draftCount = useMemo(() => {
    return [hasHeaderDraft, hasExpDraft, hasProjectsDraft, hasSkillsDraft, hasEduDraft, hasCertDraft]
      .filter(Boolean)
      .length;
  }, [hasCertDraft, hasEduDraft, hasExpDraft, hasHeaderDraft, hasProjectsDraft, hasSkillsDraft]);

  type EditorComponent<T> = (props: {
    initial: T;
    isPending: boolean;
    canClearDraft: boolean;
    onClearDraft: () => void;
    onSavePreview: (next: T) => void;
    onSaveProfile: (next: T) => void;
  }) => ReactNode;

  type SectionConfig = {
    key: Exclude<OpenModal, null>;
    draftKey: keyof TailorResumeDraft;
    buttonLabel: string;
    modalTitle: string;
    hasDraft: boolean;
    canClearDraft: boolean;
    onClearDraft: () => void;
    confirmMessage: string;
    errorFallback: string;
    validate: (val: unknown) => string | null;
    toDraft: (val: unknown) => TailorResumeDraft[keyof TailorResumeDraft];
    save: (val: unknown) => Promise<unknown>;
    Editor: EditorComponent<unknown>;
    initial: unknown;
  };

  const sectionConfigs: SectionConfig[] = [
    {
      key: "header",
      draftKey: "header",
      buttonLabel: "Edit Summary",
      modalTitle: "Edit Summary",
      hasDraft: hasHeaderDraft,
      canClearDraft: hasHeaderDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "header")),
      confirmMessage: "You're about to save this Summary to your profile. Are you sure?",
      errorFallback: "Failed to save Summary.",
      validate: (val) => validateHeaderDraft(val as TailorHeaderDraft),
      toDraft: (val) => val as Partial<TailorHeaderDraft>,
      save: async (val) => {
        const next = val as TailorHeaderDraft;
        const fd = new FormData();
        fd.set("fullName", next.fullName);
        fd.set("title", next.title);
        fd.set("headline", next.headline);
        fd.set("summary", next.summary);
        fd.set("email", profileDetails.email ?? "");
        fd.set("phone", profileDetails.phone ?? "");
        fd.set("location", profileDetails.location ?? "");
        fd.set("githubUrl", profileDetails.githubUrl ?? "");
        fd.set("linkedinUrl", profileDetails.linkedinUrl ?? "");
        fd.set("websiteUrl", profileDetails.websiteUrl ?? "");
        await updateProfileDetails(fd);
      },
      Editor: HeaderEditor as unknown as EditorComponent<unknown>,
      initial: header,
    },
    {
      key: "experience",
      draftKey: "experiences",
      buttonLabel: "Edit Experience",
      modalTitle: "Edit Experience",
      hasDraft: hasExpDraft,
      canClearDraft: hasExpDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "experiences")),
      confirmMessage: "You're about to overwrite your profile Experience section. Are you sure?",
      errorFallback: "Failed to save Experience.",
      validate: (val) => validateExperiences(val as TailorExperienceDraft[]),
      toDraft: (val) => normalizeExperiences(val as TailorExperienceDraft[]),
      save: (val) =>
        saveExperiencesSection({
          profileId,
          experiences: normalizeExperiences(val as TailorExperienceDraft[]),
        }),
      Editor: ExperienceEditor as unknown as EditorComponent<unknown>,
      initial: experiences,
    },
    {
      key: "projects",
      draftKey: "projects",
      buttonLabel: "Edit Projects",
      modalTitle: "Edit Projects",
      hasDraft: hasProjectsDraft,
      canClearDraft: hasProjectsDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "projects")),
      confirmMessage: "You're about to overwrite your profile Projects section. Are you sure?",
      errorFallback: "Failed to save Projects.",
      validate: (val) => validateProjects(val as TailorProjectDraft[]),
      toDraft: (val) => normalizeProjects(val as TailorProjectDraft[]),
      save: (val) =>
        saveProjectsSection({ profileId, projects: normalizeProjects(val as TailorProjectDraft[]) }),
      Editor: ProjectsEditor as unknown as EditorComponent<unknown>,
      initial: projects,
    },
    {
      key: "skills",
      draftKey: "skills",
      buttonLabel: "Edit Skills",
      modalTitle: "Edit Skills",
      hasDraft: hasSkillsDraft,
      canClearDraft: hasSkillsDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "skills")),
      confirmMessage: "You're about to overwrite your profile Skills section. Are you sure?",
      errorFallback: "Failed to save Skills.",
      validate: (val) => validateSkills(val as TailorSkillDraft[]),
      toDraft: (val) => normalizeSkills(val as TailorSkillDraft[]),
      save: (val) => saveSkillsSection({ profileId, skills: normalizeSkills(val as TailorSkillDraft[]) }),
      Editor: SkillsEditor as unknown as EditorComponent<unknown>,
      initial: skills,
    },
    {
      key: "education",
      draftKey: "educations",
      buttonLabel: "Edit Education",
      modalTitle: "Edit Education",
      hasDraft: hasEduDraft,
      canClearDraft: hasEduDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "educations")),
      confirmMessage: "You're about to overwrite your profile Education section. Are you sure?",
      errorFallback: "Failed to save Education.",
      validate: (val) => validateEducations(val as TailorEducationDraft[]),
      toDraft: (val) => normalizeEducations(val as TailorEducationDraft[]),
      save: (val) =>
        saveEducationSection({ profileId, educations: normalizeEducations(val as TailorEducationDraft[]) }),
      Editor: EducationEditor as unknown as EditorComponent<unknown>,
      initial: educations,
    },
    {
      key: "certifications",
      draftKey: "certifications",
      buttonLabel: "Edit Certs",
      modalTitle: "Edit Certifications",
      hasDraft: hasCertDraft,
      canClearDraft: hasCertDraft,
      onClearDraft: () => setDraft(clearDraftSection(draft, "certifications")),
      confirmMessage: "You're about to overwrite your profile Certifications section. Are you sure?",
      errorFallback: "Failed to save Certifications.",
      validate: (val) => validateCertifications(val as TailorCertificationDraft[]),
      toDraft: (val) => normalizeCertifications(val as TailorCertificationDraft[]),
      save: (val) =>
        saveCertificationsSection({
          profileId,
          certifications: normalizeCertifications(val as TailorCertificationDraft[]),
        }),
      Editor: CertificationsEditor as unknown as EditorComponent<unknown>,
      initial: certifications,
    },
  ];

  const savePreviewFor = (section: SectionConfig, next: unknown) => {
    const err = section.validate(next);
    if (err) return showError("", err);
    setDraft(updateDraftSection(draft, section.draftKey as never, section.toDraft(next) as never));
    closeModal();
  };

  const saveProfileFor = (section: SectionConfig, next: unknown) => {
    const err = section.validate(next);
    if (err) return showError("", err);
    requestConfirm(section.confirmMessage, () => {
      startTransition(() => {
        void section
          .save(next)
          .then(() => {
            setDraft(clearDraftSection(draft, section.draftKey));
            router.refresh();
            closeConfirm();
            closeModal();
          })
          .catch((e: unknown) => {
            const msg = e instanceof Error ? e.message : section.errorFallback;
            closeConfirm();
            showError("", msg);
          });
      });
    });
  };

  return (
    <>
      <div className="flex w-full items-center justify-end gap-2">
        {draftCount ? (
          <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-100">
            {draftCount} draft{draftCount === 1 ? "" : "s"}
          </span>
        ) : null}
        <EditSectionButtons
          sections={sectionConfigs.map((s) => ({ key: s.key, label: s.buttonLabel, hasDraft: s.hasDraft }))}
          onOpen={setOpen}
        />
      </div>

      {sectionConfigs.map((section) => (
        <SectionModalShell
          key={section.key}
          open={open === section.key}
          title={section.modalTitle}
          inlineError={inlineError}
          onClose={closeModal}
        >
          <section.Editor
            initial={section.initial}
            isPending={isPending}
            canClearDraft={section.canClearDraft}
            onClearDraft={section.onClearDraft}
            onSavePreview={(next) => savePreviewFor(section, next)}
            onSaveProfile={(next) => saveProfileFor(section, next)}
          />
        </SectionModalShell>
      ))}

      <ConfirmDialog
        open={!!confirm}
        message={confirm?.message ?? ""}
        confirmLabel="OK"
        cancelLabel="Cancel"
        isPending={isPending}
        onCancel={closeConfirm}
        onConfirm={() => {
          const action = confirmActionRef.current;
          if (!action) return closeConfirm();
          action();
        }}
      />
    </>
  );
}

function ActionRow({
  isPending,
  onSavePreview,
  onSaveProfile,
  canClearDraft,
  onClearDraft,
}: {
  isPending: boolean;
  onSavePreview: () => void;
  onSaveProfile: () => void;
  canClearDraft: boolean;
  onClearDraft: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          onClick={onSavePreview}
        >
          {isPending ? "Saving..." : "Save to preview"}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
          onClick={onSaveProfile}
        >
          Save to profile
        </button>
      </div>
      {canClearDraft ? (
        <button
          type="button"
          disabled={isPending}
          className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-60"
          onClick={onClearDraft}
        >
          Discard preview draft
        </button>
      ) : null}
    </div>
  );
}

function HeaderEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorHeaderDraft;
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorHeaderDraft) => void;
  onSaveProfile: (next: TailorHeaderDraft) => void;
}) {
  const [state, setState] = useState<TailorHeaderDraft>(initial);

  return (
    <div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Full name</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.fullName}
            onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Title</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Headline</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.headline}
            onChange={(e) => setState((s) => ({ ...s, headline: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Summary</span>
          <textarea
            rows={6}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.summary}
            onChange={(e) => setState((s) => ({ ...s, summary: e.target.value }))}
          />
        </label>
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(state)}
        onSaveProfile={() => onSaveProfile(state)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}

function ExperienceEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorExperienceDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorExperienceDraft[]) => void;
  onSaveProfile: (next: TailorExperienceDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorExperienceDraft[]>(initial);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [didAdd, setDidAdd] = useState(false);

  useEffect(() => {
    if (!didAdd) return;
    setDidAdd(false);
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstField = el.querySelector("input,textarea") as HTMLElement | null;
    firstField?.focus();
  }, [didAdd, items.length]);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => {
            setDidAdd(true);
            setItems((prev) => [
              ...prev,
              { id: undefined, role: "", company: "", location: "", period: "", impact: "" },
            ]);
          }}
        >
          + Add experience
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((exp, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Role</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.role}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, role: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Company</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.company}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, company: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Location</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.location}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, location: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Period</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.period}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, period: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Impact (one bullet per line)</span>
                <textarea
                  rows={5}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={exp.impact}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, impact: e.target.value } : p)),
                    )
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(items)}
        onSaveProfile={() => onSaveProfile(items)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}

function ProjectsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorProjectDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorProjectDraft[]) => void;
  onSaveProfile: (next: TailorProjectDraft[]) => void;
}) {
  type ProjectForm = Omit<TailorProjectDraft, "technologies"> & { technologiesText: string };
  const [items, setItems] = useState<ProjectForm[]>(
    initial.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link,
      technologiesText: (p.technologies || []).join(", "),
    })),
  );
  const listRef = useRef<HTMLDivElement | null>(null);
  const [didAdd, setDidAdd] = useState(false);

  useEffect(() => {
    if (!didAdd) return;
    setDidAdd(false);
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstField = el.querySelector("input,textarea") as HTMLElement | null;
    firstField?.focus();
  }, [didAdd, items.length]);

  const toDraft = (): TailorProjectDraft[] =>
    items.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link,
      technologies: p.technologiesText.split(",").map((t) => t.trim()).filter(Boolean),
    }));

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => {
            setDidAdd(true);
            setItems((prev) => [
              ...prev,
              { id: undefined, title: "", description: "", link: "", technologiesText: "" },
            ]);
          }}
        >
          + Add project
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((proj, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Title</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={proj.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, title: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Description</span>
                <textarea
                  rows={3}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={proj.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, description: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Link</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={proj.link}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, link: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Technologies</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    placeholder="React, Node.js, etc."
                    value={proj.technologiesText}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, technologiesText: e.target.value } : p,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(toDraft())}
        onSaveProfile={() => onSaveProfile(toDraft())}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}

function SkillsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorSkillDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorSkillDraft[]) => void;
  onSaveProfile: (next: TailorSkillDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorSkillDraft[]>(initial);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [didAdd, setDidAdd] = useState(false);

  useEffect(() => {
    if (!didAdd) return;
    setDidAdd(false);
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstField = el.querySelector("input,textarea") as HTMLElement | null;
    firstField?.focus();
  }, [didAdd, items.length]);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => {
            setDidAdd(true);
            setItems((prev) => [...prev, { id: undefined, name: "", category: "" }]);
          }}
        >
          + Add skill
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-3">
        {items.map((s, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-xl border border-zinc-200 bg-white p-3"
          >
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-zinc-800">Skill</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                value={s.name}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)),
                  )
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-zinc-800">Category</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                value={s.category}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, category: e.target.value } : p)),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="mb-1 text-sm font-semibold text-red-600"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(items)}
        onSaveProfile={() => onSaveProfile(items)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}

function EducationEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorEducationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorEducationDraft[]) => void;
  onSaveProfile: (next: TailorEducationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorEducationDraft[]>(initial);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: undefined,
                institution: "",
                degree: "",
                field: "",
                startYear: null,
                endYear: null,
                details: "",
              },
            ])
          }
        >
          + Add education
        </button>
      </div>

      <div className="mt-3 grid gap-4">
        {items.map((edu, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Institution</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={edu.institution}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, institution: e.target.value } : p)),
                    )
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Degree</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.degree}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, degree: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Field</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.field}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, field: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Start year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.startYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, startYear: next } : p)),
                      );
                    }}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">End year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.endYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, endYear: next } : p)));
                    }}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Details</span>
                <textarea
                  rows={3}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={edu.details}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, details: e.target.value } : p)),
                    )
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(items)}
        onSaveProfile={() => onSaveProfile(items)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}

function CertificationsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorCertificationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorCertificationDraft[]) => void;
  onSaveProfile: (next: TailorCertificationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorCertificationDraft[]>(initial);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { id: undefined, name: "", issuer: "", issuedYear: null, credentialUrl: "" },
            ])
          }
        >
          + Add certification
        </button>
      </div>

      <div className="mt-3 grid gap-4">
        {items.map((c, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Name</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={c.name}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)),
                    )
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Issuer</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={c.issuer}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, issuer: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Issued year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={c.issuedYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, issuedYear: next } : p)),
                      );
                    }}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Credential URL</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={c.credentialUrl}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, credentialUrl: e.target.value } : p)),
                    )
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(items)}
        onSaveProfile={() => onSaveProfile(items)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}
