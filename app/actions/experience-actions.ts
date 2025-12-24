"use server";

import { revalidatePath } from "next/cache";
import {
  createExperience,
  deleteExperience as deleteExperienceRepo,
  updateExperience as updateExperienceRepo,
} from "@/server/profile/profile.repo";


export async function addExperience(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const role = (formData.get("role") as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const period = (formData.get("period") as string | null)?.trim() || null;
  const impact = (formData.get("impact") as string | null)?.trim() || null;
  if (!profileId || !role || !company) return;

  await createExperience({ profileId, role, company, location, period, impact });
  revalidatePath("/profile");
}

export async function deleteExperience(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteExperienceRepo(id);
  revalidatePath("/profile");
}

export async function updateExperience(formData: FormData) {
  const id = Number(formData.get("id"));
  const role = (formData.get("role") as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const period = (formData.get("period") as string | null)?.trim() || null;
  const impact = (formData.get("impact") as string | null)?.trim() || null;
  if (!id || !role || !company) return;

  await updateExperienceRepo(id, { role, company, location, period, impact });
  revalidatePath("/profile");
}
