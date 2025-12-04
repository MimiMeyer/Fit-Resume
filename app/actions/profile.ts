"use server";

import { Prisma } from "@prisma/client";
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
}

export async function addExperience(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const role = (formData.get("role") as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const period = (formData.get("period") as string | null)?.trim() || null;
  const impact = (formData.get("impact") as string | null)?.trim() || null;
  if (!profileId || !role || !company) return;
  await prisma.experience.create({ data: { profileId, role, company, period, impact } });
}

export async function deleteExperience(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.experience.delete({ where: { id } });
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
}

export async function deleteProject(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.project.delete({ where: { id } });
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
}

export async function deleteEducation(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.education.delete({ where: { id } });
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
}

export async function deleteCertification(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.certification.delete({ where: { id } });
}

export async function addSkill(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const name = (formData.get("name") as string | null)?.trim();
  const category = (formData.get("category") as string | null)?.trim() || undefined;
  if (!profileId || !name) return;
  const skill = await prisma.skill.upsert({
    where: { name },
    update: {
      category: category ? (category.toUpperCase() as Prisma.SkillCategory) : undefined,
    },
    create: {
      name,
      category: category ? (category.toUpperCase() as Prisma.SkillCategory) : undefined,
    },
  });
  await prisma.profileSkill.upsert({
    where: { profileId_skillId: { profileId, skillId: skill.id } },
    update: {},
    create: { profileId, skillId: skill.id },
  });
}

export async function deleteSkill(formData: FormData) {
  const profileId = Number(formData.get("profileId"));
  const skillId = Number(formData.get("skillId"));
  if (!profileId || !skillId) return;
  await prisma.profileSkill.delete({
    where: { profileId_skillId: { profileId, skillId } },
  });
}

export async function getProfile() {
  return prisma.profile.findFirst({
    include: {
      experiences: true,
      projects: true,
      educations: true,
      certs: true,
      skills: { include: { skill: true } },
    },
    orderBy: { createdAt: "desc" },
  });
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
          const category = skill.category
            ? (skill.category.trim().toUpperCase() as Prisma.SkillCategory)
            : undefined;
          return { name: skill.name?.trim(), category };
        })
        .filter(
          (skill): skill is { name: string; category?: Prisma.SkillCategory } =>
            Boolean(skill.name),
        );

      const names = normalized.map((s) => s.name);
      if (names.length) {
        const existingSkills = await tx.skill.findMany({
          where: { name: { in: names } },
        });
        const existingNames = new Set(existingSkills.map((s) => s.name));
        const toCreate = normalized.filter((skill) => !existingNames.has(skill.name));

        if (toCreate.length) {
          await tx.skill.createMany({
            data: toCreate.map((skill) => ({
              name: skill.name,
              category: skill.category,
            })),
            skipDuplicates: true,
          });
        }

        const skills = await tx.skill.findMany({ where: { name: { in: names } } });
        await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });
        if (skills.length) {
          await tx.profileSkill.createMany({
            data: skills.map((skill) => ({
              profileId: profile.id,
              skillId: skill.id,
            })),
          });
        }
      } else {
        await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });
      }
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
        skills: { include: { skill: true } },
      },
    });
  });
}
