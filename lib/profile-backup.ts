import type { Profile } from "@/types/profile";
import type { ProfileBackup } from "@/types/profile-backup";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function asNullableString(value: unknown): string | null {
  if (typeof value === "string") return value;
  return null;
}

function normalizeCategoryName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.toUpperCase() : "UNCATEGORIZED";
}

function newId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function toProfileBackup(profile: Profile): ProfileBackup {
  return {
    exportedAt: new Date().toISOString(),
    profile: {
      fullName: profile.fullName,
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
      impactBullets: (e.impactBullets ?? []).map((line) => line.trim()).filter(Boolean),
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

export function parseProfileBackup(value: unknown): ProfileBackup {
  if (!isRecord(value)) throw new Error("Invalid JSON: expected an object.");

  const profile = isRecord(value.profile) ? value.profile : null;
  if (!profile || !isString(profile.fullName) || !profile.fullName.trim()) {
    throw new Error("Backup is missing a valid profile.fullName.");
  }

  const experiences = Array.isArray(value.experiences) ? value.experiences.filter(isRecord) : [];
  const projects = Array.isArray(value.projects) ? value.projects.filter(isRecord) : [];
  const educations = Array.isArray(value.educations) ? value.educations.filter(isRecord) : [];
  const certs = Array.isArray(value.certs) ? value.certs.filter(isRecord) : [];
  const skills = Array.isArray(value.skills) ? value.skills.filter(isRecord) : [];

  return {
    exportedAt: isString(value.exportedAt) ? value.exportedAt : new Date().toISOString(),
    profile: {
      fullName: profile.fullName.trim(),
      summary: asNullableString(profile.summary),
      title: asNullableString(profile.title),
      email: asNullableString(profile.email),
      phone: asNullableString(profile.phone),
      location: asNullableString(profile.location),
      linkedinUrl: asNullableString(profile.linkedinUrl),
      githubUrl: asNullableString(profile.githubUrl),
      websiteUrl: asNullableString(profile.websiteUrl),
    },
    experiences: experiences
      .map((e) => ({
        role: isString(e.role) ? e.role.trim() : "",
        company: isString(e.company) ? e.company.trim() : "",
        location: asNullableString(e.location),
        period: asNullableString(e.period),
        impactBullets: Array.isArray(e.impactBullets)
          ? e.impactBullets.filter(isString).map((t) => t.trim()).filter(Boolean)
          : [],
      }))
      .filter((e) => e.role && e.company),
    projects: projects
      .map((p) => ({
        title: isString(p.title) ? p.title.trim() : "",
        description: asNullableString(p.description),
        link: asNullableString(p.link),
        technologies: Array.isArray(p.technologies)
          ? p.technologies.filter(isString).map((t) => t.trim()).filter(Boolean)
          : [],
      }))
      .filter((p) => p.title),
    educations: educations
      .map((e) => ({
        institution: isString(e.institution) ? e.institution.trim() : "",
        degree: asNullableString(e.degree),
        field: asNullableString(e.field),
        startYear: typeof e.startYear === "number" ? e.startYear : null,
        endYear: typeof e.endYear === "number" ? e.endYear : null,
        details: asNullableString(e.details),
      }))
      .filter((e) => e.institution),
    certs: certs
      .map((c) => ({
        name: isString(c.name) ? c.name.trim() : "",
        issuer: asNullableString(c.issuer),
        issuedYear: typeof c.issuedYear === "number" ? c.issuedYear : null,
        credentialUrl: asNullableString(c.credentialUrl),
      }))
      .filter((c) => c.name),
    skills: skills
      .map((s) => ({
        name: isString(s.name) ? s.name.trim() : "",
        category: normalizeCategoryName(isString(s.category) ? s.category : "UNCATEGORIZED"),
      }))
      .filter((s) => s.name),
  };
}

export function profileFromBackup(backup: ProfileBackup, base?: Profile): Profile {
  const current = base ?? {
    id: 1,
    fullName: "",
    summary: null,
    title: null,
    email: null,
    phone: null,
    location: null,
    linkedinUrl: null,
    githubUrl: null,
    websiteUrl: null,
    experiences: [],
    projects: [],
    educations: [],
    certs: [],
    skills: [],
  };

  return {
    ...current,
    fullName: backup.profile.fullName,
    summary: backup.profile.summary ?? null,
    title: backup.profile.title ?? null,
    email: backup.profile.email ?? null,
    phone: backup.profile.phone ?? null,
    location: backup.profile.location ?? null,
    linkedinUrl: backup.profile.linkedinUrl ?? null,
    githubUrl: backup.profile.githubUrl ?? null,
    websiteUrl: backup.profile.websiteUrl ?? null,
    experiences: backup.experiences.map((e) => ({ id: newId(), ...e })),
    projects: backup.projects.map((p) => ({ id: newId(), ...p })),
    educations: backup.educations.map((e) => ({ id: newId(), ...e })),
    certs: backup.certs.map((c) => ({ id: newId(), ...c })),
    skills: backup.skills
      .map((s) => ({
        id: newId(),
        name: s.name,
        category: { name: normalizeCategoryName(s.category) },
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
