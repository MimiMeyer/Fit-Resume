"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Experience = {
  role: string;
  company: string;
  period?: string | null;
  impact?: string | null;
};

type Project = {
  title: string;
  description?: string | null;
  technologies?: string[] | null;
  link?: string | null;
};

type Skill = {
  name: string;
  category?: { name?: string | null } | null;
};

type Profile = {
  fullName: string;
  title?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
};

type AgentOutput = {
  role: string;
  level: string;
  themes: string[];
  mustHaves: string[];
  matchedSkills: string[];
  gaps: string[];
  summary: string;
  bullets: string[];
  skills: string[];
  coverNote: string;
};

type SectionId = "experience" | "skills" | "education" | "projects" | "certifications";

const PAGE_WIDTH_PX = 794; // A4 width at 96 DPI
const PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.05;

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

function groupSkillsByCategory(skills: Skill[]) {
  const grouped: Record<string, string[]> = {};
  skills.forEach((s) => {
    const category = s.category?.name || "Skills";
    if (!grouped[category]) grouped[category] = [];
    if (s.name) grouped[category].push(s.name);
  });
  return grouped;
}

function buildExperiencesForView(profile: Profile) {
  return profile.experiences && profile.experiences.length
    ? profile.experiences.map((exp) => ({
        role: exp.role,
        company: exp.company,
        location: profile.location || "",
        period: exp.period || "",
        bullets: exp.impact ? exp.impact.split("\n").filter(Boolean) : [],
      }))
    : [];
}

function estimateSectionWeight(
  id: SectionId,
  data: {
    experiences: ReturnType<typeof buildExperiencesForView>;
    skills: ReturnType<typeof groupSkillsByCategory>;
    educationCount: number;
    projectCount: number;
    certificationCount: number;
  }
) {
  switch (id) {
    case "experience":
      return Math.max(
        6,
        data.experiences.reduce((sum, exp) => sum + 3 + Math.ceil(exp.bullets.length / 2), 0)
      );
    case "skills":
      return Math.max(3, Math.ceil(Object.values(data.skills).flat().length / 6));
    case "education":
      return Math.max(2, data.educationCount * 2);
    case "projects":
      return Math.max(2, Math.ceil(data.projectCount * 1.5));
    case "certifications":
      return Math.max(1, Math.ceil(data.certificationCount / 2));
    default:
      return 4;
  }
}

function paginateSections(
  order: SectionId[],
  data: {
    experiences: ReturnType<typeof buildExperiencesForView>;
    skills: ReturnType<typeof groupSkillsByCategory>;
    educationCount: number;
    projectCount: number;
    certificationCount: number;
  }
) {
  const MAX_WEIGHT = 18;
  const pages: SectionId[][] = [[]];
  let currentWeight = 0;

  order.forEach((id) => {
    const weight = estimateSectionWeight(id, data);
    if (pages[pages.length - 1].length && currentWeight + weight > MAX_WEIGHT) {
      pages.push([]);
      currentWeight = 0;
    }
    pages[pages.length - 1].push(id);
    currentWeight += weight;
  });

  return pages;
}

const exampleJd =
  "We are hiring a Senior Frontend Engineer to build cohesive product experiences. Must have: React, TypeScript, testing, accessibility, API integration. Nice to have: design systems, performance tuning, AI tooling familiarity.";

