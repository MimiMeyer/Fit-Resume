"use client";

import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorProjectDraft,
  TailorSkillDraft,
} from "../../../../model/edit-state";

function isBlankString(val: string) {
  return val.trim().length === 0;
}

function allBlank(values: string[]) {
  return values.every((v) => isBlankString(v));
}

function normalizeList<T>(items: T[], isBlank: (item: T) => boolean) {
  return items.filter((i) => !isBlank(i));
}

export function normalizeExperiences(items: TailorExperienceDraft[]) {
  return normalizeList(items, (e) =>
    allBlank([e.role, e.company, e.location, e.period, (e.impactBullets || []).join(" ")]),
  );
}

export function normalizeProjects(items: TailorProjectDraft[]) {
  return normalizeList(items, (p) =>
    allBlank([p.title, p.description, p.link, (p.technologies || []).join(",")]),
  );
}

export function normalizeSkills(items: TailorSkillDraft[]) {
  return normalizeList(items, (s) => allBlank([s.name, s.category]));
}

export function normalizeEducations(items: TailorEducationDraft[]) {
  return normalizeList(items, (e) => allBlank([e.institution, e.degree, e.field, e.details]));
}

export function normalizeCertifications(items: TailorCertificationDraft[]) {
  return normalizeList(items, (c) => allBlank([c.name, c.issuer, c.credentialUrl]));
}
