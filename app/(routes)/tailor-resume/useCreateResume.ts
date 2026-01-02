"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { buildResumeStyles } from "./engine/css";
import { buildPagesHtml, buildSectionHtml } from "./engine/html";
import { buildDefaultResumePdfFileName, downloadResumePdf } from "./engine/pdf";
import { measureSections, paginateByMeasurement } from "./engine/pagination";
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
import type {
  TailorCertificationDraft,
  TailorEducationDraft,
  TailorExperienceDraft,
  TailorHeaderDraft,
  TailorProjectDraft,
  TailorResumeDraft,
  TailorSkillDraft,
} from "./draft";

const PAGE_WIDTH_PX = 794; // A4 width at 96 DPI
const PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 3.0;

const SECTION_ORDER: ResumeSectionId[] = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

const emptyProfileFallback = {
  fullName: "Your Name",
  title: "",
  summary: "",
};

const TAILOR_RESUME_DRAFT_CACHE_KEY = "fitresume.tailorResumeDraft.v1";
const LEGACY_RESUME_EDITS_CACHE_KEY = "fitresume.tailorResumeEdits.v1";
const RESUME_FONT_CACHE_KEY = "fitresume.tailorResumeFontSizes.v1";
const RESUME_FONT_FAMILIES_CACHE_KEY = "fitresume.tailorResumeFontFamilies.v1";
const RESUME_BORDERS_CACHE_KEY = "fitresume.tailorResumeBorders.v1";
const RESUME_ACCENT_OPACITY_CACHE_KEY = "fitresume.tailorResumeAccentOpacity.v1";
const RESUME_SPACING_CACHE_KEY = "fitresume.tailorResumeSpacing.v1";

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
    return { title, heading, body };
  } catch {
    return null;
  }
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

function joinLines(lines: string[]) {
  return lines.map((l) => l.trim()).filter(Boolean).join("\n");
}

