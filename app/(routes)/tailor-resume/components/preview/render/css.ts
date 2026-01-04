import type {
  ResumeBorders,
  ResumeFontFamilies,
  ResumeFontSizes,
  ResumePalette,
  ResumeSpacing,
} from "../../../types";
import { DEFAULT_FONT_FAMILIES, DEFAULT_FONT_SIZES, DEFAULT_SPACING } from "../../../types";

type BuildStylesArgs = {
  pageWidth: number;
  pageHeight: number;
  palette: ResumePalette;
  fontSizes?: ResumeFontSizes;
  fontFamilies?: ResumeFontFamilies;
  borders?: ResumeBorders;
  accentIsNone?: boolean;
  accentOpacity?: number;
  spacing?: ResumeSpacing;
};

export function buildResumeStyles({
  pageWidth,
  pageHeight,
  palette,
  fontSizes,
  fontFamilies,
  borders,
  accentIsNone,
  accentOpacity,
  spacing,
}: BuildStylesArgs) {
  const headingPx = fontSizes?.headingPx ?? DEFAULT_FONT_SIZES.headingPx;
  const subtitlePx = fontSizes?.subtitlePx ?? DEFAULT_FONT_SIZES.subtitlePx;
  const bodyPx = fontSizes?.bodyPx ?? DEFAULT_FONT_SIZES.bodyPx;
  const sectionGapPx = spacing?.sectionGapPx ?? DEFAULT_SPACING.sectionGapPx;
  const bulletGapPx = spacing?.bulletGapPx ?? DEFAULT_SPACING.bulletGapPx;
  const pagePaddingPx = spacing?.pagePaddingPx ?? DEFAULT_SPACING.pagePaddingPx;
  const titleFont = fontFamilies?.title ?? DEFAULT_FONT_FAMILIES.title;
  const headingFont = fontFamilies?.heading ?? DEFAULT_FONT_FAMILIES.heading;
  const bodyFont = fontFamilies?.body ?? DEFAULT_FONT_FAMILIES.body;
  const borderWidthPx = borders?.widthPx ?? 1;
  const borderStyle = borders?.style ?? "solid";
  const targets = borders?.targets ?? { page: false, summary: true, section: true, content: true };
  const pageBorderWidthPx = targets.page ? borderWidthPx : 0;
  const summaryBorderWidthPx = targets.summary ? borderWidthPx : 0;
  const sectionBorderWidthPx = targets.section ? borderWidthPx : 0;
  const cardBorderWidthPx = targets.content ? borderWidthPx : 0;
  const radiusMode = borders?.radius ?? "rounded";
  const radiusPage = radiusMode === "sharp" ? "0px" : "8px";
  const radiusBox = radiusMode === "sharp" ? "0px" : "6px";
  const radiusSide = radiusMode === "sharp" ? "0px" : "10px";
  const resolvedAccentOpacity = accentOpacity ?? 1;
  const sidebarBg =
    accentIsNone || resolvedAccentOpacity <= 0 ? "#f8fafc" : palette.accentFill;
  const sidebarText =
    accentIsNone || resolvedAccentOpacity < 0.6 ? "#0b1b2b" : palette.accentText;
  const sidebarTitle =
    !accentIsNone && resolvedAccentOpacity < 0.30 ? palette.accent : sidebarText;
  const sidebarDivider =
    accentIsNone || resolvedAccentOpacity < 0.6
      ? "rgba(11,27,43,0.18)"
      : "rgba(255,255,255,0.25)";
  const sidebarBorderWidthPx = accentIsNone ? sectionBorderWidthPx : 0;
  return `
      :root { color-scheme: light; --resume-heading: ${headingPx}px; --resume-subtitle: ${subtitlePx}px; --resume-text: ${bodyPx}px; --resume-section-gap: ${sectionGapPx}px; --resume-bullet-gap: ${bulletGapPx}px; --resume-body-padding: ${pagePaddingPx}px; --resume-font-title: ${titleFont}; --resume-font-heading: ${headingFont}; --resume-font-body: ${bodyFont}; --resume-border-style: ${borderStyle}; --resume-border-width-page: ${pageBorderWidthPx}px; --resume-border-width-summary: ${summaryBorderWidthPx}px; --resume-border-width-section: ${sectionBorderWidthPx}px; --resume-border-width-card: ${cardBorderWidthPx}px; --resume-radius-page: ${radiusPage}; --resume-radius-box: ${radiusBox}; --resume-radius-side: ${radiusSide}; --resume-sidebar-bg: ${sidebarBg}; --resume-sidebar-text: ${sidebarText}; --resume-sidebar-title: ${sidebarTitle}; --resume-sidebar-divider: ${sidebarDivider}; --resume-sidebar-border-width: ${sidebarBorderWidthPx}px; }
      @page { size: A4; margin: 10mm; }
      .resume-root { --page-width: ${pageWidth}px; --page-height: ${pageHeight}px; --accent: ${palette.accent}; --accent-fill: ${palette.accentFill}; --accent-light: ${palette.accentLight}; --accent-soft: ${palette.accentSoft}; --accent-border: ${palette.accentBorder}; --accent-text: ${palette.accentText}; font-family: var(--resume-font-body); font-size: var(--resume-text); color: #0b1b2b; background: #f3f4f6; padding: 10px 0; display: flex; justify-content: center; }
      .resume-doc { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 0 auto; }
      .resume-page { width: var(--page-width); height: var(--page-height); max-height: var(--page-height); margin: 0 auto; background: #ffffff; border: var(--resume-border-width-page) var(--resume-border-style) var(--accent-border); box-shadow: 0 8px 18px rgba(15,23,42,0.08); border-radius: var(--resume-radius-page); overflow: hidden; position: relative; display: flex; flex-direction: column; font-size: var(--resume-text); }
      .resume-page::after { content: attr(data-page); position: absolute; bottom: 6px; right: 10px; font-size: 9px; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; }
      .resume-page[data-page=""]::after { display: none; content: ""; }
      .resume-page-gap { width: var(--page-width); height: 6px; }
      .resume-page-gap::before, .resume-page-gap::after { display: none; }
      .resume-top { display: flex; flex-direction: column; gap: 6px; }
      .resume-top-header { display: flex; justify-content: center; }
      .resume-top-header h1 { margin: 0; font-size: var(--resume-heading); letter-spacing: 0.01em; text-align: center; color: var(--accent); font-family: var(--resume-font-title); }
      .resume-header-band { display: none; }
      .resume-role { font-size: var(--resume-subtitle); font-weight: 600; text-align: center; color: #0b1b2b; font-family: var(--resume-font-title); }
      .resume-summary-block { display: flex; flex-direction: column; gap: 2px; text-align: center; }
      .resume-summary-block .summary { font-size: var(--resume-text); line-height: 1.3; opacity: 0.98; }
      .resume-inline-row { display: flex; flex-wrap: wrap; gap: 8px; line-height: 1.3; font-size: var(--resume-text); justify-content: center; text-align: center; color: #0b1b2b; }
      .resume-inline-row-plain { margin-top: 6px; }
      .resume-inline-row.outside-summary { margin-top: 10px; }
      .resume-contact a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
      .resume-contact a.resume-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
      .resume-summary-plain { margin-top: 6px; padding: 10px 12px; border: var(--resume-border-width-summary) var(--resume-border-style) var(--accent-border); border-radius: var(--resume-radius-box); background: #f8fafc; max-width: 92%; margin-left: auto; margin-right: auto; }
      .resume-page.layout-single .resume-summary-plain { max-width: none; width: calc(100% - (var(--resume-body-padding) * 2)); box-sizing: border-box; }
      .resume-page.layout-two .resume-summary-plain { max-width: 98%; }
      .resume-role-plain { font-size: var(--resume-subtitle); font-weight: 700; color: #0b1b2b; margin-bottom: 4px; text-align: center; font-family: var(--resume-font-title); }
      .resume-summary-plain .summary { font-size: var(--resume-text); line-height: 1.3; color: #0b1b2b; }
      .resume-body { padding: var(--resume-body-padding); display: flex; flex-direction: column; gap: var(--resume-section-gap); flex: 1; font-size: var(--resume-text); }
      .resume-body.grid-two { display: grid; grid-template-columns: 36% 64%; column-gap: 12px; row-gap: var(--resume-section-gap); align-items: stretch; min-height: 100%; }
      .resume-page.layout-two .resume-body.grid-two { grid-template-columns: 34% 66%; column-gap: 10px; row-gap: var(--resume-section-gap); padding: var(--resume-body-padding); }
      .resume-col { display: flex; flex-direction: column; gap: var(--resume-section-gap); min-height: 100%; font-size: var(--resume-text); }
      .resume-col-side { background: var(--resume-sidebar-bg); color: var(--resume-sidebar-text); border-radius: var(--resume-radius-side); padding: 12px; border: var(--resume-sidebar-border-width) var(--resume-border-style) var(--accent-border); display: flex; flex-direction: column; gap: var(--resume-section-gap); }
      .resume-page.layout-two .resume-col-side { padding: 12px 10px; }
      .resume-col-side .resume-section { background: transparent; border: none; padding: 0; color: inherit; }
      .resume-col-side .resume-card { background: transparent; border: none; padding: 0; color: inherit; }
      .resume-col-side .resume-section-title { color: var(--resume-sidebar-title); margin-bottom: 8px; font-size: var(--resume-subtitle); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; font-family: var(--resume-font-heading); }
      .resume-col-side .resume-skill-cat { color: var(--resume-sidebar-text); }
      .resume-col-side .resume-skill-inline-row,
      .resume-col-side .resume-skill-inline-list,
      .resume-col-side .resume-skill-inline span,
      .resume-col-side .resume-contact-list li,
      .resume-col-side .resume-card,
      .resume-col-side .resume-strong,
      .resume-col-side .resume-meta-line { color: var(--resume-sidebar-text); }
      .resume-col-side .resume-link { color: var(--resume-sidebar-text); text-decoration: underline; text-underline-offset: 2px; }
      .resume-section { border: var(--resume-border-width-section) var(--resume-border-style) var(--accent-border); border-radius: var(--resume-radius-box); padding: 10px 10px; background: #ffffff; font-size: var(--resume-text); }
      .resume-section-title { font-size: var(--resume-subtitle); letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; font-family: var(--resume-font-heading); font-weight: 500; }
      .resume-card { border: var(--resume-border-width-card) var(--resume-border-style) var(--accent-border); border-radius: var(--resume-radius-box); padding: 8px 10px; background: #f8fafc; font-size: var(--resume-text); }
      .resume-page.layout-single .resume-section { padding: 8px 8px; }
      .resume-page.layout-single .resume-section-title { margin-bottom: 6px; }
      .resume-page.layout-single .resume-card { padding: 6px 8px; }
      .resume-section.resume-certifications { padding: 8px 8px; }
      .resume-section.resume-certifications .resume-section-title { font-size: var(--resume-subtitle); letter-spacing: 0.08em; margin-bottom: 6px; }
      .resume-section.resume-certifications .resume-card { padding: 6px 8px; background: #f8fafc; border: var(--resume-border-width-card) var(--resume-border-style) var(--accent-border); }
      .resume-section.resume-certifications .resume-cert-list { list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
      .resume-section.resume-certifications .resume-cert-list li { font-size: var(--resume-text); line-height: 1.32; }
      .resume-section.resume-certifications .resume-cert-link { font-weight: 600; color: var(--accent); text-decoration: underline; text-underline-offset: 2px; margin-left: 4px; }
      .resume-page.layout-two .resume-section.resume-certifications { padding: 8px 0; background: transparent; border: none; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-card { padding: 6px 0; background: transparent; border: none; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-cert-list { list-style: none; padding-left: 0; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-section-title { color: var(--resume-sidebar-title); }
      .resume-page.layout-two .resume-section.resume-certifications .resume-cert-link { color: var(--resume-sidebar-text); }
      .resume-card.resume-skills-compact { display: flex; flex-direction: column; gap: 6px; font-size: var(--resume-text); }
      .resume-skill-inline-row { display: flex; flex-direction: column; gap: 2px; font-size: var(--resume-text); line-height: 1.3; color: inherit; }
      .resume-skill-inline-row.single { flex-direction: row; flex-wrap: wrap; align-items: baseline; gap: 6px; }
      .resume-skill-cat-inline { font-family: var(--resume-font-body); font-weight: 700; letter-spacing: normal; text-transform: none; color: inherit; font-size: var(--resume-text); }
      .resume-skill-inline-items { display: flex; flex-wrap: wrap; gap: 6px; color: inherit; }
      .resume-skill-inline-items.single { display: inline-flex; }
      .resume-skill-inline-item { color: inherit; }
      .resume-section.resume-skills-inline .resume-card { padding: 6px 8px; }
      .resume-skills-inline-text { font-size: var(--resume-text); line-height: 1.3; color: #0b1b2b; }
      .resume-bullets { margin: 0; padding-left: 14px; font-size: var(--resume-text); }
      .resume-bullet-item { margin-bottom: calc(var(--resume-bullet-gap) + 2px); font-size: var(--resume-text); line-height: 1.35; }
      .resume-bullet-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 3px; font-size: var(--resume-text); }
      .resume-strong { font-weight: 700; font-size: var(--resume-text); }
      .resume-muted { color: #475569; font-size: var(--resume-text); }
      .resume-subbullets { margin: 0; padding-left: 14px; list-style: disc; font-size: var(--resume-text); }
      .resume-subbullets li { margin-bottom: var(--resume-bullet-gap); font-size: var(--resume-text); line-height: 1.35; }
      .resume-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
      .resume-row { display: flex; flex-direction: column; gap: 2px; font-size: var(--resume-text); }
      .resume-meta-line { font-size: var(--resume-text); color: #475569; }
      .resume-edu-line { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: var(--resume-text); }
      .resume-edu-line .edu-period { white-space: nowrap; text-align: right; }
      .resume-contact-card { border: none; border-radius: 0; padding: 0; background: transparent; }
      .resume-contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: var(--resume-text); }
      .resume-contact-list li { font-size: var(--resume-text); color: #0b1b2b; line-height: 1.4; }
      .resume-contact-list a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }

      .resume-root.is-pdf-export a {
        text-decoration: none !important;
        border-bottom: 1px solid currentColor;
        padding-bottom: 6px;
        display: inline-block;
      }

      .resume-root.is-pdf-export .resume-bullets,
      .resume-root.is-pdf-export .resume-subbullets {
        list-style: none;
        padding-left: 0;
      }



      .resume-root.is-pdf-export .resume-subbullets > li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .resume-root.is-pdf-export .resume-subbullets > li::before {
        content: "•";
        line-height: 1;
        margin-top: 0.22em;
        flex: 0 0 auto;
      }
      @media print {
        .resume-root { background: white; padding: 0; }
        .resume-doc { gap: 0; }
        .resume-page { box-shadow: none; border: none; margin: 0 auto; page-break-after: always; }
        .resume-page:last-child { page-break-after: auto; }
        .resume-page-gap { display: none; }
        .resume-contact { background: #0b4f6c; color: #e0f2f7; }
      }
    `;
}
