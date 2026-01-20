import { createAnthropic } from "@ai-sdk/anthropic";
import type {
  AgentExperienceInput,
  AgentProfileInput,
  AgentProjectInput,
  GeneratedResume,
} from "@/types/resume-agent";
import type { ModelInput } from "./agents/types";
import { experienceAgent } from "./agents/experienceAgent";
import { projectsAgent } from "./agents/projectsAgent";
import { skillsAgent } from "./agents/skillsAgent";
import { summaryAgent } from "./agents/summaryAgent";

const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

function getAnthropicModel(apiKey?: string) {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    throw new Error("Claude API key is required.");
  }
  const provider = createAnthropic({ apiKey: trimmed });
  return provider(ANTHROPIC_MODEL);
}

function buildModelInput(profile: AgentProfileInput): ModelInput {
  const groupedSkills: Record<string, string[]> = {};
  for (const skill of profile.skills) {
    const cat = skill.category.name.toUpperCase();
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill.name);
  }

  return {
    profile: {
      fullName: profile.fullName,
      title: profile.title,
      summary: profile.summary,
    },
    experiences: profile.experiences.map((exp: AgentExperienceInput) => ({
      role: exp.role,
      company: exp.company,
      period: exp.period,
      location: exp.location,
      impactBullets: (exp.impactBullets ?? []).map((line) => line.trim()).filter(Boolean),
    })),
    projects: profile.projects.map((proj: AgentProjectInput) => ({
      title: proj.title,
      description: proj.description,
      technologies: proj.technologies || [],
      link: proj.link,
    })),
    skillsByCategory: groupedSkills,
  };
}

export async function runResumeAgents(
  profile: AgentProfileInput,
  jd: string,
  apiKey?: string,
): Promise<GeneratedResume> {
  const input = buildModelInput(profile);

  const [summary, experiences, projects, skillsByCategory] = await Promise.all([
    summaryAgent(input, jd, apiKey, getAnthropicModel),
    experienceAgent(input, jd, apiKey, getAnthropicModel),
    projectsAgent(input, jd, apiKey, getAnthropicModel),
    skillsAgent(input, jd, apiKey, getAnthropicModel),
  ]);

  return {
    summary,
    experiences,
    projects,
    skillsByCategory,
  };
}

