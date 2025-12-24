export type ResumeSectionId =
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "certifications";

export type ResumeLayoutMode = "single" | "two";

export type ResumePalette = {
  accent: string;
  accentLight: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
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
  school: string;
  period: string;
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
