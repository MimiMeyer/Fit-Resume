import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorSkillDraft,
} from "../../../../model/edit-state";
import { equalStringSets, normalizeKey, normalizeText } from "./diffUtils";

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
  return equalStringSets(experienceKeys(a), experienceKeys(b));
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
  return equalStringSets(projectKeys(a), projectKeys(b));
}

export function skillKeys(items: TailorSkillDraft[]) {
  return items.map((s) => `${normalizeKey(s.category)}|${normalizeKey(s.name)}`);
}

export function skillsEqual(a: TailorSkillDraft[], b: TailorSkillDraft[]) {
  return equalStringSets(skillKeys(a), skillKeys(b));
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
  return equalStringSets(educationKeys(a), educationKeys(b));
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
  return equalStringSets(certificationKeys(a), certificationKeys(b));
}
