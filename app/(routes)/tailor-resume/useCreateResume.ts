"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { buildResumeStyles } from "./engine/css";
import { buildPagesHtml, buildSectionHtml } from "./engine/html";
import { downloadResumePdf } from "./engine/pdf";
import { measureSections, paginateByMeasurement } from "./engine/pagination";
import type {
  ResumeEducationForView,
  ResumeExperienceForView,
  ResumeLayoutMode,
  ResumeProjectForView,
  ResumeSectionId,
  ResumeSkillGroup,
} from "./types";
import type { GeneratedResume } from "@/types/resume-agent";
import type { Profile } from "@/types/profile";

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

type CachedResumeEdits = {
  version: 1;
  updatedAt: number;
  topHtml?: string;
  sections?: Partial<Record<ResumeSectionId, string>>;
};

const RESUME_EDITS_CACHE_KEY = "fitresume.tailorResumeEdits.v1";

function safeParseCachedEdits(raw: string | null): CachedResumeEdits | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedResumeEdits;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseHtmlRoot(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, "text/html");
  return doc.getElementById("__root");
}

function extractEditsFromHtml(html: string): CachedResumeEdits | null {
  const root = parseHtmlRoot(html);
  if (!root) return null;

  const top = root.querySelector(".resume-top") as HTMLElement | null;
  const sections = Array.from(
    root.querySelectorAll(".resume-section[data-section-id]"),
  ) as HTMLElement[];

  const next: CachedResumeEdits = { version: 1, updatedAt: Date.now() };
  if (top) next.topHtml = top.outerHTML;

  if (sections.length) {
    next.sections = {};
    for (const section of sections) {
      const id = section.getAttribute("data-section-id") as ResumeSectionId | null;
      if (!id) continue;
      next.sections[id] = section.outerHTML;
    }
  }

  return next;
}

function applyEditsToHtml(baseHtml: string, edits: CachedResumeEdits | null): string {
  if (!edits) return baseHtml;
  const root = parseHtmlRoot(baseHtml);
  if (!root) return baseHtml;

  if (edits.topHtml) {
    const topTarget = root.querySelector(".resume-top");
    const topSrcRoot = parseHtmlRoot(edits.topHtml);
    const topNode = topSrcRoot?.firstElementChild;
    if (topTarget && topNode) topTarget.replaceWith(topNode);
  }

  const sections = edits.sections || {};
  for (const [id, sectionHtml] of Object.entries(sections) as Array<[ResumeSectionId, string]>) {
    if (!sectionHtml) continue;
    const target = root.querySelector(`.resume-section[data-section-id="${id}"]`);
    const srcRoot = parseHtmlRoot(sectionHtml);
    const srcNode = srcRoot?.firstElementChild;
    if (target && srcNode) target.replaceWith(srcNode);
  }

  return root.innerHTML;
}

