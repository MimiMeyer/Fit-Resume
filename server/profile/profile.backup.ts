import "server-only";

import { prisma } from "@/server/db/prisma";
import type { Profile } from "@/types/profile";
import type { ProfileBackupV1 } from "@/types/profile-backup";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function asNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  return undefined;
}

function normalizeCategoryName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.toUpperCase() : "UNCATEGORIZED";
}

export function toProfileBackup(profile: Profile): ProfileBackupV1 {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      fullName: profile.fullName,
      headline: profile.headline ?? null,
      summary: profile.summary ?? null,
      title: profile.title ?? null,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      location: profile.location ?? null,
      linkedinUrl: profile.linkedinUrl ?? null,
      githubUrl: profile.githubUrl ?? null,
      websiteUrl: profile.websiteUrl ?? null,
    },
    experiences: (profile.experiences ?? []).map((e) => ({
      role: e.role,
      company: e.company,
      location: e.location ?? null,
      period: e.period ?? null,
      impact: e.impact ?? null,
    })),
    projects: (profile.projects ?? []).map((p) => ({
      title: p.title,
      description: p.description ?? null,
      link: p.link ?? null,
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
    })),
    educations: (profile.educations ?? []).map((e) => ({
      institution: e.institution,
      degree: e.degree ?? null,
      field: e.field ?? null,
      startYear: e.startYear ?? null,
      endYear: e.endYear ?? null,
      details: e.details ?? null,
    })),
    certs: (profile.certs ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer ?? null,
      issuedYear: c.issuedYear ?? null,
      credentialUrl: c.credentialUrl ?? null,
    })),
    skills: (profile.skills ?? []).map((s) => ({
      name: s.name,
      category: normalizeCategoryName(s.category?.name || "UNCATEGORIZED"),
    })),
  };
}

export function parseProfileBackupV1(value: unknown): ProfileBackupV1 {
  if (!isRecord(value)) throw new Error("Invalid JSON: expected an object.");
  if (value.schemaVersion !== 1) {
    throw new Error("Unsupported backup version.");
  }

  const profile = isRecord(value.profile) ? value.profile : null;
  if (!profile || !isString(profile.fullName) || !profile.fullName.trim()) {
    throw new Error("Backup is missing a valid profile.fullName.");
  }

  const experiences = Array.isArray(value.experiences) ? value.experiences : [];
  const projects = Array.isArray(value.projects) ? value.projects : [];
  const educations = Array.isArray(value.educations) ? value.educations : [];
  const certs = Array.isArray(value.certs) ? value.certs : [];
  const skills = Array.isArray(value.skills) ? value.skills : [];

  const experienceRecords = experiences.filter(isRecord);
  const projectRecords = projects.filter(isRecord);
  const educationRecords = educations.filter(isRecord);
  const certRecords = certs.filter(isRecord);
  const skillRecords = skills.filter(isRecord);

  return {
    schemaVersion: 1,
    exportedAt: isString(value.exportedAt) ? value.exportedAt : new Date().toISOString(),
    profile: {
      fullName: profile.fullName.trim(),
      headline: asNullableString(profile.headline) ?? null,
      summary: asNullableString(profile.summary) ?? null,
      title: asNullableString(profile.title) ?? null,
      email: asNullableString(profile.email) ?? null,
      phone: asNullableString(profile.phone) ?? null,
      location: asNullableString(profile.location) ?? null,
      linkedinUrl: asNullableString(profile.linkedinUrl) ?? null,
      githubUrl: asNullableString(profile.githubUrl) ?? null,
      websiteUrl: asNullableString(profile.websiteUrl) ?? null,
    },
    experiences: experienceRecords
      .map((e) => ({
        role: isString(e.role) ? e.role.trim() : "",
        company: isString(e.company) ? e.company.trim() : "",
        location: asNullableString(e.location) ?? null,
        period: asNullableString(e.period) ?? null,
        impact: asNullableString(e.impact) ?? null,
      }))
      .filter((e) => e.role && e.company),
    projects: projectRecords
      .map((p) => ({
        title: isString(p.title) ? p.title.trim() : "",
        description: asNullableString(p.description) ?? null,
        link: asNullableString(p.link) ?? null,
        technologies: Array.isArray(p.technologies)
          ? p.technologies.filter(isString).map((t) => t.trim()).filter(Boolean)
          : [],
      }))
      .filter((p) => p.title),
    educations: educationRecords
      .map((e) => ({
        institution: isString(e.institution) ? e.institution.trim() : "",
        degree: asNullableString(e.degree) ?? null,
        field: asNullableString(e.field) ?? null,
        startYear: typeof e.startYear === "number" ? e.startYear : null,
        endYear: typeof e.endYear === "number" ? e.endYear : null,
        details: asNullableString(e.details) ?? null,
      }))
      .filter((e) => e.institution),
    certs: certRecords
      .map((c) => ({
        name: isString(c.name) ? c.name.trim() : "",
        issuer: asNullableString(c.issuer) ?? null,
        issuedYear: typeof c.issuedYear === "number" ? c.issuedYear : null,
        credentialUrl: asNullableString(c.credentialUrl) ?? null,
      }))
      .filter((c) => c.name),
    skills: skillRecords
      .map((s) => ({
        name: isString(s.name) ? s.name.trim() : "",
        category: normalizeCategoryName(isString(s.category) ? s.category : "UNCATEGORIZED"),
      }))
      .filter((s) => s.name),
  };
}

