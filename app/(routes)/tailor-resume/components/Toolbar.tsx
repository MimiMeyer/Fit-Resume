"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toolbarStyles } from "../style-constants";
import type { ResumeBorders, ResumeFontFamilies, ResumeFontSizes, ResumeSpacing } from "../types";
import {
  DEFAULT_BORDERS,
  DEFAULT_FONT_FAMILIES,
  DEFAULT_FONT_SIZES,
  DEFAULT_SPACING,
} from "../types";

type ToolbarProps = {
  viewMode: "edit" | "preview";
  layoutMode: "single" | "two";
  setLayoutMode: (mode: "single" | "two") => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  accentOpacity: number;
  setAccentOpacity: (next: number) => void;
  fontSizes: ResumeFontSizes;
  setFontSizes: (next: ResumeFontSizes) => void;
  fontFamilies: ResumeFontFamilies;
  setFontFamilies: (next: ResumeFontFamilies) => void;
  borders: ResumeBorders;
  setBorders: (next: ResumeBorders) => void;
  spacing: ResumeSpacing;
  setSpacing: (next: ResumeSpacing) => void;
  zoomPercent: number;
  zoomStep: number;
  onZoomChange: (next: number) => void;
  defaultPdfFileName: string;
  onDownloadPdf: (fileName?: string) => void;
  pdfGenerating: boolean;
  pdfError: string | null;
  onShowJd?: () => void;
};

const RESET_GLYPH = "↺";
const accentOptions = [
  { name: "Gray", value: "#808080" },
  { name: "Teal", value: "#008080" },
  { name: "Blue", value: "#2563eb" },
  { name: "Pink", value: "#ff8a9d" },
  { name: "Green", value: "#008000" },
  { name: "None", value: "#ffffff" },
];
const fontFamilyOptions = [
  { name: "Calibri", value: 'Calibri, "Segoe UI", Arial, sans-serif' },
  { name: "Segoe UI", value: '"Segoe UI", Calibri, Arial, sans-serif' },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: '"Times New Roman", Times, serif' },
];

type StyleTab = "fonts" | "size" | "spacing" | "borders";
const stripPdfExt = (value: string) => value.replace(/\.pdf$/i, "");

