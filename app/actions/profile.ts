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
