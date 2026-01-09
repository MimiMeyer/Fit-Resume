"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDefaultResumePdfFileName, sanitizePdfFileName } from "./components/preview/render/pdf";
import {
  DEFAULT_BORDERS,
  DEFAULT_FONT_FAMILIES,
  DEFAULT_FONT_SIZES,
  DEFAULT_SPACING,
} from "./types";
import type {
  ResumeBorders,
  ResumeBorderTargetKey,
  ResumePalette,
  ResumeFontFamilies,
  ResumeFontSizes,
  ResumeEducationForView,
  ResumeExperienceForView,
  ResumeLayoutMode,
  ResumeProjectForView,
  ResumeSectionId,
  ResumeSkillGroup,
  ResumeSpacing,
} from "./types";
import type { GeneratedResume } from "@/types/resume-agent";
import type { Profile } from "@/types/profile";
import { normalizeBullets } from "@/lib/normalizeBullets";
import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorResumeDraft,
  TailorSkillDraft,
} from "./model/edit-state";
import type { TailorResumePdfRequest } from "@/app/api/tailor-resume/pdf/types";

const SECTION_ORDER: ResumeSectionId[] = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

const emptyProfileFallback = {
  fullName: "",
  title: "",
  summary: "",
};

const TAILOR_RESUME_DRAFT_CACHE_KEY = "fitresume.tailorResumeDraft.v1";
const LEGACY_RESUME_EDITS_CACHE_KEY = "fitresume.tailorResumeEdits.v1";
const RESUME_FONT_CACHE_KEY = "fitresume.tailorResumeFontSizes.v1";
const RESUME_FONT_FAMILIES_CACHE_KEY = "fitresume.tailorResumeFontFamilies.v1";
const RESUME_BORDERS_CACHE_KEY = "fitresume.tailorResumeBorders.v1";
const RESUME_ACCENT_COLOR_CACHE_KEY = "fitresume.tailorResumeAccentColor.v1";
const RESUME_ACCENT_OPACITY_CACHE_KEY = "fitresume.tailorResumeAccentOpacity.v1";
const RESUME_SPACING_CACHE_KEY = "fitresume.tailorResumeSpacing.v1";
const RESUME_LAYOUT_MODE_CACHE_KEY = "fitresume.tailorResumeLayoutMode.v1";
const RESUME_SHOW_JD_CACHE_KEY = "fitresume.tailorResumeShowJobDescription.v1";

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function safeParseDraft(raw: string | null): TailorResumeDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TailorResumeDraft;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeParseAccentOpacity(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 1) return null;
  return parsed;
}

function safeParseAccentColor(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return null;
  return trimmed;
}

function safeParseLayoutMode(raw: string | null): ResumeLayoutMode | null {
  if (raw === "single" || raw === "two") return raw;
  return null;
}

function safeParseBoolean(raw: string | null): boolean | null {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

function safeParseFontSizes(raw: string | null): ResumeFontSizes | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeFontSizes>;
    const headingPx = Number(parsed.headingPx);
    const subtitlePx = Number(parsed.subtitlePx);
    const bodyPx = Number(parsed.bodyPx);
    if (!Number.isFinite(headingPx) || !Number.isFinite(subtitlePx) || !Number.isFinite(bodyPx)) {
      return null;
    }
    return { headingPx, subtitlePx, bodyPx };
  } catch {
    return null;
  }
}

function safeParseSpacing(raw: string | null): ResumeSpacing | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeSpacing>;
    const sectionGapPx = Number(parsed.sectionGapPx);
    const bulletGapPx = Number(parsed.bulletGapPx);
    const pagePaddingPx = Number(parsed.pagePaddingPx);
    if (
      !Number.isFinite(sectionGapPx) ||
      !Number.isFinite(bulletGapPx) ||
      !Number.isFinite(pagePaddingPx)
    ) {
      return null;
    }
    return { sectionGapPx, bulletGapPx, pagePaddingPx };
  } catch {
    return null;
  }
}

