type BuildStylesArgs = {
  pageWidth: number;
  pageHeight: number;
  palette: {
    accent: string;
    accentLight: string;
    accentSoft: string;
    accentBorder: string;
    accentText: string;
  };
};

export function buildResumeStyles({ pageWidth, pageHeight, palette }: BuildStylesArgs) {
  return `
      :root { color-scheme: light; --resume-heading: 22px; --resume-subtitle: 13px; --resume-text: 11px; }
      @page { size: A4; margin: 10mm; }
      .resume-root { --page-width: ${pageWidth}px; --page-height: ${pageHeight}px; --accent: ${palette.accent}; --accent-light: ${palette.accentLight}; --accent-soft: ${palette.accentSoft}; --accent-border: ${palette.accentBorder}; --accent-text: ${palette.accentText}; font-family: "Segoe UI", Arial, sans-serif; font-size: var(--resume-text); color: #0b1b2b; background: #f3f4f6; padding: 10px 0; display: flex; justify-content: center; }
      .resume-doc { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 0 auto; }
      .resume-page { width: var(--page-width); height: var(--page-height); max-height: var(--page-height); margin: 0 auto; background: #ffffff; border: 1px solid #d9e2ec; box-shadow: 0 8px 18px rgba(15,23,42,0.08); border-radius: 8px; overflow: hidden; position: relative; display: flex; flex-direction: column; font-size: var(--resume-text); }
      .resume-page::after { content: attr(data-page); position: absolute; bottom: 6px; right: 10px; font-size: 9px; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; }
      .resume-page[data-page=""]::after { display: none; content: ""; }
      .resume-page-gap { width: var(--page-width); height: 6px; }
      .resume-page-gap::before, .resume-page-gap::after { display: none; }
      .resume-top { display: flex; flex-direction: column; gap: 6px; }
      .resume-top-header { display: flex; justify-content: center; }
      .resume-top-header h1 { margin: 0; font-size: var(--resume-heading); letter-spacing: 0.01em; text-align: center; color: var(--accent); }
      .resume-header-band { display: none; }
      .resume-role { font-size: var(--resume-subtitle); font-weight: 600; text-align: center; color: #0b1b2b; }
      .resume-summary-block { display: flex; flex-direction: column; gap: 2px; text-align: center; }
      .resume-summary-block .summary { font-size: var(--resume-text); line-height: 1.3; opacity: 0.98; }
      .resume-inline-row { display: flex; flex-wrap: wrap; gap: 8px; line-height: 1.3; font-size: var(--resume-text); justify-content: center; text-align: center; color: #0b1b2b; }
      .resume-inline-row-plain { margin-top: 6px; }
      .resume-inline-row.outside-summary { margin-top: 10px; }
      .resume-contact a { color: inherit; text-decoration: none; }
      .resume-contact a.resume-link { color: inherit; text-decoration: none; }
      .resume-summary-plain { margin-top: 6px; padding: 10px 12px; border: 1px solid var(--accent-border); border-radius: 8px; background: #f8fafc; max-width: 92%; margin-left: auto; margin-right: auto; }
      .resume-page.layout-two .resume-summary-plain { max-width: 98%; }
      .resume-role-plain { font-size: var(--resume-subtitle); font-weight: 700; color: #0b1b2b; margin-bottom: 4px; text-align: center; }
      .resume-summary-plain .summary { font-size: var(--resume-text); line-height: 1.3; color: #0b1b2b; }
      .resume-body { padding: 12px 12px 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; font-size: var(--resume-text); }
      .resume-body.grid-two { display: grid; grid-template-columns: 36% 64%; gap: 12px; align-items: stretch; min-height: 100%; }
      .resume-page.layout-two .resume-body.grid-two { grid-template-columns: 34% 66%; gap: 10px; padding: 10px 10px 12px; }
      .resume-col { display: flex; flex-direction: column; gap: 8px; min-height: 100%; font-size: var(--resume-text); }
      .resume-col-side { background: var(--accent); color: var(--accent-text); border-radius: 10px; padding: 12px; border: 1px solid var(--accent-border); display: flex; flex-direction: column; gap: 12px; }
      .resume-page.layout-two .resume-col-side { padding: 12px 10px; }
      .resume-col-side .resume-section { background: transparent; border: none; padding: 0; color: inherit; }
      .resume-col-side .resume-card { background: transparent; border: none; padding: 0; color: inherit; }
      .resume-col-side .resume-section-title { color: rgba(255,255,255,0.92); border-bottom: 1px solid rgba(255,255,255,0.25); padding-bottom: 6px; margin-bottom: 8px; font-size: var(--resume-subtitle); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
      .resume-col-side .resume-skill-cat { color: var(--accent-text); }
      .resume-col-side .resume-skill-inline-row,
      .resume-col-side .resume-skill-inline-list,
      .resume-col-side .resume-skill-inline span,
      .resume-col-side .resume-contact-list li,
      .resume-col-side .resume-card,
      .resume-col-side .resume-strong,
      .resume-col-side .resume-meta-line { color: var(--accent-text); }
      .resume-col-side .resume-link { color: var(--accent-text); text-decoration: underline; }
      .resume-section { border: 1px solid var(--accent-border); border-radius: 6px; padding: 10px 10px; background: #ffffff; font-size: var(--resume-text); }
      .resume-section-title { font-size: var(--resume-subtitle); letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
      .resume-card { border: 1px solid var(--accent-border); border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: var(--resume-text); }
      .resume-page.layout-single .resume-section { padding: 8px 8px; }
      .resume-page.layout-single .resume-section-title { margin-bottom: 6px; }
      .resume-page.layout-single .resume-card { padding: 6px 8px; }
      .resume-section.resume-certifications { padding: 8px 8px; }
      .resume-section.resume-certifications .resume-section-title { font-size: var(--resume-subtitle); letter-spacing: 0.08em; margin-bottom: 6px; }
      .resume-section.resume-certifications .resume-card { padding: 6px 8px; background: #f8fafc; border-style: solid; }
      .resume-section.resume-certifications .resume-cert-list { list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
      .resume-section.resume-certifications .resume-cert-list li { font-size: var(--resume-text); line-height: 1.32; }
      .resume-section.resume-certifications .resume-cert-link { font-weight: 600; color: var(--accent); text-decoration: underline; text-underline-offset: 2px; margin-left: 4px; }
      .resume-page.layout-two .resume-section.resume-certifications { padding: 8px 0; background: transparent; border: none; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-card { padding: 6px 0; background: transparent; border: none; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-cert-list { list-style: none; padding-left: 0; }
      .resume-page.layout-two .resume-section.resume-certifications .resume-section-title { color: rgba(255,255,255,0.9); }
      .resume-page.layout-two .resume-section.resume-certifications .resume-cert-link { color: var(--accent-text); }
      .resume-card.resume-skills-compact { display: flex; flex-direction: column; gap: 6px; font-size: var(--resume-text); }
      .resume-skill-inline-row { display: flex; flex-direction: column; gap: 2px; font-size: var(--resume-text); line-height: 1.3; color: inherit; }
      .resume-skill-inline-row.single { flex-direction: row; flex-wrap: wrap; align-items: baseline; gap: 6px; }
      .resume-skill-cat-inline { font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: inherit; font-size: var(--resume-subtitle); }
      .resume-skill-inline-items { display: flex; flex-wrap: wrap; gap: 6px; color: inherit; }
      .resume-skill-inline-items.single { display: inline-flex; }
      .resume-skill-inline-item { color: inherit; }
      .resume-section.resume-skills-inline .resume-card { padding: 6px 8px; }
      .resume-skills-inline-text { font-size: var(--resume-text); line-height: 1.3; color: #0b1b2b; }
      .resume-bullets { margin: 0; padding-left: 14px; font-size: var(--resume-text); }
      .resume-bullet-item { margin-bottom: 7px; font-size: var(--resume-text); line-height: 1.35; }
      .resume-bullet-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 3px; font-size: var(--resume-text); }
      .resume-strong { font-weight: 700; font-size: var(--resume-text); }
      .resume-muted { color: #475569; font-size: var(--resume-text); }
      .resume-subbullets { margin: 0; padding-left: 14px; list-style: disc; font-size: var(--resume-text); }
      .resume-subbullets li { margin-bottom: 5px; font-size: var(--resume-text); line-height: 1.35; }
      .resume-link { color: inherit; text-decoration: none; }
      .resume-row { display: flex; flex-direction: column; gap: 2px; font-size: var(--resume-text); }
      .resume-meta-line { font-size: var(--resume-text); color: #475569; }
      .resume-edu-line { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: var(--resume-text); }
      .resume-edu-line .edu-period { white-space: nowrap; text-align: right; }
      .resume-contact-card { border: none; border-radius: 0; padding: 0; background: transparent; }
      .resume-contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: var(--resume-text); }
      .resume-contact-list li { font-size: var(--resume-text); color: #0b1b2b; line-height: 1.4; }
      .resume-contact-list a { color: inherit; text-decoration: none; }
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
