"use client";

import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
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

export function validateHeaderDraft(draft: TailorHeaderDraft): string | null {
  if (isBlankString(draft.fullName)) return "Full name is required.";
  return null;
}

export function validateExperiences(items: TailorExperienceDraft[]): string | null {
  const normalized = normalizeList(items, (e) =>
    allBlank([e.role, e.company, e.location, e.period, e.impact]),
  );
  const invalid = normalized.find((e) => isBlankString(e.role) || isBlankString(e.company));
  if (invalid) return "Each experience needs at least Role and Company (or delete the blank item).";
  return null;
}

export function validateProjects(items: TailorProjectDraft[]): string | null {
  const normalized = normalizeList(items, (p) =>
    allBlank([p.title, p.description, p.link, (p.technologies || []).join(",")]),
  );
  const invalid = normalized.find((p) => isBlankString(p.title));
  if (invalid) return "Each project needs a Title (or delete the blank item).";
  return null;
}

export function validateSkills(items: TailorSkillDraft[]): string | null {
  const normalized = normalizeList(items, (s) => allBlank([s.name, s.category]));
  const invalid = normalized.find((s) => isBlankString(s.name) || isBlankString(s.category));
  if (invalid) return "Each skill needs both Skill and Category (or delete the blank item).";
  return null;
}

export function validateEducations(items: TailorEducationDraft[]): string | null {
  const normalized = normalizeList(items, (e) => allBlank([e.institution, e.degree, e.field, e.details]));
  const invalid = normalized.find((e) => isBlankString(e.institution));
  if (invalid) return "Each education item needs an Institution (or delete the blank item).";
  return null;
}

export function validateCertifications(items: TailorCertificationDraft[]): string | null {
  const normalized = normalizeList(items, (c) => allBlank([c.name, c.issuer, c.credentialUrl]));
  const invalid = normalized.find((c) => isBlankString(c.name));
  if (invalid) return "Each certification needs a Name (or delete the blank item).";
  return null;
}
