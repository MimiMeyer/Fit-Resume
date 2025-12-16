"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { measureSections, paginateByMeasurement } from "./resume/pagination";
import { JdPanel } from "./resume/JdPanel";
import { Preview } from "./resume/Preview";
import { Toolbar } from "./resume/Toolbar";
import { buildResumeStyles } from "./resume/styles";
import { buildPagesHtml, buildSectionHtml } from "./resume/Document";
import { PAGE_HEIGHT_PX, PAGE_WIDTH_PX, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "./resume/constants";
import type {
  AgentProfileInput,
  AgentSkillInput,
  GeneratedResume,
} from "@/lib/agent-resume-types";

type SectionId = "experience" | "skills" | "education" | "projects" | "certifications";

const emptyProfileFallback = {
  fullName: "Your Name",
  title: "",
  summary: "",
  contact: {
    location: "",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
  },
  experiences: [] as {
    role: string;
    company: string;
    location: string;
    period: string;
    bullets: string[];
  }[],
  education: [] as { degree: string; school: string; period: string }[],
  skills: [] as { category: string; items: string[] }[],
  projects: [] as { name: string; detail: string; link?: string }[],
  certifications: [] as string[],
};

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

export function ResumeComposer({ profile }: { profile: AgentProfileInput }) {
  const [jd, setJd] = useState();
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const sectionOrder: SectionId[] = ["experience", "education", "skills", "projects", "certifications"];
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showJobDescription, setShowJobDescription] = useState(true);
  const [zoom, setZoom] = useState(0.75);
  const zoomPercent = Math.round(zoom * 100);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#0c6d82");
  const [layoutMode, setLayoutMode] = useState<"single" | "two">("two");
  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeWrapperRef = useRef<HTMLDivElement>(null);

  const mixColor = (hex: string, amt: number) => {
    const norm = hex.replace("#", "");
    const num = parseInt(norm.length === 3 ? norm.split("").map((c) => c + c).join("") : norm, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const mix = (channel: number) => Math.round(channel + (255 - channel) * amt);
    return `#${[mix(r), mix(g), mix(b)]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")}`;
  };

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
    const num = parseInt(norm.length === 3 ? norm.split("").map((c) => c + c).join("") : norm, 16);
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
    [profile.email, profile.githubUrl, profile.linkedinUrl, profile.location, profile.phone]
  );

  const experiencesForView = useMemo(() => {
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

  const educationForView = useMemo(
    () =>
      (profile as any).educations && (profile as any).educations.length
        ? (profile as any).educations.map((edu: any) => ({
            degree: edu.degree || "",
            school: edu.institution,
            period: edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : "",
          }))
        : [],
    [profile]
  );

  const projectsForView = useMemo(() => {
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
      const category = (s as AgentSkillInput).category?.name || "Skills";
      if (!grouped[category]) grouped[category] = [];
      if (s.name) grouped[category].push(s.name);
    });
    return grouped;
  }, [generated?.skillsByCategory, profile.skills]);

  const skillGroups = useMemo(
    () => Object.entries(groupedSkills).map(([category, items]) => ({ category, items })),
    [groupedSkills]
  );

  const summaryForView = generated?.summary ?? profile.summary ?? "";

  const [paginatedSections, setPaginatedSections] = useState<SectionId[][]>([sectionOrder]);

  useEffect(() => {
    setPaginatedSections([sectionOrder]);
  }, [educationForView.length, experiencesForView, groupedSkills, projectsForView.length, layoutMode]);

  const { resumeHtml, resumeStyles, pagesHtml } = useMemo(() => {
    const sectionHtml = buildSectionHtml({
      experiencesForView,
      skillGroups,
      educationForView,
      projectsForView,
      certs: (profile as any).certs || [],
      linkify: linkifyContact,
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
      contactParts: layoutMode === "single" ? contactParts.map((part) => linkifyContact(part)) : contactParts,
    });

    const resumeStyles = buildResumeStyles({
      pageWidth: PAGE_WIDTH_PX,
      pageHeight: PAGE_HEIGHT_PX,
      palette,
    });

    const documentHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
${resumeStyles}
    </style>
  </head>
  <body class="resume-root">
    <div class="resume-doc">
      ${pagesHtml}
    </div>
  </body>
</html>
    `;

    return { resumeHtml: documentHtml, resumeStyles, pagesHtml };
  }, [
    contactParts,
    educationForView,
    experiencesForView,
    accentColor,
    paginatedSections,
    profile.fullName,
    profile.headline,
    profile.title,
    projectsForView,
    skillGroups,
    layoutMode,
    summaryForView,
  ]);

  const handleGenerate = async () => {
    if (!jd.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Unable to generate resume.");
      }
      const data = (await res.json()) as GeneratedResume;
      setGenerated({
        summary: data.summary,
        experiences: data.experiences || [],
        projects: data.projects || [],
        skillsByCategory: data.skillsByCategory || {},
      });
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
      const { heights, limit } = measureSections(root, sectionOrder);
      const gap = layoutMode === "two" ? 10 : 8;
      const nextPages = paginateByMeasurement(sectionOrder, heights, layoutMode, limit, gap);

      const same =
        nextPages.length === paginatedSections.length &&
        nextPages.every((p, i) => p.length === paginatedSections[i]?.length && p.every((id, j) => id === paginatedSections[i][j]));

      if (!same) {
        setPaginatedSections(nextPages);
      }
    };

    // Measure after layout paint to catch newly generated content sizes
    const raf = requestAnimationFrame(recalc);
    return () => cancelAnimationFrame(raf);
  }, [pagesHtml, layoutMode, sectionOrder, paginatedSections]);

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
    [palette.accent, palette.accentBorder, palette.accentLight, palette.accentSoft, palette.accentText]
  );

  const zoomStyle = useMemo(
    () =>
      ({
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        width: `${PAGE_WIDTH_PX}px`,
      }) as CSSProperties,
    [zoom]
  );

  const handleDownloadWord = () => {
    const blob = new Blob([resumeHtml], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const base = (profile.fullName || "role").replace(/\s+/g, "-").toLowerCase();
    link.download = `resume-${base}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    setPdfGenerating(true);

    let resumeRoot: HTMLElement | null = null;
    let prevPageWidth: string | null = null;
    let prevPageHeight: string | null = null;
    let prevWrapperTransform: string | null = null;

    try {
      const baseName = (profile.fullName || "Resume").trim();
      const safeBaseName = baseName.replace(/[\\/:*?"<>|]+/g, "").trim() || "Resume";
      const fileBase = safeBaseName.replace(/\s+/g, "_");
      resumeRoot = resumeRef.current?.closest<HTMLElement>(".resume-root") ?? null;
      if (resumeRoot) {
        prevPageWidth = resumeRoot.style.getPropertyValue("--page-width");
        prevPageHeight = resumeRoot.style.getPropertyValue("--page-height");
        resumeRoot.style.setProperty("--page-width", `${PAGE_WIDTH_PX}px`);
        resumeRoot.style.setProperty("--page-height", `${PAGE_HEIGHT_PX}px`);
      }
      const resumeWrapper = resumeWrapperRef.current;
      if (resumeWrapper) {
        prevWrapperTransform = resumeWrapper.style.transform;
        resumeWrapper.style.transform = "none";
      }
      document.body.style.setProperty("background", "#ffffff");
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

      const pages = resumeRef.current?.querySelectorAll<HTMLElement>(".resume-page");
      if (!pages || !pages.length) {
        throw new Error("No resume content found to export.");
      }

      const pdf = new jsPDF({ unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageList = Array.from(pages);

      for (let i = 0; i < pageList.length; i += 1) {
        const page = pageList[i];
        const pageRect = page.getBoundingClientRect();
        const targetWidth = PAGE_WIDTH_PX;
        const targetHeight = PAGE_HEIGHT_PX;
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: targetWidth,
          height: targetHeight,
          windowWidth: targetWidth,
          windowHeight: targetHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const fitScale = pdfWidth / canvas.width;
        const renderWidth = canvas.width * fitScale;
        const renderHeight = canvas.height * fitScale;
        const xOffset = Math.max((pdfWidth - renderWidth) / 2, 0);
        const yOffset = Math.max((pdfHeight - renderHeight) / 2, 0);

        pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight, undefined, "FAST");

        const linkScaleX = renderWidth / pageRect.width;
        const linkScaleY = renderHeight / pageRect.height;
        const anchors = page.querySelectorAll<HTMLAnchorElement>("a[href]");
        anchors.forEach((anchor) => {
          const href = anchor.getAttribute("href");
          if (!href) return;
          const rect = anchor.getBoundingClientRect();
          const x = (rect.left - pageRect.left) * linkScaleX + xOffset;
          const y = (rect.top - pageRect.top) * linkScaleY + yOffset;
          const w = rect.width * linkScaleX;
          const h = rect.height * linkScaleY;
          if (w > 0 && h > 0) {
            pdf.link(x, y, w, h, { url: href });
          }
        });

        if (i < pageList.length - 1) {
          pdf.addPage();
        }
      }

      pdf.save(`${fileBase}_Resume.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
      const message = err instanceof Error ? err.message : "Unable to generate PDF.";
      setPdfError(message);
    } finally {
      if (resumeRoot) {
        if (prevPageWidth) resumeRoot.style.setProperty("--page-width", prevPageWidth);
        if (prevPageHeight) resumeRoot.style.setProperty("--page-height", prevPageHeight);
      }
      const resumeWrapper = resumeWrapperRef.current;
      if (resumeWrapper && prevWrapperTransform !== null) {
        resumeWrapper.style.transform = prevWrapperTransform;
      }
      document.body.style.removeProperty("background");
      setPdfGenerating(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-semibold text-zinc-700">
          {(["edit", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-full px-3 py-1 transition ${
                viewMode === mode
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:bg-white/70"
              }`}
            >
              {mode === "edit" ? "Edit mode" : "Preview mode"}
            </button>
          ))}
        </div>
        {generated ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100">
            AI resume ready
          </span>
        ) : null}
        {generated ? (
          <button
            type="button"
            onClick={() => {
              setGenerated(null);
              setGenerateError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Reset AI output
          </button>
        ) : null}
      </div>

      <div
        className={`mt-4 grid gap-4 items-start ${
          viewMode === "edit" && showJobDescription ? "lg:grid-cols-[360px_minmax(0,1fr)]" : "grid-cols-1"
        }`}
      >
        {viewMode === "edit" && showJobDescription ? (
          <JdPanel
            show={showJobDescription}
            jd={jd}
            setJd={setJd}
            onGenerate={handleGenerate}
            onToggle={() => setShowJobDescription((s) => !s)}
            isGenerating={isGenerating}
            hasGenerated={!!generated}
            error={generateError}
          />
        ) : null}

        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-inner">
          <Toolbar
            viewMode={viewMode}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            zoomPercent={zoomPercent}
            zoomStep={ZOOM_STEP * 100}
            onZoomChange={(val) => setZoom(clampZoom(val / 100))}
            onDownloadPdf={handleDownloadPdf}
            pdfGenerating={pdfGenerating}
            pdfError={pdfError}
            onShowJd={!showJobDescription && viewMode === "edit" ? () => setShowJobDescription(true) : undefined}
          />

          <Preview
            resumeStyles={resumeStyles}
            pagesHtml={pagesHtml}
            zoomStyle={zoomStyle}
            pageStyle={pageStyle}
            paginatedSectionsCount={paginatedSections.length}
            zoomPercent={zoomPercent}
            resumeRef={resumeRef}
            resumeWrapperRef={resumeWrapperRef}
            maxHeight={viewMode === "edit" ? "75vh" : "85vh"}
          />
        </div>
      </div>
    </section>
  );
}