function safeParseFontFamilies(raw: string | null): ResumeFontFamilies | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeFontFamilies>;
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const heading = typeof parsed.heading === "string" ? parsed.heading.trim() : "";
    const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
    if (!title || !heading || !body) return null;
    return {
      title: normalizePdfFontFamily(title),
      heading: normalizePdfFontFamily(heading),
      body: normalizePdfFontFamily(body),
    };
  } catch {
    return null;
  }
}

function normalizePdfFontFamily(value: string) {
  const v = value.toLowerCase();
  if (v.includes("courier") || v.includes("mono")) return '"Courier New", Courier, monospace';
  if (v.includes("times") || v.includes("georgia") || v.includes("serif"))
    return '"Times New Roman", Times, serif';
  return "Arial, Helvetica, sans-serif";
}

function safeParseBorders(raw: string | null): ResumeBorders | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<
      ResumeBorders & { scope?: "none" | "outer" | "inner" | "both" }
    >;
    const widthPx = Number(parsed.widthPx);
    const style = parsed.style;
    const radius = parsed.radius;
    if (!Number.isFinite(widthPx) || widthPx < 0 || widthPx > 6) return null;
    if (style !== "solid" && style !== "dashed" && style !== "dotted") return null;
    if (radius !== "sharp" && radius !== "rounded") return null;

    const targetsRaw = parsed.targets;
    if (targetsRaw && typeof targetsRaw === "object") {
      const maybe = targetsRaw as Partial<Record<ResumeBorderTargetKey, unknown>>;
      const page = typeof maybe.page === "boolean" ? maybe.page : DEFAULT_BORDERS.targets.page;
      const summary =
        typeof maybe.summary === "boolean" ? maybe.summary : DEFAULT_BORDERS.targets.summary;
      const section =
        typeof maybe.section === "boolean" ? maybe.section : DEFAULT_BORDERS.targets.section;
      const content =
        typeof maybe.content === "boolean" ? maybe.content : DEFAULT_BORDERS.targets.content;
      return { widthPx, style, radius, targets: { page, summary, section, content } };
    }

    const scope = parsed.scope;
    if (scope !== "none" && scope !== "outer" && scope !== "inner" && scope !== "both") return null;
    return {
      widthPx,
      style,
      radius,
      targets: {
        page: DEFAULT_BORDERS.targets.page,
        summary: scope === "outer" || scope === "both",
        section: scope === "outer" || scope === "both",
        content: scope === "inner" || scope === "both",
      },
    };
  } catch {
    return null;
  }
}

function normalizeTailorExperienceDraft(input: TailorExperienceDraft): TailorExperienceDraft {
  return {
    id: input.id,
    role: input.role.trim(),
    company: input.company.trim(),
    location: input.location.trim(),
    period: input.period.trim(),
    impactBullets: (input.impactBullets ?? []).map((l) => l.trim()).filter(Boolean),
  };
}

function normalizeTailorProjectDraft(input: TailorProjectDraft): TailorProjectDraft {
  const technologies = input.technologies.map((t) => t.trim()).filter(Boolean);
  return {
    id: input.id,
    title: input.title.trim(),
    description: input.description.trim(),
    link: input.link.trim(),
    technologies,
  };
}

function normalizeTailorSkillDraft(input: TailorSkillDraft): TailorSkillDraft {
  return {
    id: input.id,
    name: input.name.trim(),
    category: input.category.trim(),
  };
}

function normalizeTailorEducationDraft(input: TailorEducationDraft): TailorEducationDraft {
  return {
    id: input.id,
    institution: input.institution.trim(),
    degree: input.degree.trim(),
    field: input.field.trim(),
    startYear: input.startYear,
    endYear: input.endYear,
    details: input.details.trim(),
  };
}

function normalizeTailorCertificationDraft(input: TailorCertificationDraft): TailorCertificationDraft {
  return {
    id: input.id,
    name: input.name.trim(),
    issuer: input.issuer.trim(),
    issuedYear: input.issuedYear,
    credentialUrl: input.credentialUrl.trim(),
  };
}

