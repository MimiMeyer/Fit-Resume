"use server";

import { revalidatePath } from "next/cache";
import {
  upsertProfileDetails as upsertProfileDetailsRepo,
} from "@/server/profile/profile.repo";


export async function updateProfileDetails(formData: FormData) {
  const fullName = (formData.get("fullName") as string | null)?.trim();
  if (!fullName) throw new Error("Full name is required");

  const headline = (formData.get("headline") as string | null)?.trim() || null;
  const summary = (formData.get("summary") as string | null)?.trim() || null;
  const title = (formData.get("title") as string | null)?.trim() || null;
  const email = (formData.get("email") as string | null)?.trim() || null;
  const phone = (formData.get("phone") as string | null)?.trim() || null;
  const location = (formData.get("location") as string | null)?.trim() || null;
  const githubUrl = (formData.get("githubUrl") as string | null)?.trim() || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string | null)?.trim() || null;
  const websiteUrl = (formData.get("websiteUrl") as string | null)?.trim() || null;

  await upsertProfileDetailsRepo({
    fullName,
    headline,
    summary,
    title,
    email,
    phone,
    location,
    githubUrl,
    linkedinUrl,
    websiteUrl,
  });

  revalidatePath("/profile");
}
