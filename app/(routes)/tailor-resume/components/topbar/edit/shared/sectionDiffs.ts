import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorSkillDraft,
} from "../../../../model/edit-state";
import { normalizeKey, normalizeText } from "./diffUtils";

export function headerEquals(a: TailorHeaderDraft, b: TailorHeaderDraft) {
  return (
    normalizeText(a.fullName) === normalizeText(b.fullName) &&
    normalizeText(a.title) === normalizeText(b.title) &&
    normalizeText(a.summary) === normalizeText(b.summary) &&
    normalizeText(a.email) === normalizeText(b.email) &&
    normalizeText(a.phone) === normalizeText(b.phone) &&
    normalizeText(a.location) === normalizeText(b.location) &&
    normalizeText(a.websiteUrl) === normalizeText(b.websiteUrl) &&
    normalizeText(a.linkedinUrl) === normalizeText(b.linkedinUrl) &&
    normalizeText(a.githubUrl) === normalizeText(b.githubUrl)
  );
}

function normalizeBullets(items: string[]) {
  return items.map((b) => normalizeText(b)).filter(Boolean);
}

export function experienceKeys(items: TailorExperienceDraft[]) {
  return items.map((e) =>
    [
      normalizeKey(e.role),
      normalizeKey(e.company),
      normalizeKey(e.location),
      normalizeKey(e.period),
      normalizeBullets(e.impactBullets || []).join("\n"),
    ].join("|"),
  );
}

export function experiencesEqual(a: TailorExperienceDraft[], b: TailorExperienceDraft[]) {
  const aKeys = experienceKeys(a);
  const bKeys = experienceKeys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((val, idx) => val === bKeys[idx]);
}

export function projectKeys(items: TailorProjectDraft[]) {
  return items.map((p) =>
    [
      normalizeKey(p.title),
      normalizeKey(p.description),
      normalizeKey(p.link),
      [...(p.technologies || [])].map((t) => normalizeKey(t)).sort().join(","),
    ].join("|"),
  );
}

export function projectsEqual(a: TailorProjectDraft[], b: TailorProjectDraft[]) {
  const aKeys = projectKeys(a);
  const bKeys = projectKeys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((val, idx) => val === bKeys[idx]);
}

export function skillKeys(items: TailorSkillDraft[]) {
  return items.map((s) => `${normalizeKey(s.category)}|${normalizeKey(s.name)}`);
}

export function skillsEqual(a: TailorSkillDraft[], b: TailorSkillDraft[]) {
  const signature = (items: TailorSkillDraft[]) => {
    const order: string[] = [];
    const byCategory = new Map<string, string[]>();

    for (const item of items) {
      const category = normalizeKey(item.category);
      const name = normalizeKey(item.name);
      if (!category || !name) continue;
      const existing = byCategory.get(category);
      if (!existing) {
        byCategory.set(category, [name]);
        order.push(category);
        continue;
      }
      existing.push(name);
    }

    return order.map((category) => {
      const skills = byCategory.get(category) ?? [];
      return `${category}:${skills.join(",")}`;
    });
  };

  const aSig = signature(a);
  const bSig = signature(b);
  if (aSig.length !== bSig.length) return false;
  return aSig.every((val, idx) => val === bSig[idx]);
}

export function educationKeys(items: TailorEducationDraft[]) {
  return items.map((e) =>
    [
      normalizeKey(e.institution),
      normalizeKey(e.degree),
      normalizeKey(e.field),
      String(e.startYear ?? ""),
      String(e.endYear ?? ""),
      normalizeKey(e.details),
    ].join("|"),
  );
}

export function educationsEqual(a: TailorEducationDraft[], b: TailorEducationDraft[]) {
  const aKeys = educationKeys(a);
  const bKeys = educationKeys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((val, idx) => val === bKeys[idx]);
}

export function certificationKeys(items: TailorCertificationDraft[]) {
  return items.map((c) =>
    [
      normalizeKey(c.name),
      normalizeKey(c.issuer),
      String(c.issuedYear ?? ""),
      normalizeKey(c.credentialUrl),
    ].join("|"),
  );
}

export function certificationsEqual(a: TailorCertificationDraft[], b: TailorCertificationDraft[]) {
  const aKeys = certificationKeys(a);
  const bKeys = certificationKeys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((val, idx) => val === bKeys[idx]);
}