export function Toolbar(props: ToolbarProps) {
  const {
    viewMode,
    layoutMode,
    setLayoutMode,
    accentColor,
    setAccentColor,
    accentOpacity,
    setAccentOpacity,
    fontSizes,
    setFontSizes,
    fontFamilies,
    setFontFamilies,
    borders,
    setBorders,
    spacing,
    setSpacing,
    zoomPercent,
    zoomStep,
    onZoomChange,
    defaultPdfFileName,
    onDownloadPdf,
    pdfGenerating,
    pdfError,
    onShowJd,
  } = props;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const accentOpacityPercent = Math.round(accentOpacity * 100);
  const accentDefaults = useMemo(() => ({ opacity: 1 }), []);
  const fontSizeDefaults = DEFAULT_FONT_SIZES;
  const fontFamilyDefaults = DEFAULT_FONT_FAMILIES;
  const borderDefaults = DEFAULT_BORDERS;
  const spacingDefaults = DEFAULT_SPACING;

  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const styleMenuRef = useRef<HTMLDivElement | null>(null);
  const downloadMenuRef = useRef<HTMLDivElement | null>(null);
  const downloadInputRef = useRef<HTMLInputElement | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [styleTab, setStyleTab] = useState<StyleTab>("fonts");
  const [downloadBaseName, setDownloadBaseName] = useState(stripPdfExt(defaultPdfFileName));
  const resolvedPdfName = `${downloadBaseName.trim() || stripPdfExt(defaultPdfFileName)}.pdf`;

  useEffect(() => {
    setDownloadBaseName(stripPdfExt(defaultPdfFileName));
  }, [defaultPdfFileName]);

  useEffect(() => {
    if (!themeOpen && !styleOpen && !downloadOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = themeMenuRef.current;
      const s = styleMenuRef.current;
      const d = downloadMenuRef.current;
      if (
        (t && e.target instanceof Node && t.contains(e.target)) ||
        (s && e.target instanceof Node && s.contains(e.target)) ||
        (d && e.target instanceof Node && d.contains(e.target))
      ) {
        return;
      }
      setThemeOpen(false);
      setStyleOpen(false);
      setDownloadOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setThemeOpen(false);
      setStyleOpen(false);
      setDownloadOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [themeOpen, styleOpen, downloadOpen]);

  useEffect(() => {
    if (!downloadOpen) return;
    const raf = requestAnimationFrame(() => {
      downloadInputRef.current?.focus();
      downloadInputRef.current?.select();
    });
    return () => cancelAnimationFrame(raf);
  }, [downloadOpen]);

  const numInput =
    "w-15 shrink-0 rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm";

  const setBorderTarget = (key: "page" | "summary" | "section" | "content", next: boolean) =>
    setBorders({ ...borders, targets: { ...borders.targets, [key]: next } });
  const setAllBorderTargets = (next: boolean) =>
    setBorders({ ...borders, targets: { page: next, summary: next, section: next, content: next } });
  const areAllBorderTargetsSelected = (targets: ResumeBorders["targets"]) =>
    targets.page && targets.summary && targets.section && targets.content;

  const ZoomPill = () => (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-700">
      <button aria-label="Zoom out" onClick={() => onZoomChange(zoomPercent - zoomStep)} className="rounded-full px-2 py-1 transition hover:bg-white">-</button>
      <div className="flex items-center gap-2">
        <span className="text-zinc-600">Zoom</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-zinc-900 shadow-sm">{zoomPercent}%</span>
      </div>
      <button aria-label="Zoom in" onClick={() => onZoomChange(zoomPercent + zoomStep)} className="rounded-full px-2 py-1 transition hover:bg-white">+</button>
    </div>
  );

  return (
    <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 overflow-visible">
      {viewMode === "edit" ? (
        <>
          <div className="flex w-full items-center gap-2">
            {onShowJd ? (
              <div className="shrink-0">
                <button onClick={onShowJd} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm transition hover:border-[var(--accent)]">Show job description</button>
              </div>
            ) : null}

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative shrink-0" ref={themeMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setStyleOpen(false);
                      setThemeOpen((v) => !v);
                    }}
                    className={`inline-flex items-center gap-2 ${toolbarStyles.pillButton}`}
                    aria-haspopup="dialog"
                    aria-expanded={themeOpen}
                  >
                    <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-zinc-300" style={{ backgroundColor: accentColor }} aria-hidden>
                      {accentColor.toLowerCase() === "#ffffff" ? <span aria-hidden style={{ width: "140%", height: "2px", background: "#6b7280", display: "block", transform: "rotate(-20deg)" }} /> : null}
                    </span>
                    Theme
                  </button>
                  {themeOpen ? (
                    <div className={toolbarStyles.menuCardRight}>
                      <div className="space-y-3 text-[11px] font-semibold text-zinc-700">
                        <div className="flex items-center"><span className={toolbarStyles.menuSectionLabel}>Theme</span></div>
                        <div className={toolbarStyles.menuSectionLabel}>Accent</div>
                        <div className="grid w-full grid-cols-6 gap-2">
                          {accentOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setAccentColor(opt.value)}
                              className="relative mx-auto h-5 w-5 rounded-full border border-zinc-300"
                              style={{
                                backgroundColor: opt.value,
                                boxShadow:
                                  accentColor === opt.value
                                    ? opt.value.toLowerCase() === "#ffffff"
                                      ? "0 0 0 3px rgba(0,0,0,0.08)"
                                      : `0 0 0 3px ${opt.value}33`
                                    : undefined,
                              }}
                              aria-label={`Use ${opt.name} accent`}
                              title={opt.name}
                            >
                              {opt.value.toLowerCase() === "#ffffff" ? (
                                <span className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ width: "100%", height: "100%", transform: "rotate(-20deg)" }}>
                                  <span aria-hidden style={{ width: "120%", height: "2px", background: "#6b7280", display: "block" }} />
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`${toolbarStyles.menuSectionLabel} shrink-0`}>Opacity</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={accentOpacityPercent}
                            onChange={(e) => setAccentOpacity(clamp(Number(e.target.value), 0, 100) / 100)}
                            className="h-1 min-w-0 flex-1 accent-[var(--accent)]"
                          />
                          <span className="w-[4ch] shrink-0 text-right text-[11px] font-semibold text-zinc-700">
                            {accentOpacityPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative shrink-0" ref={styleMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOpen(false);
                      setStyleOpen((v) => !v);
                    }}
                    className={toolbarStyles.pillButton}
                    aria-haspopup="dialog"
                    aria-expanded={styleOpen}
                  >
                    Style
                  </button>
                  {styleOpen ? (
                    <div className={toolbarStyles.menuCardRight}>
                      <div className="space-y-3 text-[11px] font-semibold text-zinc-700">
                        <div className={toolbarStyles.tabPill} role="tablist" aria-label="Style tabs">
                          {(
                            [
                              { key: "fonts", label: "Fonts" },
                              { key: "size", label: "Font size" },
                              { key: "spacing", label: "Spacing" },
                              { key: "borders", label: "Borders" },
                            ] as const
                          ).map((t) => (
                            <button
                              key={t.key}
                              type="button"
                              role="tab"
                              aria-selected={styleTab === t.key}
                              onClick={() => setStyleTab(t.key)}
                              className={`${toolbarStyles.tabButtonBase} ${styleTab === t.key ? toolbarStyles.tabButtonActive : toolbarStyles.tabButtonInactive}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {styleTab === "fonts" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={toolbarStyles.menuSectionLabel}>Fonts</span>
                              <button type="button" onClick={() => setFontFamilies(fontFamilyDefaults)} className={toolbarStyles.resetAllButton} aria-label="Reset all fonts">Reset all <span aria-hidden>{RESET_GLYPH}</span></button>
                            </div>
                            {(
                              [
                                { key: "title", label: "Title font" },
                                { key: "heading", label: "Heading font" },
                                { key: "body", label: "Body font" },
                              ] as const
                            ).map((row) => (
                              <div key={row.key} className="space-y-1">
                                <div className={toolbarStyles.menuSectionLabel}>{row.label}</div>
                                <div className="flex items-center gap-2">
                                  <select value={fontFamilies[row.key]} onChange={(e) => setFontFamilies({ ...fontFamilies, [row.key]: e.target.value })} className={toolbarStyles.select} style={{ fontFamily: fontFamilies[row.key] }}>
                                    {fontFamilyOptions.map((opt) => <option key={opt.name} value={opt.value}>{opt.name}</option>)}
                                  </select>
                                  <button type="button" onClick={() => setFontFamilies({ ...fontFamilies, [row.key]: fontFamilyDefaults[row.key] })} className={toolbarStyles.resetButton} aria-label={`Reset ${row.label}`} title="Reset">{RESET_GLYPH}</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {styleTab === "size" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={toolbarStyles.menuSectionLabel}>Font size</span>
                              <button type="button" onClick={() => setFontSizes(fontSizeDefaults)} className={toolbarStyles.resetAllButton} aria-label="Reset all font sizes">Reset all <span aria-hidden>{RESET_GLYPH}</span></button>
                            </div>
                            {(
                              [
                                { key: "headingPx", label: "Title size", min: 16, max: 32 },
                                { key: "subtitlePx", label: "Heading size", min: 10, max: 20 },
                                { key: "bodyPx", label: "Body size", min: 9, max: 14 },
                              ] as const
                            ).map((row) => (
                              <div key={row.key} className="space-y-1">
                                <div className={toolbarStyles.menuSectionLabel}>{row.label}</div>
                                <div className="flex items-center gap-2">
                                  <input type="range" min={row.min} max={row.max} step={1} value={fontSizes[row.key]} onChange={(e) => setFontSizes({ ...fontSizes, [row.key]: clamp(Number(e.target.value), row.min, row.max) })} className="h-1 w-full accent-[var(--accent)]" />
                                  <input type="number" min={row.min} max={row.max} step={1} value={fontSizes[row.key]} onChange={(e) => setFontSizes({ ...fontSizes, [row.key]: clamp(Number(e.target.value), row.min, row.max) })} className={numInput} />
                                  <button type="button" onClick={() => setFontSizes({ ...fontSizes, [row.key]: fontSizeDefaults[row.key] })} className={toolbarStyles.resetButton} aria-label={`Reset ${row.label}`} title="Reset">{RESET_GLYPH}</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {styleTab === "spacing" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={toolbarStyles.menuSectionLabel}>Spacing</span>
                              <button type="button" onClick={() => setSpacing(spacingDefaults)} className={toolbarStyles.resetAllButton} aria-label="Reset all spacing settings">Reset all <span aria-hidden>{RESET_GLYPH}</span></button>
                            </div>
                            {(
                              [
                                { key: "sectionGapPx", label: "Section gap", min: 0, max: 24 },
                                { key: "bulletGapPx", label: "Bullet spacing", min: 0, max: 12 },
                                { key: "pagePaddingPx", label: "Page padding", min: 4, max: 24 },
                              ] as const
                            ).map((row) => (
                              <div key={row.key} className="space-y-1">
                                <div className={toolbarStyles.menuSectionLabel}>{row.label}</div>
                                <div className="flex items-center gap-2">
                                  <input type="range" min={row.min} max={row.max} step={1} value={spacing[row.key]} onChange={(e) => setSpacing({ ...spacing, [row.key]: clamp(Number(e.target.value), row.min, row.max) })} className="h-1 w-full accent-[var(--accent)]" />
                                  <input type="number" min={row.min} max={row.max} step={1} value={spacing[row.key]} onChange={(e) => setSpacing({ ...spacing, [row.key]: clamp(Number(e.target.value), row.min, row.max) })} className={numInput} />
                                  <button type="button" onClick={() => setSpacing({ ...spacing, [row.key]: spacingDefaults[row.key] })} className={toolbarStyles.resetButton} aria-label={`Reset ${row.label}`} title="Reset">{RESET_GLYPH}</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {styleTab === "borders" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={toolbarStyles.menuSectionLabel}>Borders</span>
                              <button type="button" onClick={() => setBorders(borderDefaults)} className={toolbarStyles.resetAllButton} aria-label="Reset all border settings">Reset all <span aria-hidden>{RESET_GLYPH}</span></button>
                            </div>
                            <div className="space-y-1">
                              <div className={toolbarStyles.menuSectionLabel}>Border</div>
                              <div className="flex items-center gap-2">
                                <select value={String(borders.widthPx)} onChange={(e) => setBorders({ ...borders, widthPx: Number(e.target.value) })} className={toolbarStyles.select}>
                                  <option value="0">None</option><option value="1">Thin</option><option value="1.5">Medium</option><option value="2">Thick</option>
                                </select>
                                <button type="button" onClick={() => setBorders({ ...borders, widthPx: borderDefaults.widthPx })} className={toolbarStyles.resetButton} aria-label="Reset border width" title="Reset">{RESET_GLYPH}</button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className={toolbarStyles.menuSectionLabel}>Style</div>
                              <div className="flex items-center gap-2">
                                <select value={borders.style} onChange={(e) => setBorders({ ...borders, style: e.target.value as ToolbarProps["borders"]["style"] })} className={toolbarStyles.select}>
                                  <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
                                </select>
                                <button type="button" onClick={() => setBorders({ ...borders, style: borderDefaults.style })} className={toolbarStyles.resetButton} aria-label="Reset border style" title="Reset">{RESET_GLYPH}</button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className={toolbarStyles.menuSectionLabel}>Radius</div>
                              <div className="flex items-center gap-2">
                                <select value={borders.radius} onChange={(e) => setBorders({ ...borders, radius: e.target.value as ToolbarProps["borders"]["radius"] })} className={toolbarStyles.select}>
                                  <option value="sharp">Sharp</option><option value="rounded">Rounded</option>
                                </select>
                                <button type="button" onClick={() => setBorders({ ...borders, radius: borderDefaults.radius })} className={toolbarStyles.resetButton} aria-label="Reset border radius" title="Reset">{RESET_GLYPH}</button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className={toolbarStyles.menuSectionLabel}>Apply</div>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" checked={areAllBorderTargetsSelected(borders.targets)} onChange={(e) => setAllBorderTargets(e.target.checked)} />
                                <span>Select all</span>
                              </label>
                              <div className="max-h-28 space-y-2 overflow-y-auto pr-1">
                                {(
                                  [
                                    { key: "section", label: "Sections" },
                                    { key: "content", label: "Content" },
                                    { key: "summary", label: "Summary" },
                                    { key: "page", label: "Full page" },
                                  ] as const
                                ).map((row) => (
                                  <label key={row.key} className="flex items-center gap-2">
                                    <input type="checkbox" checked={borders.targets[row.key]} onChange={(e) => setBorderTarget(row.key, e.target.checked)} />
                                    <span>{row.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={toolbarStyles.tabPill}>
                  <button type="button" onClick={() => setLayoutMode("single")} className={`${toolbarStyles.tabButtonBase} ${layoutMode === "single" ? toolbarStyles.tabButtonActive : toolbarStyles.tabButtonInactive}`}>1 column</button>
                  <button type="button" onClick={() => setLayoutMode("two")} className={`${toolbarStyles.tabButtonBase} ${layoutMode === "two" ? toolbarStyles.tabButtonActive : toolbarStyles.tabButtonInactive}`}>2 columns</button>
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <ZoomPill />
                <div className="relative" ref={downloadMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOpen(false);
                      setStyleOpen(false);
                      setDownloadOpen((v) => !v);
                    }}
                    disabled={pdfGenerating}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pdfGenerating ? "Preparing PDF..." : "Download PDF"}
                  </button>
                  {downloadOpen ? (
                    <div className={toolbarStyles.menuCardRight}>
                      <form
                        className="space-y-3 text-[11px] font-semibold text-zinc-700"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!downloadBaseName.trim()) return;
                          setDownloadOpen(false);
                          onDownloadPdf(resolvedPdfName);
                        }}
                      >
                        <div className={toolbarStyles.menuSectionLabel}>PDF file name</div>
                        <div className="flex h-9 items-stretch overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                          <input
                            ref={downloadInputRef}
                            value={downloadBaseName}
                            onChange={(e) => setDownloadBaseName(stripPdfExt(e.target.value))}
                            className="w-full min-w-0 flex-1 bg-transparent px-2 py-1 text-[11px] font-semibold text-zinc-900 outline-none"
                            aria-label="PDF file name"
                          />
                          <div className="flex shrink-0 items-center border-l border-zinc-200 bg-zinc-50 px-2 text-[11px] font-semibold text-zinc-700">
                            .pdf
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDownloadOpen(false)}
                            className={toolbarStyles.resetAllButton}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!downloadBaseName.trim()}
                            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          >
                            Download
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {pdfError ? <p className="text-[11px] text-red-600">{pdfError}</p> : null}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {onShowJd ? (
              <button onClick={onShowJd} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm transition hover:border-[var(--accent)]">Show job description</button>
            ) : null}
            <ZoomPill />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onDownloadPdf()}
              disabled={pdfGenerating}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pdfGenerating ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>
          {pdfError ? <p className="text-[11px] text-red-600">{pdfError}</p> : null}
        </>
      )}
    </div>
  );
}
