"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/(routes)/profile/Modal";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { EditSectionButtons } from "../EditSectionButtons";
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
import { updateProfileDetails } from "@/app/actions/profile-actions";
import { saveExperiencesSection } from "@/app/actions/experience-actions";
import { saveProjectsSection } from "@/app/actions/project-actions";
import { saveEducationSection } from "@/app/actions/education-actions";
import { saveCertificationsSection } from "@/app/actions/certification-actions";
import { saveSkillsSection } from "@/app/actions/skill-actions";
import { CertificationsEditor } from "./sections/CertificationsEditor";
import { EducationEditor } from "./sections/EducationEditor";
import { ExperienceEditor } from "./sections/ExperienceEditor";
import { SummaryEditor } from "./sections/SummaryEditor";
import { ProjectsEditor } from "./sections/ProjectsEditor";
import { SkillsEditor } from "./sections/SkillsEditor";

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