function extractSignals(jd: string, profile: Profile) {
  const text = jd.toLowerCase();
  const roleFromLine = jd.split(/\n|\./)[0]?.trim() || "";
  const role =
    (text.match(/(engineer|developer|designer|manager|analyst|scientist)/)?.[0] ?? roleFromLine ?? "Role")
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) || "Role";

  const level =
    text.includes("senior") || text.includes("sr")
      ? "Senior"
      : text.includes("lead")
        ? "Lead"
        : text.includes("principal")
          ? "Principal"
          : text.includes("staff")
            ? "Staff"
            : "Mid";

  const catalog = [
    "react",
    "typescript",
    "node",
    "python",
    "next.js",
    "playwright",
    "testing",
    "graphql",
    "sql",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "design systems",
    "a11y",
    "performance",
  ];

  const mustHaves = catalog.filter((item) => text.includes(item));

  const profileSkills = profile.skills
    .map((skill) => skill.name?.toLowerCase())
    .filter(Boolean) as string[];

  const matchedSkills = mustHaves.filter((have) => profileSkills.includes(have));
  const gaps = mustHaves.filter((have) => !profileSkills.includes(have));

  const themes = [
    text.includes("collaborate") && "Collaboration",
    text.includes("lead") && "Ownership",
    text.includes("performance") && "Performance",
    text.includes("design") && "Design systems",
    text.includes("testing") && "Quality",
  ].filter(Boolean) as string[];

  return { role, level, mustHaves, matchedSkills, gaps, themes };
}

function buildAgentOutput(jd: string, profile: Profile): AgentOutput {
  const signals = extractSignals(jd, profile);
  const primaryTitle = profile.title || profile.headline || signals.role;
  const location = profile.location ? `based in ${profile.location}` : "location-flexible";
  const skillsList = profile.skills.map((skill) => skill.name).filter(Boolean) as string[];

  const featuredProjects = profile.projects.slice(0, 2);
  const featuredExperiences = profile.experiences.slice(0, 3);

  const summaryParts = [
    `${primaryTitle} (${signals.level}) ${location}`,
    signals.matchedSkills.length
      ? `Strong alignment on ${signals.matchedSkills.slice(0, 4).join(", ")}`
      : "Adaptable to the stack",
    signals.gaps.length
      ? `Proactively upskilling on ${signals.gaps.slice(0, 3).join(", ")}`
      : "Ready to contribute on day one",
  ];

  const bullets: string[] = [];
  featuredExperiences.forEach((exp, idx) => {
    const anchorSkill = signals.matchedSkills[idx] || signals.mustHaves[idx] || "impact";
    bullets.push(
      `${exp.role} @ ${exp.company} - ${exp.impact || "Shipped user-facing features"} using ${anchorSkill}.`
    );
  });

  featuredProjects.forEach((project) => {
    const tech = project.technologies?.slice(0, 3).join(", ");
    bullets.push(
      `${project.title} - ${project.description || "Built and iterated quickly"}${tech ? ` (Tech: ${tech})` : ""}.`
    );
  });

  const coverNote = [
    `I'm excited about the ${signals.role.toLowerCase()} role and the emphasis on ${signals.themes.slice(0, 2).join(" & ") || "impact"}.`,
    signals.matchedSkills.length
      ? `Alignment on ${signals.matchedSkills.slice(0, 4).join(", ")} is visible in my background.`
      : "I map quickly to new stacks and focus on measurable outcomes.",
    signals.gaps.length
      ? `I'm already brushing up on ${signals.gaps.join(", ")} to ensure I can contribute quickly.`
      : "I can plug into your stack immediately.",
  ].join(" | ");

  return {
    role: signals.role,
    level: signals.level,
    themes: signals.themes,
    mustHaves: signals.mustHaves,
    matchedSkills: signals.matchedSkills,
    gaps: signals.gaps,
    summary: summaryParts.join(" | "),
    bullets,
    skills: Array.from(new Set([...signals.matchedSkills, ...skillsList])).slice(0, 12),
    coverNote,
  };
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
  return `<a href="${href}" style="color:#0b4f6c;text-decoration:none;">${trimmed}</a>`;
}

