"use server";

import { runResumeAgents } from "@/server/resume/resumeAgents";
import type { Profile } from "@/types/profile";
import type { AgentProfileInput } from "@/types/resume-agent";

function toAgentProfileInput(profile: Profile): AgentProfileInput {
  return {
    fullName: profile.fullName,
    title: profile.title ?? null,
    summary: profile.summary ?? null,
    location: profile.location ?? null,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    githubUrl: profile.githubUrl ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    websiteUrl: profile.websiteUrl ?? null,
    experiences: (profile.experiences ?? []).map((e) => ({
      role: e.role,
      company: e.company,
      location: e.location ?? null,
      period: e.period ?? null,
      impactBullets: e.impactBullets ?? [],
    })),
    projects: (profile.projects ?? []).map((p) => ({
      title: p.title,
      description: p.description ?? null,
      link: p.link ?? null,
      technologies: p.technologies ?? [],
    })),
    skills: (profile.skills ?? []).map((s) => ({
      name: s.name,
      category: { name: s.category?.name ?? "UNCATEGORIZED" },
    })),
  };
}

export async function generateResume(profile: Profile, jd: string) {
  const trimmed = jd.trim();
  if (!trimmed) {
    throw new Error("Job description is required.");
  }

  if (!profile?.fullName) {
    throw new Error("Profile is required. Add details in Profile first.");
  }

  return runResumeAgents(toAgentProfileInput(profile), trimmed);
}
