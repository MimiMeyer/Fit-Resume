"use server";

import { runResumeAgents } from "@/server/resume/resumeAgents";
import { getProfileWithRelations } from "@/server/profile/profile.repo";

export async function generateResume(jd: string) {
  const trimmed = jd.trim();
  if (!trimmed) {
    throw new Error("Job description is required.");
  }

  const profile = await getProfileWithRelations();
  if (!profile) {
    throw new Error("No profile found. Add details in About Me first.");
  }

  return runResumeAgents(profile, trimmed);
}