function normalizeTailorExperienceDraft(input: TailorExperienceDraft): TailorExperienceDraft {
  return {
    id: input.id,
    role: input.role.trim(),
    company: input.company.trim(),
    location: input.location.trim(),
    period: input.period.trim(),
    impact: input.impact.trim(),
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

function linkifyContact(part: string) {
  const trimmed = part.trim();
  if (!trimmed) return "";
  const isEmail = trimmed.includes("@");
  if (isEmail) return trimmed;
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const isUrlLike = trimmed.includes(".") || trimmed.includes("/");
  const href = hasProtocol ? trimmed : isUrlLike ? `https://${trimmed.replace(/^\/+/, "")}` : "";
  if (!href) return trimmed;
  return `<a href="${href}" class="resume-link">${trimmed}</a>`;
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
  opts: { onGenerate: (jd: string) => Promise<GeneratedResume> },
) {
  const [jd, setJd] = useState("");
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [draft, setDraftState] = useState<TailorResumeDraft | null>(null);
  const [fontSizes, setFontSizes] = useState<ResumeFontSizes>(DEFAULT_FONT_SIZES);
  const [fontFamilies, setFontFamilies] = useState<ResumeFontFamilies>(DEFAULT_FONT_FAMILIES);
  const [borders, setBorders] = useState<ResumeBorders>(DEFAULT_BORDERS);
  const [spacing, setSpacing] = useState<ResumeSpacing>(DEFAULT_SPACING);

  const [showJobDescription, setShowJobDescription] = useState(true);

  const [zoom, setZoom] = useState(0.75);
  const zoomPercent = Math.round(zoom * 100);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [accentColor, setAccentColor] = useState("#0c6d82");
  const [accentOpacity, setAccentOpacity] = useState(1);
  const [layoutMode, setLayoutMode] = useState<ResumeLayoutMode>("two");

  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeWrapperRef = useRef<HTMLDivElement>(null);

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

  const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

  const contactParts = useMemo(
    () =>
      [profile.location, profile.phone, profile.email, profile.githubUrl, profile.linkedinUrl].filter(
        Boolean,
      ) as string[],
    [
      profile.email,
      profile.githubUrl,
      profile.linkedinUrl,
      profile.location,
      profile.phone,
    ],
  );

  const headerForEdit: TailorHeaderDraft = useMemo(() => {
    const fromDraft = draft?.header ?? {};

    const fullName =
      (fromDraft.fullName !== undefined ? fromDraft.fullName : profile.fullName) ||
      emptyProfileFallback.fullName;
    const title = fromDraft.title !== undefined ? fromDraft.title : profile.title ?? "";
    const headline = fromDraft.headline !== undefined ? fromDraft.headline : profile.headline ?? "";
    const summary =
      fromDraft.summary !== undefined ? fromDraft.summary : generated?.summary ?? profile.summary ?? "";

    return {
      fullName: fullName.trim(),
      title: title.trim(),
      headline: headline.trim(),
      summary: summary,
    };
  }, [draft?.header, generated?.summary, profile.fullName, profile.headline, profile.summary, profile.title]);

  const summaryForView = headerForEdit.summary;

  const experiencesForEdit: TailorExperienceDraft[] = useMemo(() => {
    if (draft?.experiences !== undefined) return draft.experiences;

    if (generated?.experiences?.length) {
      return generated.experiences.map((exp) => ({
        id: undefined,
        role: exp.role,
        company: exp.company,
        location: exp.location || "",
        period: exp.period || "",
        impact: joinLines(exp.bullets || []),
      }));
    }

    return (profile.experiences || []).map((exp) => ({
      id: exp.id,
      role: exp.role,
      company: exp.company,
      location: exp.location || "",
      period: exp.period || "",
      impact: exp.impact || "",
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
          bullets: exp.impact ? exp.impact.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 4) : [],
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
      return generated.projects.map((proj) => ({
        id: undefined,
        title: proj.title,
        description: proj.description || "",
        link: proj.link || "",
        technologies: [],
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
        .slice(0, 2)
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

  const [paginatedSections, setPaginatedSections] = useState<ResumeSectionId[][]>([
    SECTION_ORDER,
  ]);

  useEffect(() => {
    setPaginatedSections([SECTION_ORDER]);
  }, [
    educationForView.length,
    experiencesForView,
    groupedSkills,
    projectsForView.length,
    layoutMode,
  ]);

  const { resumeStyles, pagesHtml: basePagesHtml } = useMemo(() => {
    const certsForView = (certificationsForEdit || [])
      .map((c) => normalizeTailorCertificationDraft(c))
      .filter((c) => c.name)
      .map((c, idx) => ({
        id: c.id ?? -(idx + 1),
        name: c.name,
        issuer: c.issuer ? c.issuer : null,
        issuedYear: c.issuedYear ?? null,
        credentialUrl: c.credentialUrl ? c.credentialUrl : null,
      }));

    const sectionHtml = buildSectionHtml({
      experiencesForView,
      skillGroups,
      educationForView,
      projectsForView,
      certs: certsForView,
      layoutMode,
    });

    const showPageNumbers = paginatedSections.length > 1;

    const pagesHtml = buildPagesHtml({
      paginatedSections,
      sectionHtml,
      showPageNumbers,
      layoutMode,
      profile: {
        fullName: headerForEdit.fullName || emptyProfileFallback.fullName,
        title: headerForEdit.title || headerForEdit.headline || emptyProfileFallback.title,
        headline: headerForEdit.headline,
        summary: summaryForView || emptyProfileFallback.summary,
      },
      contactParts: contactParts.map((part) => linkifyContact(part)),
    });

    const resumeStyles = buildResumeStyles({
      pageWidth: PAGE_WIDTH_PX,
      pageHeight: PAGE_HEIGHT_PX,
      palette,
      fontSizes,
      fontFamilies,
      borders,
      accentIsNone: accentColor.toLowerCase() === "#ffffff",
      accentOpacity,
      spacing,
    });

    return { resumeStyles, pagesHtml };
  }, [
    accentColor,
    accentOpacity,
    contactParts,
    educationForView,
    experiencesForView,
    fontFamilies,
    borders,
    layoutMode,
    paginatedSections,
    palette,
    certificationsForEdit,
    headerForEdit.fullName,
    headerForEdit.headline,
    headerForEdit.title,
    projectsForView,
    skillGroups,
    summaryForView,
    fontSizes,
    spacing,
  ]);

  const handleGenerate = async () => {
    if (!jd.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const data = await opts.onGenerate(jd);
      setGenerated({
        summary: data.summary,
        experiences: data.experiences || [],
        projects: data.projects || [],
        skillsByCategory: data.skillsByCategory || {},
      });
      setDraftState(null);
      sessionStorage.removeItem(TAILOR_RESUME_DRAFT_CACHE_KEY);
      sessionStorage.removeItem(LEGACY_RESUME_EDITS_CACHE_KEY);
      setShowJobDescription(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate resume.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const root = resumeRef.current;
    if (!root) return;

    const recalc = () => {
      const { heights, limit } = measureSections(root, SECTION_ORDER, PAGE_HEIGHT_PX);
      const gap = layoutMode === "two" ? 10 : 8;
      const nextPages = paginateByMeasurement(
        SECTION_ORDER,
        heights,
        layoutMode,
        limit,
        gap,
      );

      const same =
        nextPages.length === paginatedSections.length &&
        nextPages.every(
          (p, i) =>
            p.length === paginatedSections[i]?.length &&
            p.every((id, j) => id === paginatedSections[i][j]),
        );

      if (!same) {
        setPaginatedSections(nextPages);
      }
    };

    const raf = requestAnimationFrame(recalc);
    return () => cancelAnimationFrame(raf);
  }, [fontSizes, spacing, layoutMode, basePagesHtml, paginatedSections]);

  const pageStyle = useMemo(
    () =>
      ({
        margin: "0 auto",
        width: `${PAGE_WIDTH_PX}px`,
        "--page-width": `${PAGE_WIDTH_PX}px`,
        "--page-height": `${PAGE_HEIGHT_PX}px`,
        "--accent": palette.accent,
        "--accent-fill": palette.accentFill,
        "--accent-light": palette.accentLight,
        "--accent-soft": palette.accentSoft,
        "--accent-border": palette.accentBorder,
        "--accent-text": palette.accentText,
      }) as CSSProperties,
    [
      palette.accent,
      palette.accentFill,
      palette.accentBorder,
      palette.accentLight,
      palette.accentSoft,
      palette.accentText,
    ],
  );

  const zoomStyle = useMemo(
    () =>
      ({
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        width: `${PAGE_WIDTH_PX}px`,
      }) as CSSProperties,
    [zoom],
  );

  const resetGenerated = () => {
    setGenerated(null);
    setGenerateError(null);
    setDraftState(null);
    sessionStorage.removeItem(TAILOR_RESUME_DRAFT_CACHE_KEY);
    sessionStorage.removeItem(LEGACY_RESUME_EDITS_CACHE_KEY);
  };

  const resetToProfile = () => {
    resetGenerated();
    setShowJobDescription(true);
    setFontSizes(DEFAULT_FONT_SIZES);
    sessionStorage.removeItem(RESUME_FONT_CACHE_KEY);
    setFontFamilies(DEFAULT_FONT_FAMILIES);
    sessionStorage.removeItem(RESUME_FONT_FAMILIES_CACHE_KEY);
    setBorders(DEFAULT_BORDERS);
    sessionStorage.removeItem(RESUME_BORDERS_CACHE_KEY);
    setAccentOpacity(1);
    sessionStorage.removeItem(RESUME_ACCENT_OPACITY_CACHE_KEY);
    setSpacing(DEFAULT_SPACING);
    sessionStorage.removeItem(RESUME_SPACING_CACHE_KEY);
  };

  const defaultPdfFileName = useMemo(() => {
    return buildDefaultResumePdfFileName(headerForEdit.fullName);
  }, [headerForEdit.fullName]);

  const handleDownloadPdf = async (fileName?: string) => {
    setPdfError(null);
    setPdfGenerating(true);

    try {
      await downloadResumePdf({
        resumeDocEl: resumeRef.current,
        resumeWrapperEl: resumeWrapperRef.current,
        fullName: headerForEdit.fullName,
        fileName,
        pageWidthPx: PAGE_WIDTH_PX,
        pageHeightPx: PAGE_HEIGHT_PX,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate PDF.";
      setPdfError(message);
    } finally {
      setPdfGenerating(false);
    }
  };

  return {
    jd,
    setJd,
    generated,
    generateError,
    isGenerating,
    showJobDescription,
    setShowJobDescription,
    zoomPercent,
    clampZoom,
    setZoom,
    pdfGenerating,
    pdfError,
    accentColor,
    setAccentColor,
    accentOpacity,
    setAccentOpacity: (next: number) => {
      setAccentOpacity(next);
      sessionStorage.setItem(RESUME_ACCENT_OPACITY_CACHE_KEY, String(next));
    },
    layoutMode,
    setLayoutMode,
    resumeStyles,
    pagesHtml: basePagesHtml,
    zoomStyle,
    pageStyle,
    paginatedSectionsCount: paginatedSections.length,
    resumeRef,
    resumeWrapperRef,
    handleGenerate,
    handleDownloadPdf,
    resetGenerated,
    resetToProfile,
    defaultPdfFileName,
    draft,
    setDraft: (next: TailorResumeDraft | null) => {
      setDraftState(next);
      if (!next) {
        sessionStorage.removeItem(TAILOR_RESUME_DRAFT_CACHE_KEY);
        return;
      }
      sessionStorage.setItem(TAILOR_RESUME_DRAFT_CACHE_KEY, JSON.stringify(next));
    },
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
