import type { AgentProfileInput } from "@/types/resume-agent";

export type ModelInput = {
  profile: Pick<AgentProfileInput, "fullName" | "title" | "summary">;
  experiences: Array<{
    role: string;
    company: string;
    period?: string | null;
    location?: string | null;
    impactBullets: string[];
  }>;
  projects: Array<{
    title: string;
    description?: string | null;
    technologies: string[];
    link?: string | null;
  }>;
  skillsByCategory: Record<string, string[]>;
};

export type GetModel = (apiKey?: string) => unknown;

