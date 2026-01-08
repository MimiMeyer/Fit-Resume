import type {
  ResumeBorders,
  ResumeEducationForView,
  ResumeExperienceForView,
  ResumeFontFamilies,
  ResumeFontSizes,
  ResumeLayoutMode,
  ResumePalette,
  ResumeProjectForView,
  ResumeSectionId,
  ResumeSkillGroup,
  ResumeSpacing,
} from "@/app/(routes)/tailor-resume/types";

export type TailorResumePdfHeader = {
  fullName: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
};

export type TailorResumePdfCertification = {
  name: string;
  issuer?: string | null;
  credentialUrl?: string | null;
};

export type TailorResumePdfRequest = {
  fileName?: string | null;
  paginatedSections: ResumeSectionId[][];
  layoutMode: ResumeLayoutMode;
  palette: ResumePalette;
  accentOpacity: number;
  fontSizes: ResumeFontSizes;
  fontFamilies: ResumeFontFamilies;
  spacing: ResumeSpacing;
  borders: ResumeBorders;
  accentIsNone: boolean;

  header: TailorResumePdfHeader;
  experiences: ResumeExperienceForView[];
  education: ResumeEducationForView[];
  skillGroups: ResumeSkillGroup[];
  projects: ResumeProjectForView[];
  certifications: TailorResumePdfCertification[];
};
