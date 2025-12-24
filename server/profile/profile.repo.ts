"use server";

import "server-only";

import { prisma } from "@/server/db/prisma";
import type { Category } from "@/types/category";
import type { Certification } from "@/types/certification";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { Profile } from "@/types/profile";
import type { Project } from "@/types/project";
import type { Skill } from "@/types/skill";

// ===== Internal DTOs (server-only) =====

export type ProfileDetailsInput = Pick<
  Profile,
  | "fullName"
  | "headline"
  | "summary"
  | "title"
  | "email"
  | "phone"
  | "location"
  | "githubUrl"
  | "linkedinUrl"
  | "websiteUrl"
>;

export type ExperienceInput = { profileId: number } & Pick<
  Experience,
  "role" | "company" | "location" | "period" | "impact"
>;

export type ProjectInput = { profileId: number; technologies: string[] } & Pick<
  Project,
  "title" | "description" | "link"
>;

export type EducationInput = { profileId: number } & Pick<
  Education,
  "institution" | "degree" | "field" | "startYear" | "endYear" | "details"
>;

export type CertificationInput = { profileId: number } & Pick<
  Certification,
  "name" | "issuer" | "issuedYear" | "credentialUrl"
>;

export type SkillInput = { profileId: number; categoryName?: string | null } & Pick<
  Skill,
  "name"
>;

export type CategoryWithCount = Category & { count: number };

// ===== Profile =====
export async function getProfileWithRelations() {
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


export async function upsertProfileDetails(input: ProfileDetailsInput) {
  const existing = await prisma.profile.findFirst({ select: { id: true } });
  return prisma.profile.upsert({
    where: { id: existing?.id ?? -1 },
    update: {
      fullName: input.fullName,
      headline: input.headline ?? null,
      summary: input.summary ?? null,
      title: input.title ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      location: input.location ?? null,
      githubUrl: input.githubUrl ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      websiteUrl: input.websiteUrl ?? null,
    },
    create: {
      fullName: input.fullName,
      headline: input.headline ?? null,
      summary: input.summary ?? null,
      title: input.title ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      location: input.location ?? null,
      githubUrl: input.githubUrl ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      websiteUrl: input.websiteUrl ?? null,
    },
  });
}

// ===== Experiences =====

export async function createExperience(input: ExperienceInput) {
  return prisma.experience.create({ data: input });
}

export async function deleteExperience(id: number) {
  return prisma.experience.delete({ where: { id } });
}

export async function updateExperience(
  id: number,
  input: Omit<ExperienceInput, "profileId">,
) {
  return prisma.experience.update({
    where: { id },
    data: input,
  });
}

// ===== Projects =====

export async function createProject(input: ProjectInput) {
  return prisma.project.create({ data: input });
}

export async function deleteProject(id: number) {
  return prisma.project.delete({ where: { id } });
}

export async function updateProject(id: number, input: Omit<ProjectInput, "profileId">) {
  return prisma.project.update({
    where: { id },
    data: input,
  });
}

// ===== Education =====

export async function createEducation(input: EducationInput) {
  return prisma.education.create({ data: input });
}

export async function deleteEducation(id: number) {
  return prisma.education.delete({ where: { id } });
}

export async function updateEducation(
  id: number,
  input: Omit<EducationInput, "profileId">,
) {
  return prisma.education.update({
    where: { id },
    data: input,
  });
}

// ===== Certifications =====

export async function createCertification(input: CertificationInput) {
  return prisma.certification.create({ data: input });
}

export async function deleteCertification(id: number) {
  return prisma.certification.delete({ where: { id } });
}

export async function updateCertification(
  id: number,
  input: Omit<CertificationInput, "profileId">,
) {
  return prisma.certification.update({
    where: { id },
    data: input,
  });
}

// ===== Categories =====

async function getOrCreateCategoryId(name?: string | null) {
  const normalized = name?.trim();
  if (!normalized) return null;
  const upper = normalized.toUpperCase();
  const category = await prisma.category.upsert({
    where: { name: upper },
    update: {},
    create: { name: upper },
  });
  return category.id;
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { skills: true } } },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count.skills,
  }));
}

export async function updateCategoryName(id: number, name: string) {
  const nextName = name.trim();
  if (!id || !nextName) {
    throw new Error("Category id and name are required");
  }

  return prisma.category.update({
    where: { id },
    data: { name: nextName.toUpperCase() },
  });
}

export async function deleteCategory(id: number) {
  if (!id) {
    throw new Error("Category id is required");
  }

  await prisma.skill.deleteMany({ where: { categoryId: id } });
  return prisma.category.delete({ where: { id } });
}

// ===== Skills =====

export async function upsertSkill(input: SkillInput) {
  const categoryId = await getOrCreateCategoryId(input.categoryName);

  return prisma.skill.upsert({
    where: { name: input.name },
    update: {
      categoryId,
      profileId: input.profileId,
    },
    create: {
      name: input.name,
      categoryId,
      profileId: input.profileId,
    },
  });
}

export async function deleteSkill(id: number) {
  return prisma.skill.delete({ where: { id } });
}

export async function updateSkill(id: number, input: Omit<SkillInput, "profileId">) {
  const categoryId = await getOrCreateCategoryId(input.categoryName);
  return prisma.skill.update({
    where: { id },
    data: { name: input.name, categoryId },
  });
}
