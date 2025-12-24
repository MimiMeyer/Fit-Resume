import type { Certification } from "./certification";
import type { Education } from "./education";
import type { Experience } from "./experience";
import type { Project } from "./project";
import type { Skill } from "./skill";

export type Profile = {
  id: number;
  fullName: string;
  headline?: string | null;
  summary?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  certs: Certification[];
  skills: Skill[];
};
