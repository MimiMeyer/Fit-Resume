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

export type SkillInput = { profileId: number; categoryName: string } & Pick<
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

  return profile as unknown as Profile;
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

export async function saveExperiencesSection(input: {
  profileId: number;
  experiences: Array<{
    id?: number;
    role: string;
    company: string;
    location: string;
    period: string;
    impact: string;
  }>;
}) {
  const profileId = Number(input.profileId);
  if (!profileId) throw new Error("profileId is required");

  const incoming = input.experiences
    .map((e) => ({
      id: e.id ? Number(e.id) : null,
      role: e.role.trim(),
      company: e.company.trim(),
      location: e.location.trim() || null,
      period: e.period.trim() || null,
      impact: e.impact.trim() || null,
    }))
    .filter((e) => e.role && e.company);

  const existing = await prisma.experience.findMany({ where: { profileId }, select: { id: true } });
  const incomingIds = new Set(incoming.map((e) => e.id).filter(Boolean) as number[]);
  const toDelete = existing.map((e) => e.id).filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.experience.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const exp of incoming) {
      if (exp.id) {
        await tx.experience.update({
          where: { id: exp.id },
          data: {
            role: exp.role,
            company: exp.company,
            location: exp.location,
            period: exp.period,
            impact: exp.impact,
          },
        });
      } else {
        await tx.experience.create({
          data: {
            profileId,
            role: exp.role,
            company: exp.company,
            location: exp.location,
            period: exp.period,
            impact: exp.impact,
          },
        });
      }
    }
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

export async function saveProjectsSection(input: {
  profileId: number;
  projects: Array<{
    id?: number;
    title: string;
    description: string;
    link: string;
    technologies: string[];
  }>;
}) {
  const profileId = Number(input.profileId);
  if (!profileId) throw new Error("profileId is required");

  const incoming = input.projects
    .map((p) => ({
      id: p.id ? Number(p.id) : null,
      title: p.title.trim(),
      description: p.description.trim() || null,
      link: p.link.trim() || null,
      technologies: (p.technologies || []).map((t) => t.trim()).filter(Boolean),
    }))
    .filter((p) => p.title);

  const existing = await prisma.project.findMany({ where: { profileId }, select: { id: true } });
  const incomingIds = new Set(incoming.map((p) => p.id).filter(Boolean) as number[]);
  const toDelete = existing.map((p) => p.id).filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.project.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const proj of incoming) {
      if (proj.id) {
        await tx.project.update({
          where: { id: proj.id },
          data: {
            title: proj.title,
            description: proj.description,
            link: proj.link,
            technologies: proj.technologies,
          },
        });
      } else {
        await tx.project.create({
          data: {
            profileId,
            title: proj.title,
            description: proj.description,
            link: proj.link,
            technologies: proj.technologies,
          },
        });
      }
    }
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

export async function saveEducationSection(input: {
  profileId: number;
  educations: Array<{
    id?: number;
    institution: string;
    degree: string;
    field: string;
    startYear: number | null;
    endYear: number | null;
    details: string;
  }>;
}) {
  const profileId = Number(input.profileId);
  if (!profileId) throw new Error("profileId is required");

  const incoming = input.educations
    .map((e) => ({
      id: e.id ? Number(e.id) : null,
      institution: e.institution.trim(),
      degree: e.degree.trim() || null,
      field: e.field.trim() || null,
      startYear: e.startYear ?? null,
      endYear: e.endYear ?? null,
      details: e.details.trim() || null,
    }))
    .filter((e) => e.institution);

  const existing = await prisma.education.findMany({ where: { profileId }, select: { id: true } });
  const incomingIds = new Set(incoming.map((e) => e.id).filter(Boolean) as number[]);
  const toDelete = existing.map((e) => e.id).filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.education.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const edu of incoming) {
      if (edu.id) {
        await tx.education.update({
          where: { id: edu.id },
          data: {
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startYear: edu.startYear,
            endYear: edu.endYear,
            details: edu.details,
          },
        });
      } else {
        await tx.education.create({
          data: {
            profileId,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startYear: edu.startYear,
            endYear: edu.endYear,
            details: edu.details,
          },
        });
      }
    }
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

export async function saveCertificationsSection(input: {
  profileId: number;
  certifications: Array<{
    id?: number;
    name: string;
    issuer: string;
    issuedYear: number | null;
    credentialUrl: string;
  }>;
}) {
  const profileId = Number(input.profileId);
  if (!profileId) throw new Error("profileId is required");

  const incoming = input.certifications
    .map((c) => ({
      id: c.id ? Number(c.id) : null,
      name: c.name.trim(),
      issuer: c.issuer.trim() || null,
      issuedYear: c.issuedYear ?? null,
      credentialUrl: c.credentialUrl.trim() || null,
    }))
    .filter((c) => c.name);

  const existing = await prisma.certification.findMany({ where: { profileId }, select: { id: true } });
  const incomingIds = new Set(incoming.map((c) => c.id).filter(Boolean) as number[]);
  const toDelete = existing.map((c) => c.id).filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.certification.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const cert of incoming) {
      if (cert.id) {
        await tx.certification.update({
          where: { id: cert.id },
          data: {
            name: cert.name,
            issuer: cert.issuer,
            issuedYear: cert.issuedYear,
            credentialUrl: cert.credentialUrl,
          },
        });
      } else {
        await tx.certification.create({
          data: {
            profileId,
            name: cert.name,
            issuer: cert.issuer,
            issuedYear: cert.issuedYear,
            credentialUrl: cert.credentialUrl,
          },
        });
      }
    }
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

export async function saveSkillsSection(input: {
  profileId: number;
  skills: Array<{ id?: number; name: string; category: string }>;
}) {
  const profileId = Number(input.profileId);
  if (!profileId) throw new Error("profileId is required");

  const incoming = input.skills
    .map((s) => ({
      id: s.id ? Number(s.id) : null,
      name: s.name.trim(),
      categoryName: s.category.trim(),
    }))
    .filter((s) => s.name && s.categoryName);

  const existing = await prisma.skill.findMany({ where: { profileId }, select: { id: true } });
  const incomingIds = new Set(incoming.map((s) => s.id).filter(Boolean) as number[]);
  const toDelete = existing.map((s) => s.id).filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.skill.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const s of incoming) {
      const category = await tx.category.upsert({
        where: { name: s.categoryName.toUpperCase() },
        update: {},
        create: { name: s.categoryName.toUpperCase() },
      });

      if (s.id) {
        await tx.skill.update({
          where: { id: s.id },
          data: { name: s.name, categoryId: category.id, profileId },
        });
      } else {
        await tx.skill.upsert({
          where: { name: s.name },
          update: { profileId, categoryId: category.id },
          create: { name: s.name, profileId, categoryId: category.id },
        });
      }
    }
  });
}