export function ResumeComposer({ profile }: { profile: Profile }) {
  const [jd, setJd] = useState(exampleJd);
  const [output, setOutput] = useState<AgentOutput>(() => buildAgentOutput(exampleJd, profile));
  const [downloadOpen, setDownloadOpen] = useState(false);
  const sectionOrder: SectionId[] = ["experience", "skills", "education", "projects", "certifications"];
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(0.75);
  const zoomPercent = Math.round(zoom * 100);

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

  const experiencesForView = useMemo(() => buildExperiencesForView(profile), [profile]);

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

  const projectsForView = useMemo(
    () =>
      profile.projects && profile.projects.length
        ? profile.projects.map((proj) => ({
            name: proj.title,
            detail: proj.description || "",
            link: proj.link || "",
          }))
        : [],
    [profile.projects]
  );

  const groupedSkills = useMemo(() => {
    const grouped = groupSkillsByCategory(profile.skills);
    if (Object.keys(grouped).length) return grouped;
    return {};
  }, [profile.skills]);

  const skillGroups = useMemo(
    () => Object.entries(groupedSkills).map(([category, items]) => ({ category, items })),
    [groupedSkills]
  );

  const paginatedSections = useMemo(
    () =>
      paginateSections(sectionOrder, {
        experiences: experiencesForView,
        skills: groupedSkills,
        educationCount: educationForView.length,
        projectCount: projectsForView.length,
        certificationCount: (profile as any).certs?.length || 0,
      }),
    [educationForView.length, experiencesForView, groupedSkills, projectsForView.length]
  );

  const { resumeHtml, resumeStyles, pagesHtml } = useMemo(() => {
    const sectionHtml: Record<SectionId, () => string> = {
      experience: () => `
        <div class="resume-section">
          <div class="resume-section-title">Experience Highlights</div>
          <div class="resume-card">
            <ul class="resume-bullets">
              ${experiencesForView
                .map(
                  (exp) => `
                    <li class="resume-bullet-item">
                      <div class="resume-bullet-head">
                        <span class="resume-strong">${exp.role} - ${exp.company}</span>
                        <span class="resume-muted">${exp.location}${exp.period ? ` - ${exp.period}` : ""}</span>
                      </div>
                      <ul class="resume-subbullets">
                        ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
                      </ul>
                    </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      `,
      skills: () => `
        <div class="resume-section">
          <div class="resume-section-title">Skills</div>
          <div class="resume-card resume-chip-grid">
            ${skillGroups
              .map(
                (group) => `
                  <div class="resume-row">
                    <div style="font-size:11px;font-weight:700;color:#475569;">${group.category}</div>
                    <div class="resume-chip-wrap">
                      ${group.items.map((s) => `<span class="resume-chip">${s}</span>`).join("")}
                    </div>
                  </div>`
              )
              .join("")}
          </div>
        </div>
      `,
      education: () => `
        <div class="resume-section">
          <div class="resume-section-title">Education</div>
          <div class="resume-card">
            ${educationForView
              .map(
                (edu) => `
                  <div style="margin-bottom:8px;">
                    <div style="font-weight:700;">${edu.degree}</div>
                    <div style="font-size:13px;color:#475569;">${edu.school}</div>
                    <div style="font-size:12px;color:#94a3b8;">${edu.period}</div>
                  </div>`
              )
              .join("")}
          </div>
        </div>
      `,
      projects: () => `
        <div class="resume-section">
          <div class="resume-section-title">Projects</div>
          <div class="resume-card">
            ${projectsForView
              .map(
                (proj) => `
                  <div style="margin-bottom:8px;">
                    <div style="font-weight:700;">${proj.name}${
                      proj.link ? ` - <a href="${proj.link}" style="color:#0b4f6c;text-decoration:none;">link</a>` : ""
                    }</div>
                    <div style="font-size:13px;color:#475569;">${proj.detail}</div>
                  </div>`
              )
              .join("")}
          </div>
        </div>
      `,
      certifications: () => `
        <div class="resume-section">
          <div class="resume-section-title">Certifications</div>
          <div class="resume-card">
            <ul class="resume-bullets">
              ${(profile as any).certs?.map((c: any) => `<li>${c.name}</li>`).join("") || ""}
            </ul>
          </div>
        </div>
      `,
    };

    const pagesHtml = paginatedSections
      .map((sections, pageIndex) => {
        const sectionsMarkup = sections.map((id) => sectionHtml[id]()).join("");
        const topMarkup =
          pageIndex === 0
            ? `
              <div class="resume-top">
                <div class="resume-banner">
                  <h1>${profile.fullName || emptyProfileFallback.fullName}</h1>
                  <div class="role">${profile.title || profile.headline || emptyProfileFallback.title}</div>
                  <div class="summary">${profile.summary || emptyProfileFallback.summary}</div>
                </div>
                <div class="resume-contact">
                  <h2>Contact</h2>
                  ${
                    contactParts.length
                      ? `<p>${contactParts.map((part) => linkifyContact(part)).join(" &bull; ")}</p>`
                      : ""
                  }
                </div>
              </div>
            `
            : "";
        const gap =
          pageIndex < paginatedSections.length - 1
            ? `<div class="resume-page-gap" aria-hidden="true"></div>`
            : "";

        return `
          <div class="resume-page" data-page="Page ${pageIndex + 1}">
            ${topMarkup}
            <div class="resume-body">
              ${sectionsMarkup}
            </div>
          </div>
          ${gap}
        `;
      })
      .join("");

    const resumeStyles = `
      :root { color-scheme: light; }
      .resume-root { --page-width: ${PAGE_WIDTH_PX}px; --page-height: ${PAGE_HEIGHT_PX}px; font-family: "Segoe UI", Arial, sans-serif; color: #0b1b2b; background: #e2e8f0; padding: 12px 0; display: flex; justify-content: center; }
      .resume-doc { display: flex; flex-direction: column; align-items: center; gap: 22px; margin: 0 auto; }
      .resume-page { width: var(--page-width); min-height: var(--page-height); margin: 0 auto; background: #ffffff; border: 1px solid #d9e2ec; box-shadow: 0 14px 36px rgba(15,23,42,0.12); border-radius: 12px; overflow: hidden; position: relative; }
      .resume-page::after { content: attr(data-page); position: absolute; bottom: 10px; right: 16px; font-size: 10px; letter-spacing: 0.1em; color: #94a3b8; text-transform: uppercase; }
      .resume-page-gap { width: var(--page-width); height: 12px; }
      .resume-page-gap::before, .resume-page-gap::after { display: none; }
      .resume-top { display: grid; grid-template-columns: 64% 36%; }
      .resume-banner { background: linear-gradient(135deg, #0b4f6c, #0f708b); color: white; padding: 28px 32px; }
      .resume-banner h1 { margin: 0; font-size: 30px; letter-spacing: 0.01em; }
      .resume-banner .role { margin-top: 8px; font-size: 16px; opacity: 0.92; }
      .resume-banner .summary { margin-top: 12px; font-size: 13px; line-height: 1.5; opacity: 0.9; }
      .resume-contact { background: #0a3f59; color: #d9e9f2; padding: 28px 24px; }
      .resume-contact h2 { margin: 0 0 12px; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; }
      .resume-contact p { margin: 4px 0; font-size: 13px; }
      .resume-mini-header { padding: 18px 28px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
      .resume-mini-header .name { font-size: 18px; font-weight: 700; }
      .resume-body { padding: 22px 28px 18px; display: flex; flex-direction: column; gap: 16px; }
      .resume-section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; background: #ffffff; }
      .resume-section-title { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
      .resume-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #f8fafc; }
      .resume-chip-grid { display: flex; flex-direction: column; gap: 8px; }
      .resume-bullets { margin: 0; padding-left: 16px; }
      .resume-bullet-item { margin-bottom: 10px; }
      .resume-bullet-head { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
      .resume-strong { font-weight: 700; }
      .resume-muted { color: #475569; font-size: 12px; }
      .resume-subbullets { margin: 0; padding-left: 16px; }
      .resume-subbullets li { margin-bottom: 6px; font-size: 13.5px; line-height: 1.5; }
      .resume-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
      .resume-chip { padding: 7px 11px; border-radius: 999px; background: #e0e7ff; border: 1px solid #cbd5ff; font-size: 12px; color: #0b1b2b; display: inline-block; }
      .resume-row { display: flex; flex-direction: column; gap: 6px; }
      @media print {
        .resume-root { background: white; padding: 0; }
        .resume-doc { gap: 0; }
        .resume-page { box-shadow: none; border: none; margin: 0 auto; page-break-after: always; }
        .resume-page:last-child { page-break-after: auto; }
        .resume-page-gap { display: none; }
        .resume-contact { background: #0b4f6c; color: #e0f2f7; }
      }
    `;

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
    paginatedSections,
    profile.fullName,
    profile.headline,
    profile.summary,
    profile.title,
    projectsForView,
    skillGroups,
  ]);

  const handleGenerate = () => {
    const next = buildAgentOutput(jd || exampleJd, profile);
    setOutput(next);
  };

  const handleDownloadWord = () => {
    const blob = new Blob([resumeHtml], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${output.role.replace(/\s+/g, "-").toLowerCase() || "role"}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(resumeHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 150);
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
      </div>

      <div
        className={`mt-4 grid gap-4 items-start ${
          viewMode === "edit" ? "lg:grid-cols-[360px_minmax(0,1fr)]" : "grid-cols-1"
        }`}
      >
        {viewMode === "edit" ? (
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <label className="text-sm font-semibold text-zinc-900" htmlFor="jd-input">
              Job description
            </label>
            <textarea
              id="jd-input"
              className="min-h-[320px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 focus:border-[var(--accent)] focus:outline-none"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Generate
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
            <div className="space-y-1">
              <p className="font-semibold text-zinc-900">Preview mode</p>
              <p className="text-xs text-zinc-600">Switch to Edit to update the job description.</p>
            </div>
            <button
              onClick={() => setViewMode("edit")}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Edit Job Description
            </button>
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-700">
                <button
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
                  className="rounded-full px-2 py-1 transition hover:bg-white"
                >
                  -
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">Zoom</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-zinc-900 shadow-sm">
                    {zoomPercent}%
                  </span>
                </div>
                <button
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
                  className="rounded-full px-2 py-1 transition hover:bg-white"
                >
                  +
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <input
                  type="range"
                  min={ZOOM_MIN * 100}
                  max={ZOOM_MAX * 100}
                  step={ZOOM_STEP * 100}
                  value={zoomPercent}
                  onChange={(e) => setZoom(clampZoom(Number(e.target.value) / 100))}
                  className="h-1 w-32 accent-[var(--accent)]"
                />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setDownloadOpen((o) => !o)}
                onBlur={() => setTimeout(() => setDownloadOpen(false), 120)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Download
              </button>
              {downloadOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-800 shadow-lg">
                  <button
                    onClick={handlePrintPdf}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Save as PDF
                    <span aria-hidden className="text-xs text-zinc-500">
                      PDF
                    </span>
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Download Word
                    <span aria-hidden className="text-xs text-zinc-500">
                      DOCX
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className="overflow-auto rounded-lg bg-zinc-100 p-4 min-w-0 w-full"
            style={{
              maxHeight: viewMode === "edit" ? "75vh" : "85vh",
              marginInline: "auto",
              overflowX: "auto",
              scrollbarGutter: "stable",
            }}
          >
            <div className="flex w-full justify-center">
              <div className="flex w-full max-w-full flex-col items-center" style={{ gap: "22px" }}>
                <style dangerouslySetInnerHTML={{ __html: resumeStyles }} />
                <div
                  className="resume-root"
                  style={
                    {
                      margin: "0 auto",
                      width: "100%",
                      "--page-width": `${PAGE_WIDTH_PX * zoom}px`,
                      "--page-height": `${PAGE_HEIGHT_PX * zoom}px`,
                    } as CSSProperties
                  }
                >
                  <div className="resume-doc" dangerouslySetInnerHTML={{ __html: pagesHtml }} />
                </div>
                <p className="text-[11px] text-zinc-600">
                  {paginatedSections.length} page{paginatedSections.length > 1 ? "s" : ""} | {zoomPercent}% zoom
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