function applyAlpha(hex: string, alpha: number) {
  const norm = hex.trim();
  if (alpha >= 1) return norm;
  const normalized = norm.replace(/^#/, "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) return norm;
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyOpacityToPalette(base: Omit<ResumePalette, "accentFill">, opacity: number): ResumePalette {
  return {
    accent: base.accent,
    accentFill: applyAlpha(base.accent, opacity),
    accentLight: applyAlpha(base.accentLight, opacity),
    accentSoft: applyAlpha(base.accentSoft, opacity),
    accentBorder: applyAlpha(base.accentBorder, opacity),
    accentText: base.accentText,
  };
}

function mixColor(hex: string, amt: number) {
  const norm = hex.replace("#", "");
  const num = parseInt(
    norm.length === 3 ? norm.split("").map((c) => c + c).join("") : norm,
    16,
  );
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amt);
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function useCreateResume(
  profile: Profile,
) {
  const [jobDescription, setJobDescription] = useState("");
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [promptForApiKey, setPromptForApiKey] = useState(false);
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [draft, setDraftState] = useState<TailorResumeDraft | null>(null);
  const [fontSizes, setFontSizes] = useState<ResumeFontSizes>(DEFAULT_FONT_SIZES);
  const [fontFamilies, setFontFamilies] = useState<ResumeFontFamilies>(DEFAULT_FONT_FAMILIES);
  const [borders, setBorders] = useState<ResumeBorders>(DEFAULT_BORDERS);
  const [spacing, setSpacing] = useState<ResumeSpacing>(DEFAULT_SPACING);

  const [showJobDescription, setShowJobDescription] = useState(true);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [accentColor, setAccentColor] = useState("#0c6d82");
  const [accentOpacity, setAccentOpacity] = useState(1);
  const [layoutMode, setLayoutMode] = useState<ResumeLayoutMode>("two");
  const paginatedSections = useMemo<ResumeSectionId[][]>(() => [SECTION_ORDER], []);

  const setAccentColorPersisted = (color: string) => {
    setAccentColor(color);
    sessionStorage.setItem(RESUME_ACCENT_COLOR_CACHE_KEY, color);
  };

  const setLayoutModePersisted = (mode: ResumeLayoutMode) => {
    setLayoutMode(mode);
    sessionStorage.setItem(RESUME_LAYOUT_MODE_CACHE_KEY, mode);
  };

  const setShowJobDescriptionPersisted = (next: boolean | ((prev: boolean) => boolean)) => {
    setShowJobDescription((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      sessionStorage.setItem(RESUME_SHOW_JD_CACHE_KEY, String(resolved));
      return resolved;
    });
  };

  const setDraft = (next: TailorResumeDraft | null) => {
    setDraftState(next);
    if (!next) {
      sessionStorage.removeItem(TAILOR_RESUME_DRAFT_CACHE_KEY);
      return;
    }
    sessionStorage.setItem(TAILOR_RESUME_DRAFT_CACHE_KEY, JSON.stringify(next));
  };

  const clearAiDraftSections = (base: TailorResumeDraft | null): TailorResumeDraft | null => {
    if (!base) return null;
    const next: Partial<TailorResumeDraft> = { ...base };
    delete next.header;
    delete next.experiences;
    delete next.projects;
    delete next.skills;
    const keys = Object.keys(next).filter((k) => k !== "version" && k !== "updatedAt");
    if (!keys.length) return null;
    return { ...(next as TailorResumeDraft), updatedAt: Date.now() };
  };

  useEffect(() => {
    if (!promptForApiKey) return;
    if (!claudeApiKey.trim()) return;
    setPromptForApiKey(false);
    setGenerateError(null);
  }, [claudeApiKey, promptForApiKey]);

  useEffect(() => {
    const next = safeParseDraft(sessionStorage.getItem(TAILOR_RESUME_DRAFT_CACHE_KEY));
    setDraftState(next);
    sessionStorage.removeItem(LEGACY_RESUME_EDITS_CACHE_KEY);
    const nextFonts = safeParseFontSizes(sessionStorage.getItem(RESUME_FONT_CACHE_KEY));
    if (nextFonts) setFontSizes(nextFonts);
    const nextFontFamilies = safeParseFontFamilies(
      sessionStorage.getItem(RESUME_FONT_FAMILIES_CACHE_KEY),
    );
    if (nextFontFamilies) setFontFamilies(nextFontFamilies);
    const nextBorders = safeParseBorders(sessionStorage.getItem(RESUME_BORDERS_CACHE_KEY));
    if (nextBorders) setBorders(nextBorders);
    const nextAccentOpacity = safeParseAccentOpacity(
      sessionStorage.getItem(RESUME_ACCENT_OPACITY_CACHE_KEY),
    );
    if (nextAccentOpacity != null) setAccentOpacity(nextAccentOpacity);
    const nextAccentColor = safeParseAccentColor(
      sessionStorage.getItem(RESUME_ACCENT_COLOR_CACHE_KEY),
    );
    if (nextAccentColor) setAccentColor(nextAccentColor);
    const nextLayoutMode = safeParseLayoutMode(sessionStorage.getItem(RESUME_LAYOUT_MODE_CACHE_KEY));
    if (nextLayoutMode) setLayoutMode(nextLayoutMode);
    const nextShowJd = safeParseBoolean(sessionStorage.getItem(RESUME_SHOW_JD_CACHE_KEY));
    if (nextShowJd != null) {
      setShowJobDescription(nextShowJd);
    } else if (window.innerWidth < 1024) {
      setShowJobDescription(false);
    }
    const nextSpacing = safeParseSpacing(sessionStorage.getItem(RESUME_SPACING_CACHE_KEY));
    if (nextSpacing) setSpacing(nextSpacing);
  }, []);

  const palette = useMemo(() => {
    const neutral = {
      accent: "#0b1b2b",
      accentFill: "#0b1b2b",
      accentLight: "#e5e7eb",
      accentSoft: "#f9fafb",
      accentBorder: "#e5e7eb",
      accentText: "#0b1b2b",
    };

    if (accentColor.toLowerCase() === "#ffffff") return neutral;

    const accent = accentColor;
    const accentLight = mixColor(accent, 0.55);
    const accentSoft = mixColor(accent, 0.7);
    const accentBorder = mixColor(accent, 0.35);

    const norm = accent.replace("#", "");
    const num = parseInt(
      norm.length === 3 ? norm.split("").map((c) => c + c).join("") : norm,
      16,
    );
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    let accentText = lum > 0.7 ? "#0b1b2b" : "#ffffff";
    if (accent.toLowerCase() === "#ff8a9d") {
      accentText = "#0b1b2b";
    }

    return applyOpacityToPalette({ accent, accentLight, accentSoft, accentBorder, accentText }, accentOpacity);
  }, [accentColor, accentOpacity]);

  const headerForEdit: TailorHeaderDraft = useMemo(() => {
    const fromDraft = draft?.header ?? {};

    const fullName =
      (fromDraft.fullName !== undefined ? fromDraft.fullName : profile.fullName) ||
      emptyProfileFallback.fullName;
    const title = fromDraft.title !== undefined ? fromDraft.title : profile.title ?? "";
    const summary =
      fromDraft.summary !== undefined ? fromDraft.summary : generated?.summary ?? profile.summary ?? "";
    const email = fromDraft.email !== undefined ? fromDraft.email : profile.email ?? "";
    const phone = fromDraft.phone !== undefined ? fromDraft.phone : profile.phone ?? "";
    const location = fromDraft.location !== undefined ? fromDraft.location : profile.location ?? "";
    const linkedinUrl =
      fromDraft.linkedinUrl !== undefined ? fromDraft.linkedinUrl : profile.linkedinUrl ?? "";
    const githubUrl = fromDraft.githubUrl !== undefined ? fromDraft.githubUrl : profile.githubUrl ?? "";
    const websiteUrl =
      fromDraft.websiteUrl !== undefined ? fromDraft.websiteUrl : profile.websiteUrl ?? "";

    return {
      fullName: fullName.trim(),
      title: title.trim(),
      summary: summary,
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      websiteUrl: websiteUrl.trim(),
    };
  }, [
    draft?.header,
    generated?.summary,
    profile.email,
    profile.fullName,
    profile.githubUrl,
    profile.linkedinUrl,
    profile.location,
    profile.phone,
    profile.summary,
    profile.title,
    profile.websiteUrl,
  ]);

  const experiencesForEdit: TailorExperienceDraft[] = useMemo(() => {
    if (draft?.experiences !== undefined) return draft.experiences;

    if (generated?.experiences?.length) {
      return generated.experiences.map((exp) => ({
        id: undefined,
        role: exp.role,
        company: exp.company,
        location: exp.location || "",
        period: exp.period || "",
        impactBullets: normalizeBullets(exp.bullets || []),
      }));
    }

    return (profile.experiences || []).map((exp) => ({
      id: exp.id,
      role: exp.role,
      company: exp.company,
      location: exp.location || "",
      period: exp.period || "",
      impactBullets: exp.impactBullets || [],
    }));
  }, [draft?.experiences, generated?.experiences, profile.experiences]);

  const experiencesForView: ResumeExperienceForView[] = useMemo(
    () =>
      (experiencesForEdit || [])
        .map((exp) => normalizeTailorExperienceDraft(exp))
        .filter((exp) => exp.role && exp.company)
        .map((exp) => ({
          role: exp.role,
          company: exp.company,
          location: exp.location,
          period: exp.period,
          bullets: normalizeBullets(exp.impactBullets || []),
        })),
    [experiencesForEdit],
  );

  const educationsForEdit: TailorEducationDraft[] = useMemo(() => {
    if (draft?.educations !== undefined) return draft.educations;
    return (profile.educations || []).map((edu) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree || "",
      field: edu.field || "",
      startYear: edu.startYear ?? null,
      endYear: edu.endYear ?? null,
      details: edu.details || "",
    }));
  }, [draft?.educations, profile.educations]);

  const educationForView: ResumeEducationForView[] = useMemo(
    () =>
      (educationsForEdit || [])
        .map((edu) => normalizeTailorEducationDraft(edu))
        .filter((edu) => edu.institution)
        .map((edu) => ({
          degree: edu.degree || "",
          school: edu.institution,
          period: edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : "",
        })),
    [educationsForEdit],
  );

  const projectsForEdit: TailorProjectDraft[] = useMemo(() => {
    if (draft?.projects !== undefined) return draft.projects;

    if (generated?.projects?.length) {
      const profileIndex = new Map(
        (profile.projects || []).map((proj) => [
          normalizeKey(proj.title),
          {
            id: proj.id,
            title: proj.title,
            link: proj.link || "",
            technologies: proj.technologies || [],
            description: proj.description || "",
          },
        ]),
      );

      return generated.projects.map((proj) => ({
        id: profileIndex.get(normalizeKey(proj.title))?.id,
        title: profileIndex.get(normalizeKey(proj.title))?.title ?? proj.title,
        description: proj.description || profileIndex.get(normalizeKey(proj.title))?.description || "",
        link: profileIndex.get(normalizeKey(proj.title))?.link ?? "",
        technologies: profileIndex.get(normalizeKey(proj.title))?.technologies ?? [],
      }));
    }

    return (profile.projects || []).map((proj) => ({
      id: proj.id,
      title: proj.title,
      description: proj.description || "",
      link: proj.link || "",
      technologies: proj.technologies || [],
    }));
  }, [draft?.projects, generated?.projects, profile.projects]);

  const projectsForView: ResumeProjectForView[] = useMemo(
    () =>
      (projectsForEdit || [])
        .map((proj) => normalizeTailorProjectDraft(proj))
        .filter((proj) => proj.title)
        .map((proj) => ({
          name: proj.title,
          detail: proj.description || "",
          link: proj.link || "",
        })),
    [projectsForEdit],
  );

  const skillsForEdit: TailorSkillDraft[] = useMemo(() => {
    if (draft?.skills !== undefined) return draft.skills;
    if (generated?.skillsByCategory) {
      return Object.entries(generated.skillsByCategory).flatMap(([category, items]) =>
        items.map((name) => ({ id: undefined, name, category })),
      );
    }
    return (profile.skills || []).map((s) => ({ id: s.id, name: s.name, category: s.category.name }));
  }, [draft?.skills, generated?.skillsByCategory, profile.skills]);

  const groupedSkills = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    (skillsForEdit || [])
      .map((s) => normalizeTailorSkillDraft(s))
      .filter((s) => s.name && s.category)
      .forEach((s) => {
        const category = s.category.toUpperCase();
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(s.name);
      });

    for (const cat of Object.keys(grouped)) {
      grouped[cat] = Array.from(new Set(grouped[cat])).sort((a, b) => a.localeCompare(b));
    }

    return grouped;
  }, [skillsForEdit]);

  const skillGroups: ResumeSkillGroup[] = useMemo(
    () => Object.entries(groupedSkills).map(([category, items]) => ({ category, items })),
    [groupedSkills],
  );

  const certificationsForEdit: TailorCertificationDraft[] = useMemo(() => {
    if (draft?.certifications !== undefined) return draft.certifications;
    return (profile.certs || []).map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer || "",
      issuedYear: c.issuedYear ?? null,
      credentialUrl: c.credentialUrl || "",
    }));
  }, [draft?.certifications, profile.certs]);

  const certsForView = useMemo(
    () =>
      (certificationsForEdit || [])
        .map((c) => normalizeTailorCertificationDraft(c))
        .filter((c) => c.name)
        .map((c, idx) => ({
          id: c.id ?? -(idx + 1),
          name: c.name,
          issuer: c.issuer ? c.issuer : null,
          issuedYear: c.issuedYear ?? null,
          credentialUrl: c.credentialUrl ? c.credentialUrl : null,
        })),
    [certificationsForEdit],
  );

  // Client-side HTML measurement/pagination was removed. The iframe previews the PDF bytes we generate.

  const handleGenerate = async () => {
    const trimmedJd = jobDescription.trim();
    if (!trimmedJd) return;

    if (!claudeApiKey.trim()) {
      setPromptForApiKey(true);
      setGenerateError("Add your API key to generate suggestions.");
      setShowJobDescription(true);
      return;
    }

    const draftBaseline = generated ? clearAiDraftSections(draft) : draft;
    if (generated) setDraft(draftBaseline);

    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/tailor-resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-claude-api-key": claudeApiKey.trim(),
        },
        body: JSON.stringify({ profile, jobDescription: trimmedJd }),
        cache: "no-store",
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as null | { error?: string };
        throw new Error(payload?.error || "Unable to generate suggestions.");
      }

      const data = (await res.json()) as GeneratedResume;
      const nextGenerated = {
        summary: data.summary,
        experiences: data.experiences || [],
        projects: data.projects || [],
        skillsByCategory: data.skillsByCategory || {},
      };
      setGenerated({
        summary: nextGenerated.summary,
        experiences: nextGenerated.experiences,
        projects: nextGenerated.projects,
        skillsByCategory: nextGenerated.skillsByCategory,
      });

      const expIndex = new Map<string, { id: number; location: string; period: string }>();
      for (const exp of profile.experiences || []) {
        expIndex.set(`${normalizeKey(exp.role)}|${normalizeKey(exp.company)}`, {
          id: exp.id,
          location: exp.location ?? "",
          period: exp.period ?? "",
        });
      }

      const projectIndex = new Map<
        string,
        { id: number; title: string; technologies: string[]; link: string; description: string }
      >();
      for (const proj of profile.projects || []) {
        projectIndex.set(normalizeKey(proj.title), {
          id: proj.id,
          title: proj.title,
          technologies: proj.technologies || [],
          link: proj.link ?? "",
          description: proj.description ?? "",
        });
      }

      const skillIndex = new Map<string, number>();
      for (const skill of profile.skills || []) {
        skillIndex.set(
          `${normalizeKey(skill.name)}|${normalizeKey(skill.category.name)}`,
          skill.id,
        );
      }

      const baseDraft: TailorResumeDraft | null = draftBaseline;
      const merged: TailorResumeDraft = {
        ...(baseDraft ?? { version: 1 as const, updatedAt: Date.now() }),
        updatedAt: Date.now(),
      };

      const nextSummary = nextGenerated.summary.trim();
      const currentSummary = (profile.summary ?? "").trim();
      if (nextSummary && nextSummary !== currentSummary && merged.header?.summary === undefined) {
        merged.header = { ...(merged.header ?? {}), summary: nextSummary };
      }

      if (merged.experiences === undefined && nextGenerated.experiences.length) {
        merged.experiences = nextGenerated.experiences.map((exp) => {
          const match = expIndex.get(`${normalizeKey(exp.role)}|${normalizeKey(exp.company)}`);
          return {
            id: match?.id,
            role: exp.role,
            company: exp.company,
            location: exp.location ?? match?.location ?? "",
            period: exp.period ?? match?.period ?? "",
            impactBullets: exp.bullets || [],
          };
        });
      }

      if (merged.projects === undefined && nextGenerated.projects.length) {
        merged.projects = nextGenerated.projects.map((proj) => {
          const match = projectIndex.get(normalizeKey(proj.title));
          return {
            id: match?.id,
            title: match?.title ?? proj.title,
            description: proj.description ?? match?.description ?? "",
            link: match?.link ?? "",
            technologies: match?.technologies ?? proj.technologies ?? [],
          };
        });
      }

      if (merged.skills === undefined && Object.keys(nextGenerated.skillsByCategory).length) {
        merged.skills = Object.entries(nextGenerated.skillsByCategory).flatMap(([category, items]) =>
          (items || []).map((name) => ({
            id: skillIndex.get(`${normalizeKey(name)}|${normalizeKey(category)}`),
            name,
            category,
          })),
        );
      }

      const hasSections =
        merged.header !== undefined ||
        merged.experiences !== undefined ||
        merged.projects !== undefined ||
        merged.skills !== undefined ||
        merged.educations !== undefined ||
        merged.certifications !== undefined;

      setDraft(hasSections ? merged : null);
      sessionStorage.removeItem(LEGACY_RESUME_EDITS_CACHE_KEY);
      setShowJobDescription(false);
      setPromptForApiKey(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate suggestions.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Client-side HTML measurement/pagination was removed.

  const resetGenerated = () => {
    setGenerated(null);
    setGenerateError(null);
    setDraft(null);
    sessionStorage.removeItem(LEGACY_RESUME_EDITS_CACHE_KEY);
  };

  const resetToProfile = () => {
    resetGenerated();
    setShowJobDescriptionPersisted(true);
    setFontSizes(DEFAULT_FONT_SIZES);
    sessionStorage.removeItem(RESUME_FONT_CACHE_KEY);
    setFontFamilies(DEFAULT_FONT_FAMILIES);
    sessionStorage.removeItem(RESUME_FONT_FAMILIES_CACHE_KEY);
    setBorders(DEFAULT_BORDERS);
    sessionStorage.removeItem(RESUME_BORDERS_CACHE_KEY);
    setAccentColorPersisted("#0c6d82");
    sessionStorage.removeItem(RESUME_ACCENT_COLOR_CACHE_KEY);
    setAccentOpacity(1);
    sessionStorage.removeItem(RESUME_ACCENT_OPACITY_CACHE_KEY);
    setSpacing(DEFAULT_SPACING);
    sessionStorage.removeItem(RESUME_SPACING_CACHE_KEY);
    setLayoutModePersisted("two");
    sessionStorage.removeItem(RESUME_LAYOUT_MODE_CACHE_KEY);
    sessionStorage.removeItem(RESUME_SHOW_JD_CACHE_KEY);
  };

  const defaultPdfFileName = useMemo(() => {
    return buildDefaultResumePdfFileName(headerForEdit.fullName);
  }, [headerForEdit.fullName]);

  const [pdfLiveUrl, setPdfLiveUrl] = useState<string | null>(null);
  const [pdfLiveGenerating, setPdfLiveGenerating] = useState(false);
  const [pdfLiveError, setPdfLiveError] = useState<string | null>(null);
  const [pdfLiveUrlKey, setPdfLiveUrlKey] = useState<string | null>(null);

  const buildPdfPayload = (finalFileName: string): TailorResumePdfRequest => ({
    fileName: finalFileName,
    paginatedSections,
    layoutMode,
    palette,
    accentOpacity,
    fontSizes,
    fontFamilies,
    spacing,
    borders,
    accentIsNone: accentColor.toLowerCase() === "#ffffff",
    header: headerForEdit,
    experiences: experiencesForView,
    education: educationForView,
    skillGroups,
    projects: projectsForView,
    certifications: certsForView.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      credentialUrl: c.credentialUrl,
    })),
  });

  const createPdfBlob = async (finalFileName: string, signal?: AbortSignal) => {
    const payload = buildPdfPayload(finalFileName);
    const res = await fetch("/api/tailor-resume/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal,
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as null | { error?: string };
      throw new Error(err?.error || "Unable to generate PDF.");
    }

    return res.blob();
  };

  const pdfLiveKey = useMemo(() => {
    // Exclude file name from the live preview (it doesn't affect PDF bytes, only download headers).
    const payload = buildPdfPayload("Resume.pdf");
    return JSON.stringify({ ...payload, fileName: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginatedSections,
    layoutMode,
    palette,
    fontSizes,
    fontFamilies,
    spacing,
    borders,
    accentColor,
    headerForEdit,
    experiencesForView,
    educationForView,
    skillGroups,
    projectsForView,
    certsForView,
  ]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    setPdfLiveUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPdfLiveUrlKey(null);
    const timeout = window.setTimeout(async () => {
      setPdfLiveGenerating(true);
      setPdfLiveError(null);
      try {
        const blob = await createPdfBlob("Resume.pdf", controller.signal);
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        setPdfLiveUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setPdfLiveUrlKey(pdfLiveKey);
      } catch (err) {
        if (!alive) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unable to generate PDF preview.";
        setPdfLiveError(message);
      } finally {
        if (alive) setPdfLiveGenerating(false);
      }
    }, 600);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfLiveKey]);

  const handleDownloadPdf = async (fileName?: string) => {
    setPdfError(null);
    setPdfGenerating(true);

    try {
      const resolved = fileName ? sanitizePdfFileName(fileName) : null;
      const finalFileName = resolved ?? defaultPdfFileName;

      // Prefer the live preview bytes if available (exactly what the user sees).
      if (pdfLiveUrl && !pdfLiveGenerating && pdfLiveKey && pdfLiveKey === pdfLiveUrlKey) {
        const a = document.createElement("a");
        a.href = pdfLiveUrl;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      const blob = await createPdfBlob(finalFileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate PDF.";
      setPdfError(message);
    } finally {
      setPdfGenerating(false);
    }
  };

  return {
    jobDescription,
    setJobDescription,
    claudeApiKey,
    setClaudeApiKey,
    promptForApiKey,
    generated,
    generateError,
    isGenerating,
    showJobDescription,
    setShowJobDescription: setShowJobDescriptionPersisted,
    pdfGenerating,
    pdfError,
    accentColor,
    setAccentColor: setAccentColorPersisted,
    accentOpacity,
    setAccentOpacity: (next: number) => {
      setAccentOpacity(next);
      sessionStorage.setItem(RESUME_ACCENT_OPACITY_CACHE_KEY, String(next));
    },
    layoutMode,
    setLayoutMode: setLayoutModePersisted,
    pdfLiveUrl,
    pdfLiveGenerating,
    pdfLiveError,
    handleGenerate,
    handleDownloadPdf,
    resetGenerated,
    resetToProfile,
    defaultPdfFileName,
    draft,
    setDraft,
    headerForEdit,
    experiencesForEdit,
    projectsForEdit,
    skillsForEdit,
    educationsForEdit,
    certificationsForEdit,
    fontSizes,
    setFontSizes: (next: ResumeFontSizes) => {
      setFontSizes(next);
      sessionStorage.setItem(RESUME_FONT_CACHE_KEY, JSON.stringify(next));
    },
    fontFamilies,
    setFontFamilies: (next: ResumeFontFamilies) => {
      setFontFamilies(next);
      sessionStorage.setItem(RESUME_FONT_FAMILIES_CACHE_KEY, JSON.stringify(next));
    },
    borders,
    setBorders: (next: ResumeBorders) => {
      setBorders(next);
      sessionStorage.setItem(RESUME_BORDERS_CACHE_KEY, JSON.stringify(next));
    },
    spacing,
    setSpacing: (next: ResumeSpacing) => {
      setSpacing(next);
      sessionStorage.setItem(RESUME_SPACING_CACHE_KEY, JSON.stringify(next));
    },
  } as const;
}
