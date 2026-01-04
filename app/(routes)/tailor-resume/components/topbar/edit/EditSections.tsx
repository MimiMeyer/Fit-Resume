"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Modal } from "@/app/(routes)/profile/Modal";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { EditSectionButtons } from "../EditSectionButtons";
import type { Profile } from "@/types/profile";
import { updateProfileDetails as updateProfileDetailsLocal } from "@/app/local/profile-store";
import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorResumeDraft,
  TailorSkillDraft,
} from "../../../model/edit-state";
import {
  validateCertifications,
  validateEducations,
  validateExperiences,
  validateHeaderDraft,
  validateProjects,
  validateSkills,
} from "./logic/validate";
import {
  normalizeCertifications,
  normalizeEducations,
  normalizeExperiences,
  normalizeProjects,
  normalizeSkills,
} from "./logic/normalize";
import { normalizeBullets } from "@/lib/normalizeBullets";
import { CertificationsEditor } from "./sections/CertificationsEditor";
import { EducationEditor } from "./sections/EducationEditor";
import { ExperienceEditor } from "./sections/ExperienceEditor";
import { SummaryEditor } from "./sections/SummaryEditor";
import { ProjectsEditor } from "./sections/ProjectsEditor";
import { SkillsEditor } from "./sections/SkillsEditor";

type Props = {
  updateProfile: (updater: (current: Profile) => Profile, opts?: { flush?: boolean }) => void;
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

function newId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

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

type EditorProps<T> = {
  initial: T;
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: T) => void;
  onSaveProfile: (next: T) => void;
};

type EditorComponent<T> = (props: EditorProps<T>) => ReactNode;

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

export function EditSections({
  updateProfile,
  draft,
  setDraft,
  header,
  experiences,
  projects,
  skills,
  educations,
  certifications,
}: Props) {
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

  const resumeSavesCount = useMemo(() => {
    return [hasHeaderDraft, hasExpDraft, hasProjectsDraft, hasSkillsDraft, hasEduDraft, hasCertDraft]
      .filter(Boolean)
      .length;
  }, [hasCertDraft, hasEduDraft, hasExpDraft, hasHeaderDraft, hasProjectsDraft, hasSkillsDraft]);

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
        updateProfile(
          (current) =>
            updateProfileDetailsLocal(current, {
              fullName: next.fullName,
              title: next.title || null,
              summary: next.summary || null,
              email: next.email.trim() || null,
              phone: next.phone.trim() || null,
              location: next.location.trim() || null,
              githubUrl: next.githubUrl.trim() || null,
              linkedinUrl: next.linkedinUrl.trim() || null,
              websiteUrl: next.websiteUrl.trim() || null,
            }),
          { flush: true },
        );
      },
      Editor: SummaryEditor as unknown as EditorComponent<unknown>,
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
      save: async (val) => {
        const next = normalizeExperiences(val as TailorExperienceDraft[]);
        updateProfile(
          (current) => ({
            ...current,
            experiences: next.map((e) => ({
              id: e.id ?? newId(),
              role: e.role,
              company: e.company,
              location: e.location || null,
              period: e.period || null,
              impactBullets: normalizeBullets(e.impactBullets || []),
            })),
          }),
          { flush: true },
        );
      },
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
      save: async (val) => {
        const next = normalizeProjects(val as TailorProjectDraft[]);
        updateProfile(
          (current) => ({
            ...current,
            projects: next.map((p) => ({
              id: p.id ?? newId(),
              title: p.title,
              description: p.description || null,
              link: p.link || null,
              technologies: p.technologies ?? [],
            })),
          }),
          { flush: true },
        );
      },
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
      save: async (val) => {
        const next = normalizeSkills(val as TailorSkillDraft[]);
        updateProfile(
          (current) => ({
            ...current,
            skills: next
              .map((s) => ({
                id: s.id ?? newId(),
                name: s.name,
                category: { name: s.category.trim().toUpperCase() || "UNCATEGORIZED" },
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          }),
          { flush: true },
        );
      },
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
      save: async (val) => {
        const next = normalizeEducations(val as TailorEducationDraft[]);
        updateProfile(
          (current) => ({
            ...current,
            educations: next.map((e) => ({
              id: e.id ?? newId(),
              institution: e.institution,
              degree: e.degree || null,
              field: e.field || null,
              startYear: e.startYear ?? null,
              endYear: e.endYear ?? null,
              details: e.details || null,
            })),
          }),
          { flush: true },
        );
      },
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
      save: async (val) => {
        const next = normalizeCertifications(val as TailorCertificationDraft[]);
        updateProfile(
          (current) => ({
            ...current,
            certs: next.map((c) => ({
              id: c.id ?? newId(),
              name: c.name,
              issuer: c.issuer || null,
              issuedYear: c.issuedYear ?? null,
              credentialUrl: c.credentialUrl || null,
            })),
          }),
          { flush: true },
        );
      },
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
        {resumeSavesCount ? (
          <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-100">
            Resume changes saved: {resumeSavesCount} section{resumeSavesCount === 1 ? "" : "s"}
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
