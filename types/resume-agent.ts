export type AgentSkillInput = {
  name: string;
  category: { name: string };
};

export type AgentExperienceInput = {
  role: string;
  company: string;
  location?: string | null;
  period?: string | null;
  impact?: string | null;
};

export type AgentProjectInput = {
  title: string;
  description?: string | null;
  link?: string | null;
  technologies?: string[] | null;
};

export type AgentProfileInput = {
  fullName: string;
  title?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  experiences: AgentExperienceInput[];
  projects: AgentProjectInput[];
  skills: AgentSkillInput[];
};

export type GeneratedExperience = {
  role: string;
  company: string;
  location?: string;
  period?: string;
  bullets: string[];
};

export type GeneratedProject = {
  title: string;
  description?: string;
  technologies?: string[];
  link?: string | null;
};

export type GeneratedResume = {
  summary: string;
  experiences: GeneratedExperience[];
  projects: GeneratedProject[];
  skillsByCategory: Record<string, string[]>;
};
