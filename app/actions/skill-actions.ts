"use server";

import { revalidatePath } from "next/cache";
import {
  deleteSkill as deleteSkillRepo,
  saveSkillsSection as saveSkillsSectionRepo,
  updateSkill as updateSkillRepo,
  upsertSkill as upsertSkillRepo,
} from "@/server/profile/profile.repo";

export async function addSkill(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const name = (formData.get("name") as string | null)?.trim();
  const categoryName = (formData.get("category") as string | null)?.trim();
  if (!profileId || !name || !categoryName) return;

  await upsertSkillRepo({ profileId, name, categoryName });
  revalidatePath("/profile");
}

export async function deleteSkill(formData: FormData) {
  const skillId = Number(formData.get("skillId"));
  if (!skillId) return;
  await deleteSkillRepo(skillId);
  revalidatePath("/profile");
}

export async function updateSkill(formData: FormData) {
  const skillId = Number(formData.get("skillId"));
  const name = (formData.get("name") as string | null)?.trim();
  const categoryName = (formData.get("category") as string | null)?.trim();
  if (!skillId || !name || !categoryName) return;

  await updateSkillRepo(skillId, { name, categoryName });
  revalidatePath("/profile");
}

export async function saveSkillsSection(args: {
  profileId: number;
  skills: Array<{ id?: number; name: string; category: string }>;
}) {
  await saveSkillsSectionRepo(args);

  revalidatePath("/profile");
  revalidatePath("/tailor-resume");
}