function linkifyContact(part: string) {
  const trimmed = part.trim();
  if (!trimmed) return "";
  const isEmail = trimmed.includes("@");
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const isUrlLike = trimmed.includes(".") || trimmed.includes("/");
  const href = isEmail
    ? `mailto:${trimmed}`
    : hasProtocol
      ? trimmed
      : isUrlLike
        ? `https://${trimmed.replace(/^\/+/, "")}`
        : "";
  if (!href) return trimmed;
  return `<a href="${href}" class="resume-link">${trimmed}</a>`;
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
  const [cachedEdits, setCachedEdits] = useState<CachedResumeEdits | null>(null);

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showJobDescription, setShowJobDescription] = useState(true);

  const [zoom, setZoom] = useState(0.75);
  const zoomPercent = Math.round(zoom * 100);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [accentColor, setAccentColor] = useState("#0c6d82");
  const [layoutMode, setLayoutMode] = useState<ResumeLayoutMode>("two");

  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = safeParseCachedEdits(sessionStorage.getItem(RESUME_EDITS_CACHE_KEY));
    setCachedEdits(next);
  }, []);

  const palette = useMemo(() => {
    const neutral = {
      accent: "#0b1b2b",
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

    return { accent, accentLight, accentSoft, accentBorder, accentText };
  }, [accentColor]);

  const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

  useEffect(() => {
    if (viewMode === "edit") {
      setZoom(0.75);
    } else if (viewMode === "preview") {
      setZoom(1);
    }
  }, [viewMode]);

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

  const summaryForView = generated?.summary ?? profile.summary ?? "";

  const experiencesForView: ResumeExperienceForView[] = useMemo(() => {
    if (generated?.experiences?.length) {
      return generated.experiences.map((exp) => ({
        role: exp.role,
        company: exp.company,
        location: exp.location || "",
        period: exp.period || "",
        bullets: exp.bullets.slice(0, 4),
      }));
    }
    return profile.experiences && profile.experiences.length
      ? profile.experiences.map((exp) => ({
          role: exp.role,
          company: exp.company,
          location: exp.location || "",
          period: exp.period || "",
          bullets: exp.impact ? exp.impact.split("\n").filter(Boolean).slice(0, 4) : [],
        }))
      : [];
  }, [generated?.experiences, profile.experiences]);

  const educationForView: ResumeEducationForView[] = useMemo(
    () =>
      profile.educations && profile.educations.length
        ? profile.educations.map((edu) => ({
            degree: edu.degree || "",
            school: edu.institution,
            period:
              edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : "",
          }))
        : [],
    [profile.educations],
  );

  const projectsForView: ResumeProjectForView[] = useMemo(() => {
    if (generated?.projects?.length) {
      return generated.projects.map((proj) => ({
        name: proj.title,
        detail: proj.description || "",
        link: proj.link || "",
      }));
    }
    return profile.projects && profile.projects.length
      ? profile.projects.slice(0, 2).map((proj) => ({
          name: proj.title,
          detail: proj.description || "",
          link: proj.link || "",
        }))
      : [];
  }, [generated?.projects, profile.projects]);

  const groupedSkills = useMemo(() => {
    if (generated?.skillsByCategory) return generated.skillsByCategory;
    const grouped: Record<string, string[]> = {};
    profile.skills.forEach((s) => {
      const category = s.category.name;
      if (!grouped[category]) grouped[category] = [];
      if (s.name) grouped[category].push(s.name);
    });
    return grouped;
  }, [generated?.skillsByCategory, profile.skills]);

  const skillGroups: ResumeSkillGroup[] = useMemo(
    () => Object.entries(groupedSkills).map(([category, items]) => ({ category, items })),
    [groupedSkills],
  );

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
    const sectionHtml = buildSectionHtml({
      experiencesForView,
      skillGroups,
      educationForView,
      projectsForView,
      certs: profile.certs || [],
      layoutMode,
    });

    const showPageNumbers = paginatedSections.length > 1;

    const pagesHtml = buildPagesHtml({
      paginatedSections,
      sectionHtml,
      showPageNumbers,
      layoutMode,
      profile: {
        fullName: profile.fullName || emptyProfileFallback.fullName,
        title: profile.title || profile.headline || emptyProfileFallback.title,
        headline: profile.headline,
        summary: summaryForView || emptyProfileFallback.summary,
      },
      contactParts:
        layoutMode === "single"
          ? contactParts.map((part) => linkifyContact(part))
          : contactParts,
    });

    const resumeStyles = buildResumeStyles({
      pageWidth: PAGE_WIDTH_PX,
      pageHeight: PAGE_HEIGHT_PX,
      palette,
    });

    return { resumeStyles, pagesHtml };
  }, [
    contactParts,
    educationForView,
    experiencesForView,
    layoutMode,
    paginatedSections,
    palette,
    profile.certs,
    profile.fullName,
    profile.headline,
    profile.title,
    projectsForView,
    skillGroups,
    summaryForView,
  ]);

  const pagesHtmlForView = useMemo(
    () => applyEditsToHtml(basePagesHtml, cachedEdits),
    [basePagesHtml, cachedEdits],
  );

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
      setCachedEdits(null);
      sessionStorage.removeItem(RESUME_EDITS_CACHE_KEY);
      setViewMode("preview");
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
  }, [layoutMode, pagesHtmlForView, paginatedSections]);

  const pageStyle = useMemo(
    () =>
      ({
        margin: "0 auto",
        width: `${PAGE_WIDTH_PX}px`,
        "--page-width": `${PAGE_WIDTH_PX}px`,
        "--page-height": `${PAGE_HEIGHT_PX}px`,
        "--accent": palette.accent,
        "--accent-light": palette.accentLight,
        "--accent-soft": palette.accentSoft,
        "--accent-border": palette.accentBorder,
        "--accent-text": palette.accentText,
      }) as CSSProperties,
    [
      palette.accent,
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
    setCachedEdits(null);
    sessionStorage.removeItem(RESUME_EDITS_CACHE_KEY);
  };

  const resetToProfile = () => {
    resetGenerated();
    setViewMode("edit");
    setShowJobDescription(true);
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    setPdfGenerating(true);

    try {
      await downloadResumePdf({
        resumeDocEl: resumeRef.current,
        resumeWrapperEl: resumeWrapperRef.current,
        fullName: profile.fullName,
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
    viewMode,
    setViewMode,
    showJobDescription,
    setShowJobDescription,
    zoomPercent,
    clampZoom,
    setZoom,
    pdfGenerating,
    pdfError,
    accentColor,
    setAccentColor,
    layoutMode,
    setLayoutMode,
    resumeStyles,
    pagesHtml: pagesHtmlForView,
    commitEditsHtml: (html: string) => {
      const next = extractEditsFromHtml(html);
      if (next) {
        setCachedEdits(next);
        sessionStorage.setItem(RESUME_EDITS_CACHE_KEY, JSON.stringify(next));
      }
    },
    hasCachedEdits: !!cachedEdits,
    zoomStyle,
    pageStyle,
    paginatedSectionsCount: paginatedSections.length,
    resumeRef,
    resumeWrapperRef,
    handleGenerate,
    handleDownloadPdf,
    resetGenerated,
    resetToProfile,
  } as const;
}
