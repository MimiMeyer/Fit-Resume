export const DEFAULT_FONT_SIZES = { headingPx: 22, subtitlePx: 13, bodyPx: 11 };

export const DEFAULT_FONT_FAMILIES = {
  // PDF-safe font stacks (match React-PDF built-in fonts as closely as possible).
  title: "Arial, Helvetica, sans-serif",
  heading: "Arial, Helvetica, sans-serif",
  body: "Arial, Helvetica, sans-serif",
};

export const DEFAULT_SPACING = { sectionGapPx: 8, bulletGapPx: 5, pagePaddingPx: 12 };

export const DEFAULT_BORDERS: ResumeBorders = {
  widthPx: 1,
  style: "solid",
  radius: "rounded",
  targets: { page: true, summary: true, section: true, content: true },
};

export type ResumeSectionId =
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "certifications";

export type ResumeLayoutMode = "single" | "two";

export type ResumePalette = {
  accent: string;
  accentFill: string;
  accentLight: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
};

export type ResumeFontSizes = typeof DEFAULT_FONT_SIZES;
export type ResumeFontFamilies = typeof DEFAULT_FONT_FAMILIES;
export type ResumeSpacing = typeof DEFAULT_SPACING;

export type ResumeBorderStyle = "solid" | "dashed" | "dotted";
export type ResumeBorderRadius = "sharp" | "rounded";
export type ResumeBorderTargetKey = "page" | "summary" | "section" | "content";
export type ResumeBorders = {
  widthPx: number;
  style: ResumeBorderStyle;
  radius: ResumeBorderRadius;
  targets: Record<ResumeBorderTargetKey, boolean>;
};

export type ResumeExperienceForView = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export type ResumeEducationForView = {
  degree: string;
  field: string;
  school: string;
  period: string;
  details: string;
};

export type ResumeProjectForView = {
  name: string;
  detail: string;
  link: string;
};

export type ResumeSkillGroup = {
  category: string;
  items: string[];
};
