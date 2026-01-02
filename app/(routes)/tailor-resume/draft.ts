import type { ResumeSectionId } from "./types";

export type TailorHeaderDraft = {
  fullName: string;
  title: string;
  headline: string;
  summary: string;
};

export type TailorExperienceDraft = {
  id?: number;
  role: string;
  company: string;
  location: string;
  period: string;
  impact: string;
};

export type TailorProjectDraft = {
  id?: number;
  title: string;
  description: string;
  link: string;
  technologies: string[];
};

export type TailorSkillDraft = {
  id?: number;
  name: string;
  category: string;
};

export type TailorEducationDraft = {
  id?: number;
  institution: string;
  degree: string;
  field: string;
  startYear: number | null;
  endYear: number | null;
  details: string;
};

export type TailorCertificationDraft = {
  id?: number;
  name: string;
  issuer: string;
  issuedYear: number | null;
  credentialUrl: string;
};

export type TailorResumeDraft = {
  version: 1;
  updatedAt: number;
  header?: Partial<TailorHeaderDraft>;
  experiences?: TailorExperienceDraft[];
  projects?: TailorProjectDraft[];
  skills?: TailorSkillDraft[];
  educations?: TailorEducationDraft[];
  certifications?: TailorCertificationDraft[];
};

export type TailorDraftSection =
  | "header"
  | Exclude<ResumeSectionId, "certifications">
  | "certifications";
