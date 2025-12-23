"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ExperienceInput = {
  role: string;
  company: string;
  period?: string;
  impact?: string;
};

export type ProfileInput = {
  fullName: string;
  headline?: string;
  summary?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills?: SkillInput[];
  experiences?: ExperienceInput[];
  projects?: ProjectInput[];
  educations?: EducationInput[];
  certifications?: CertificationInput[];
};

export type ProjectInput = {
  title: string;
  description?: string;
  link?: string;
  technologies?: string[];
};

export type EducationInput = {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  details?: string;
};

export type CertificationInput = {
  name: string;
  issuer?: string;
  issuedYear?: number;
  credentialUrl?: string;
};

export type SkillInput = {
  name: string;
  category?: string;
};

async function getOrCreateCategory(name?: string | null) {
  const normalized = name?.trim();
  if (!normalized) return null;
  const upper = normalized.toUpperCase();
  const category = await prisma.category.upsert({
    where: { name: upper },
    update: {},
    create: { name: upper },
  });
  return category;
}

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

  const existing = await prisma.profile.findFirst({ select: { id: true } });
  await prisma.profile.upsert({
    where: { id: existing?.id ?? -1 },
    update: {
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
    },
    create: {
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
    },
  });
  revalidatePath("/about");
}

export async function addExperience(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const role = (formData.get("role") as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const period = (formData.get("period") as string | null)?.trim() || null;
  const impact = (formData.get("impact") as string | null)?.trim() || null;
  if (!profileId || !role || !company) return;
  await prisma.experience.create({ data: { profileId, role, company, location, period, impact } });
  revalidatePath("/about");
}

export async function deleteExperience(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/about");
}

export async function updateExperience(formData: FormData) {
  const id = Number(formData.get("id"));
  const role = (formData.get("role") as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const location = (formData.get("location") as string | null)?.trim() || null;
  const period = (formData.get("period") as string | null)?.trim() || null;
  const impact = (formData.get("impact") as string | null)?.trim() || null;
  if (!id || !role || !company) return;
  await prisma.experience.update({ where: { id }, data: { role, company, location, period, impact } });
  revalidatePath("/about");
}

export async function addProject(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const link = (formData.get("link") as string | null)?.trim() || null;
  const technologiesRaw = (formData.get("technologies") as string | null) || "";
  const technologies = technologiesRaw.split(",").map((t) => t.trim()).filter(Boolean);
  if (!profileId || !title) return;
  await prisma.project.create({ data: { profileId, title, description, link, technologies } });
  revalidatePath("/about");
}

export async function deleteProject(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.project.delete({ where: { id } });
  revalidatePath("/about");
}

export async function updateProject(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const link = (formData.get("link") as string | null)?.trim() || null;
  const technologiesRaw = (formData.get("technologies") as string | null) || "";
  const technologies = technologiesRaw.split(",").map((t) => t.trim()).filter(Boolean);
  if (!id || !title) return;
  await prisma.project.update({ where: { id }, data: { title, description, link, technologies } });
  revalidatePath("/about");
}

export async function addEducation(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const institution = (formData.get("institution") as string | null)?.trim();
  const degree = (formData.get("degree") as string | null)?.trim() || null;
  const field = (formData.get("field") as string | null)?.trim() || null;
  const startYear = Number(formData.get("startYear")) || null;
  const endYear = Number(formData.get("endYear")) || null;
  const details = (formData.get("details") as string | null)?.trim() || null;
  if (!profileId || !institution) return;
  await prisma.education.create({
    data: { profileId, institution, degree, field, startYear, endYear, details },
  });
  revalidatePath("/about");
}

export async function deleteEducation(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.education.delete({ where: { id } });
  revalidatePath("/about");
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
  await prisma.education.update({
    where: { id },
    data: { institution, degree, field, startYear, endYear, details },
  });
  revalidatePath("/about");
}

export async function addCertification(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const name = (formData.get("name") as string | null)?.trim();
  const issuer = (formData.get("issuer") as string | null)?.trim() || null;
  const issuedYear = Number(formData.get("issuedYear")) || null;
  const credentialUrl = (formData.get("credentialUrl") as string | null)?.trim() || null;
  if (!profileId || !name) return;
  await prisma.certification.create({
    data: { profileId, name, issuer, issuedYear, credentialUrl },
  });
  revalidatePath("/about");
}

export async function deleteCertification(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.certification.delete({ where: { id } });
  revalidatePath("/about");
}

export async function updateCertification(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string | null)?.trim();
  const issuer = (formData.get("issuer") as string | null)?.trim() || null;
  const issuedYear = Number(formData.get("issuedYear")) || null;
  const credentialUrl = (formData.get("credentialUrl") as string | null)?.trim() || null;
  if (!id || !name) return;
  await prisma.certification.update({
    where: { id },
    data: { name, issuer, issuedYear, credentialUrl },
  });
  revalidatePath("/about");
}

export async function addSkill(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const name = (formData.get("name") as string | null)?.trim();
  const categoryName = (formData.get("category") as string | null)?.trim();
  if (!profileId || !name) return;

  const category = await getOrCreateCategory(categoryName);

  await prisma.skill.upsert({
    where: { name },
    update: {
      categoryId: category?.id ?? null,
      profileId,
    },
    create: {
      name,
      categoryId: category?.id ?? null,
      profileId,
    },
  });
  revalidatePath("/about");
}

export async function deleteSkill(formData: FormData) {
  const skillId = Number(formData.get("skillId"));
  if (!skillId) return;
  await prisma.skill.delete({ where: { id: skillId } });
  revalidatePath("/about");
}

export async function updateSkill(formData: FormData) {
  const skillId = Number(formData.get("skillId"));
  const name = (formData.get("name") as string | null)?.trim();
  const categoryName = (formData.get("category") as string | null)?.trim();
  if (!skillId || !name) return;

  const category = await getOrCreateCategory(categoryName);
  
  await prisma.skill.update({
    where: { id: skillId },
    data: { name, categoryId: category?.id ?? null },
  });
  revalidatePath("/about");
}

export async function getProfile() {
  let profile = await prisma.profile.findFirst({
    include: {
      experiences: true,
      projects: true,
      educations: true,
      certs: true,
      skills: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { fullName: "Your Name" },
      include: {
        experiences: true,
        projects: true,
        educations: true,
        certs: true,
        skills: { include: { category: true } },
      },
    });
  }

  return profile;
}

export async function upsertProfile(input: ProfileInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.profile.findFirst({ select: { id: true } });
    const profile = await tx.profile.upsert({
      where: { id: existing?.id ?? -1 },
      update: {
        fullName: input.fullName,
        headline: input.headline,
        summary: input.summary,
        title: input.title,
        email: input.email,
        phone: input.phone,
        location: input.location,
        githubUrl: input.githubUrl,
        linkedinUrl: input.linkedinUrl,
        websiteUrl: input.websiteUrl,
      },
      create: {
        fullName: input.fullName,
        headline: input.headline,
        summary: input.summary,
        title: input.title,
        email: input.email,
        phone: input.phone,
        location: input.location,
        githubUrl: input.githubUrl,
        linkedinUrl: input.linkedinUrl,
        websiteUrl: input.websiteUrl,
      },
    });

    if (input.skills) {
      const normalized = input.skills
        .map((skill) => {
          const category = skill.category?.trim();
          return {
            name: skill.name?.trim(),
            category: category ? category.toUpperCase() : null,
          };
        })
        .filter((skill): skill is { name: string; category: string | null } => Boolean(skill.name));

      const categoryNames = Array.from(
        new Set(normalized.map((s) => s.category).filter((c): c is string => Boolean(c))),
      );

      if (categoryNames.length) {
        await tx.category.createMany({
          data: categoryNames.map((name) => ({ name })),
          skipDuplicates: true,
        });
      }

      const categories = categoryNames.length
        ? await tx.category.findMany({ where: { name: { in: categoryNames } } })
        : [];
      const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

      await tx.skill.deleteMany({ where: { profileId: profile.id } });

      if (normalized.length) {
        await tx.skill.createMany({
          data: normalized.map((skill) => ({
            name: skill.name,
            categoryId: skill.category ? categoryMap.get(skill.category) ?? null : null,
            profileId: profile.id,
          })),
          skipDuplicates: true,
        });
      }
    } else {
      await tx.skill.deleteMany({ where: { profileId: profile.id } });
    }

    if (input.experiences) {
      await tx.experience.deleteMany({ where: { profileId: profile.id } });
      if (input.experiences.length) {
        await tx.experience.createMany({
          data: input.experiences.map((exp) => ({
            profileId: profile.id,
            role: exp.role,
            company: exp.company,
            period: exp.period,
            impact: exp.impact,
          })),
        });
      }
    }

    if (input.projects) {
      await tx.project.deleteMany({ where: { profileId: profile.id } });
      if (input.projects.length) {
        await tx.project.createMany({
          data: input.projects.map((proj) => ({
            profileId: profile.id,
            title: proj.title,
            description: proj.description,
            link: proj.link,
            technologies: proj.technologies ?? [],
          })),
        });
      }
    }

    if (input.educations) {
      await tx.education.deleteMany({ where: { profileId: profile.id } });
      if (input.educations.length) {
        await tx.education.createMany({
          data: input.educations.map((edu) => ({
            profileId: profile.id,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startYear: edu.startYear,
            endYear: edu.endYear,
            details: edu.details,
          })),
        });
      }
    }

    if (input.certifications) {
      await tx.certification.deleteMany({ where: { profileId: profile.id } });
      if (input.certifications.length) {
        await tx.certification.createMany({
          data: input.certifications.map((cert) => ({
            profileId: profile.id,
            name: cert.name,
            issuer: cert.issuer,
            issuedYear: cert.issuedYear,
            credentialUrl: cert.credentialUrl,
          })),
        });
      }
    }

    return tx.profile.findUnique({
      where: { id: profile.id },
      include: {
        experiences: true,
        projects: true,
        educations: true,
        certs: true,
        skills: { include: { category: true } },
      },
    });
  });
}