export async function replaceProfileFromBackup(raw: unknown) {
  const backup = parseProfileBackupV1(raw);
  const details = backup.profile;

  const existing = await prisma.profile.findFirst({ select: { id: true } });
  const profile = existing
    ? await prisma.profile.update({
        where: { id: existing.id },
        data: details,
        select: { id: true },
      })
    : await prisma.profile.create({
        data: details,
        select: { id: true },
      });

  const profileId = profile.id;

  const categoryNames = Array.from(
    new Set((backup.skills ?? []).map((s) => normalizeCategoryName(s.category))),
  );

  await prisma.$transaction(async (tx) => {
    await tx.experience.deleteMany({ where: { profileId } });
    await tx.project.deleteMany({ where: { profileId } });
    await tx.education.deleteMany({ where: { profileId } });
    await tx.certification.deleteMany({ where: { profileId } });
    await tx.skill.deleteMany({ where: { profileId } });

    for (const name of categoryNames) {
      await tx.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    const categoryRows = await tx.category.findMany({
      where: { name: { in: categoryNames } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categoryRows.map((c) => [c.name, c.id]));

    if (backup.experiences.length) {
      await tx.experience.createMany({
        data: backup.experiences.map((e) => ({
          profileId,
          role: e.role,
          company: e.company,
          location: e.location ?? null,
          period: e.period ?? null,
          impact: e.impact ?? null,
        })),
      });
    }

    if (backup.projects.length) {
      await tx.project.createMany({
        data: backup.projects.map((p) => ({
          profileId,
          title: p.title,
          description: p.description ?? null,
          link: p.link ?? null,
          technologies: p.technologies ?? [],
        })),
      });
    }

    if (backup.educations.length) {
      await tx.education.createMany({
        data: backup.educations.map((e) => ({
          profileId,
          institution: e.institution,
          degree: e.degree ?? null,
          field: e.field ?? null,
          startYear: e.startYear ?? null,
          endYear: e.endYear ?? null,
          details: e.details ?? null,
        })),
      });
    }

    if (backup.certs.length) {
      await tx.certification.createMany({
        data: backup.certs.map((c) => ({
          profileId,
          name: c.name,
          issuer: c.issuer ?? null,
          issuedYear: c.issuedYear ?? null,
          credentialUrl: c.credentialUrl ?? null,
        })),
      });
    }

    if (backup.skills.length) {
      for (const skill of backup.skills) {
        const categoryName = normalizeCategoryName(skill.category);
        const categoryId = categoryMap.get(categoryName);
        if (!categoryId) continue;

        await tx.skill.upsert({
          where: { name: skill.name },
          update: { profileId, categoryId },
          create: { profileId, name: skill.name, categoryId },
        });
      }
    }
  });
}
