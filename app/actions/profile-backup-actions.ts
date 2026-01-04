"use server";

import { revalidatePath } from "next/cache";
import { getProfileWithRelations } from "@/server/profile/profile.repo";
import { replaceProfileFromBackup, toProfileBackup } from "@/server/profile/profile.backup";
import type { ProfileBackup } from "@/types/profile-backup";

export async function exportProfileBackup(): Promise<ProfileBackup> {
  const profile = await getProfileWithRelations();
  if (!profile) {
    throw new Error("No profile found.");
  }
  return toProfileBackup(profile);
}

export async function importProfileBackup(backup: unknown) {
  await replaceProfileFromBackup(backup);
  revalidatePath("/profile");
  revalidatePath("/tailor-resume");
}

