"use server";

import { revalidatePath } from "next/cache";
import {
  createEducation,
  deleteEducation as deleteEducationRepo,
  updateEducation as updateEducationRepo,
} from "@/server/profile/profile.repo";


export async function addEducation(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const institution = (formData.get("institution") as string | null)?.trim();
  const degree = (formData.get("degree") as string | null)?.trim() || null;
  const field = (formData.get("field") as string | null)?.trim() || null;
  const startYear = Number(formData.get("startYear")) || null;
  const endYear = Number(formData.get("endYear")) || null;
  const details = (formData.get("details") as string | null)?.trim() || null;
  if (!profileId || !institution) return;

  await createEducation({ profileId, institution, degree, field, startYear, endYear, details });
  revalidatePath("/profile");
}

export async function deleteEducation(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteEducationRepo(id);
  revalidatePath("/profile");
}

export async function updateEducation(formData: FormData) {
  const id = Number(formData.get("id"));
  const institution = (formData.get("institution") as string | null)?.trim();
  const degree = (formData.get("degree") as string | null)?.trim() || null;
  const field = (formData.get("field") as string | null)?.trim() || null;
  const startYear = Number(formData.get("startYear")) || null;
  const endYear = Number(formData.get("endYear")) || null;
  const details = (formData.get("details") as string | null)?.trim() || null;
  if (!id || !institution) return;

  await updateEducationRepo(id, { institution, degree, field, startYear, endYear, details });
  revalidatePath("/profile");
}
