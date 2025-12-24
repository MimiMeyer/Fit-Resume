"use server";

import { revalidatePath } from "next/cache";
import {
  createProject,
  deleteProject as deleteProjectRepo,
  updateProject as updateProjectRepo,
} from "@/server/profile/profile.repo";


export async function addProject(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const link = (formData.get("link") as string | null)?.trim() || null;
  const technologiesRaw = (formData.get("technologies") as string | null) || "";
  const technologies = technologiesRaw.split(",").map((t) => t.trim()).filter(Boolean);
  if (!profileId || !title) return;

  await createProject({ profileId, title, description, link, technologies });
  revalidatePath("/profile");
}

export async function deleteProject(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteProjectRepo(id);
  revalidatePath("/profile");
}

export async function updateProject(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const link = (formData.get("link") as string | null)?.trim() || null;
  const technologiesRaw = (formData.get("technologies") as string | null) || "";
  const technologies = technologiesRaw.split(",").map((t) => t.trim()).filter(Boolean);
  if (!id || !title) return;

  await updateProjectRepo(id, { title, description, link, technologies });
  revalidatePath("/profile");
}
