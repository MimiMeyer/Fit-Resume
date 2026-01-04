import type { Certification } from "@/types/certification";
import type {
  ResumeEducationForView,
  ResumeExperienceForView,
  ResumeLayoutMode,
  ResumeProjectForView,
  ResumeSectionId,
  ResumeSkillGroup,
} from "../../../types";
import { escapeAttr, escapeHtml, sanitizeHref } from "@/lib/htmlSanitize";

type SectionHtmlMap = Record<ResumeSectionId, () => string>;

export function buildSectionHtml(args: {
  experiencesForView: ResumeExperienceForView[];
  skillGroups: ResumeSkillGroup[];
  educationForView: ResumeEducationForView[];
  projectsForView: ResumeProjectForView[];
  certs: Certification[];
  layoutMode?: ResumeLayoutMode;
}) {
  const { experiencesForView, skillGroups, educationForView, projectsForView, certs, layoutMode = "single" } = args;

  const map: SectionHtmlMap = {
    experience: () => `
        <div class="resume-section" data-section-id="experience">
          <div class="resume-section-title">Experience</div>
          <div class="resume-card">
            <ul class="resume-bullets">
              ${experiencesForView
                .map(
                  (exp) => `
                    <li class="resume-bullet-item">
                      <div class="resume-bullet-head">
                        <span class="resume-strong">${escapeHtml(exp.role)} - ${escapeHtml(exp.company)}</span>
                        <span class="resume-muted">${escapeHtml(exp.location)}${exp.location && exp.period ? ` - ${escapeHtml(exp.period)}` : escapeHtml(exp.period || "")}</span>
                      </div>
                      <ul class="resume-subbullets">
                        ${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
                      </ul>
                    </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      `,
    skills: () => {
      const isSingle = layoutMode === "single";
      const content = skillGroups
        .map((group) => {
          if (isSingle) {
            return `
              <div class="resume-skill-inline-row single">
                <span class="resume-skill-cat-inline">${group.category}:</span>
                <span class="resume-skill-inline-items single">
                  ${group.items.map((s) => `<span class="resume-skill-inline-item">${escapeHtml(s)}</span>`).join("")}
                </span>
              </div>
            `;
          }
          return `
            <div class="resume-skill-inline-row">
              <div class="resume-skill-cat-inline">${escapeHtml(group.category)}:</div>
              <div class="resume-skill-inline-items">
                ${group.items.map((s) => `<span class="resume-skill-inline-item">${escapeHtml(s)}</span>`).join("")}
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="resume-section" data-section-id="skills">
          <div class="resume-section-title">Skills</div>
          <div class="resume-card resume-skills-compact">
            ${content}
          </div>
        </div>
      `;
    },
    education: () => `
        <div class="resume-section" data-section-id="education">
          <div class="resume-section-title">Education</div>
          <div class="resume-card">
            ${educationForView
              .map(
                (edu) => `
                    <div class="resume-row">
                      <div class="resume-strong">${escapeHtml(edu.degree)}</div>
                    <div class="resume-edu-line">
                      <div class="resume-meta-line">${escapeHtml(edu.school)}</div>
                      ${edu.period ? `<div class="resume-meta-line edu-period">${escapeHtml(edu.period)}</div>` : ""}
                    </div>
                  </div>`
              )
              .join("")}
          </div>
        </div>
      `,
    projects: () => `
        <div class="resume-section" data-section-id="projects">
          <div class="resume-section-title">Projects</div>
          <div class="resume-card">
            ${projectsForView
              .map((proj) => {
                const safeHref = sanitizeHref(proj.link || null);
                const linkMarkup = safeHref
                  ? ` - <a class="resume-link" href="${escapeAttr(safeHref)}" target="_blank" rel="noreferrer">link</a>`
                  : "";

                return `
                  <div class="resume-row">
                    <div class="resume-strong">
                      ${escapeHtml(proj.name)}${linkMarkup}
                    </div>
                    <div class="resume-meta-line">${escapeHtml(proj.detail)}</div>
                  </div>`;
              })
              .join("")}
          </div>
        </div>
      `,
    certifications: () => `
        <div class="resume-section resume-certifications" data-section-id="certifications">
          <div class="resume-section-title">Certifications</div>
          <div class="resume-card">
            <ul class="resume-cert-list">
              ${certs
                .map((c) => {
                  if (!c.name) return "";
                  const issuer = c.issuer ? ` - ${escapeHtml(c.issuer)}` : "";
                  const safeHref = sanitizeHref(c.credentialUrl || null);
                  const link = safeHref
                    ? ` <a class="resume-link resume-cert-link" href="${escapeAttr(safeHref)}" target="_blank" rel="noreferrer">(link)</a>`
                    : "";
                  return `<li><span class="resume-strong">${escapeHtml(c.name)}</span>${issuer}${link}</li>`;
                })
                .filter(Boolean)
                .join("") || ""}
            </ul>
          </div>
        </div>
      `,
  };

  return map;
}

export function buildPagesHtml({
  paginatedSections,
  sectionHtml,
  showPageNumbers,
  layoutMode,
  profile,
  contactParts,
  paginatedGap = true,
}: {
  paginatedSections: ResumeSectionId[][];
  sectionHtml: SectionHtmlMap;
  showPageNumbers: boolean;
  layoutMode: ResumeLayoutMode;
  profile: { fullName: string; title?: string | null; summary?: string | null };
  contactParts: string[];
  paginatedGap?: boolean;
}) {
  const pagesHtml = paginatedSections
    .map((sections, pageIndex) => {
      const topMarkup =
        pageIndex === 0
          ? `
        <div class="resume-top">
          <div class="resume-top-header">
            <h1>${escapeHtml(profile.fullName)}</h1>
          </div>
            <div class="resume-summary-plain">
            ${
              profile.title
                ? `<div class="resume-role-plain">${escapeHtml(profile.title)}</div>`
                : ""
            }
            <div class="summary">${escapeHtml(profile.summary || "")}</div>
          </div>
          ${
            layoutMode === "single"
              ? `<div class="resume-inline-row resume-inline-row-plain outside-summary">
                  ${contactParts.length ? contactParts.join(" • ") : ""}
                </div>`
              : ""
          }
        </div>
            `
          : "";
      const gap =
        paginatedGap && pageIndex < paginatedSections.length - 1
          ? `<div class="resume-page-gap" aria-hidden="true"></div>`
          : "";

      if (layoutMode === "two") {
        const sideSections = sections
          .filter((id) => id === "skills" || id === "certifications")
          .map((id) => sectionHtml[id]())
          .join("");
        const mainSections = sections
          .filter((id) => id !== "skills" && id !== "certifications")
          .map((id) => sectionHtml[id]())
          .join("");
        const contactCard =
          pageIndex === 0 && contactParts.length
            ? `
                <div class="resume-contact-card">
                  <div class="resume-section-title">Contact</div>
                  <ul class="resume-contact-list">
                    ${contactParts.map((part) => `<li>${part}</li>`).join("")}
                  </ul>
                </div>
              `
            : "";

        return `
            <div class="resume-page layout-two" data-page="${showPageNumbers ? `Page ${pageIndex + 1}` : ""}">
              ${topMarkup}
              <div class="resume-body grid-two">
                <div class="resume-col resume-col-side">
                  ${contactCard}
                  ${sideSections}
                </div>
                <div class="resume-col resume-col-main">
                  ${mainSections}
                </div>
              </div>
            </div>
            ${gap}
          `;
      }

      const singleSections = sections.map((id) => sectionHtml[id]()).join("");
      return `
          <div class="resume-page layout-single" data-page="${showPageNumbers ? `Page ${pageIndex + 1}` : ""}">
            ${topMarkup}
            <div class="resume-body">
              ${singleSections}
            </div>
          </div>
          ${gap}
        `;
    })
    .join("");

  return pagesHtml;
}
