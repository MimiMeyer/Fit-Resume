"use server";

import { revalidatePath } from "next/cache";
import {
  createCertification as createCertificationRepo,
  deleteCertification as deleteCertificationRepo,
  saveCertificationsSection as saveCertificationsSectionRepo,
  updateCertification as updateCertificationRepo,
} from "@/server/profile/profile.repo";


export async function addCertification(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const name = (formData.get("name") as string | null)?.trim();
  const issuer = (formData.get("issuer") as string | null)?.trim() || null;
  const issuedYear = Number(formData.get("issuedYear")) || null;
  const credentialUrl = (formData.get("credentialUrl") as string | null)?.trim() || null;
  if (!profileId || !name) return;

  await createCertificationRepo({ profileId, name, issuer, issuedYear, credentialUrl });
  revalidatePath("/profile");
}

export async function deleteCertification(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteCertificationRepo(id);
  revalidatePath("/profile");
}

export async function updateCertification(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string | null)?.trim();
  const issuer = (formData.get("issuer") as string | null)?.trim() || null;
  const issuedYear = Number(formData.get("issuedYear")) || null;
  const credentialUrl = (formData.get("credentialUrl") as string | null)?.trim() || null;
  if (!id || !name) return;

  await updateCertificationRepo(id, { name, issuer, issuedYear, credentialUrl });
  revalidatePath("/profile");
}

export async function saveCertificationsSection(args: {
  profileId: number;
  certifications: Array<{
    id?: number;
    name: string;
    issuer: string;
    issuedYear: number | null;
    credentialUrl: string;
  }>;
}) {
  await saveCertificationsSectionRepo(args);

  revalidatePath("/profile");
  revalidatePath("/tailor-resume");
}
