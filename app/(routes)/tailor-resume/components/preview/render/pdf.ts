"use client";

const PDF_EXPORT_ATTR = "data-pdf-export-target";
const PDF_EXPORT_HOST_LEFT_PX = -100000;
const PDF_EXPORT_SCALE_MIN = 2;
const PDF_EXPORT_SCALE_MAX = 3;
const PDF_EXPORT_SCALE_DPR_MULTIPLIER = 2;

function computePdfExportScale() {
  const dpr = window.devicePixelRatio || 1;
  const scaled = Math.ceil(dpr * PDF_EXPORT_SCALE_DPR_MULTIPLIER);
  return Math.min(PDF_EXPORT_SCALE_MAX, Math.max(PDF_EXPORT_SCALE_MIN, scaled));
}

type DownloadResumePdfArgs = {
  resumeDocEl: HTMLElement | null;
  resumeWrapperEl: HTMLElement | null;
  fullName?: string | null;
  fileName?: string | null;
  pageWidthPx: number;
  pageHeightPx: number;
};

export function buildSafePdfFileBase(fullName?: string | null) {
  const baseName = (fullName || "Resume").trim();
  const safeBaseName = baseName.replace(/[\\/:*?"<>|]+/g, "").trim() || "Resume";
  return safeBaseName.replace(/\s+/g, "_");
}

export function sanitizePdfFileName(fileName: string) {
  const trimmed = fileName.trim();
  if (!trimmed) return null;
  const safe = trimmed.replace(/[\\/:*?"<>|]+/g, "").trim();
  if (!safe) return null;
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
  return withExt;
}

export function buildDefaultResumePdfFileName(fullName?: string | null) {
  return `${buildSafePdfFileBase(fullName)}_Resume.pdf`;
}

export async function downloadResumePdf({
  resumeDocEl,
  resumeWrapperEl,
  fullName,
  fileName,
  pageWidthPx,
  pageHeightPx,
}: DownloadResumePdfArgs) {
  if (!resumeDocEl) {
    throw new Error("No resume content found to export.");
  }

  const defaultFileName = buildDefaultResumePdfFileName(fullName);
  const resolvedFileName = fileName ? sanitizePdfFileName(fileName) : null;

  const exportToken = `pdf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let exportHost: HTMLDivElement | null = null;
  let exportRoot: HTMLElement | null = null;
  let exportDoc: HTMLElement | null = null;

  try {
    resumeDocEl.setAttribute(PDF_EXPORT_ATTR, exportToken);
    resumeWrapperEl?.setAttribute(PDF_EXPORT_ATTR, exportToken);

    exportHost = document.createElement("div");
    exportHost.style.position = "fixed";
    exportHost.style.left = `${PDF_EXPORT_HOST_LEFT_PX}px`;
    exportHost.style.top = "0";
    exportHost.style.width = `${pageWidthPx}px`;
    exportHost.style.height = `${pageHeightPx}px`;
    exportHost.style.background = "#ffffff";
    exportHost.style.pointerEvents = "none";
    exportHost.style.zIndex = "-1";

    const resumeRoot = resumeDocEl.closest<HTMLElement>(".resume-root") ?? resumeDocEl;
    exportRoot = resumeRoot.cloneNode(true) as HTMLElement;
    exportRoot.style.setProperty("--page-width", `${pageWidthPx}px`);
    exportRoot.style.setProperty("--page-height", `${pageHeightPx}px`);
    exportRoot.classList.add("is-pdf-export");

    const exportWrapper = exportRoot.querySelector<HTMLElement>(
      `[${PDF_EXPORT_ATTR}="${exportToken}"]`,
    );
    if (exportWrapper) exportWrapper.style.transform = "none";

    exportHost.appendChild(exportRoot);
    document.body.appendChild(exportHost);

    exportDoc = exportRoot.querySelector<HTMLElement>(`[${PDF_EXPORT_ATTR}="${exportToken}"]`);
    if (!exportDoc) {
      throw new Error("Unable to prepare resume export.");
    }

    // Avoid layout jitter in the visible UI by rendering from the offscreen clone.
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const exportScale = computePdfExportScale();

    const pages = exportDoc.querySelectorAll<HTMLElement>(".resume-page");
    if (!pages.length) {
      throw new Error("No resume pages found to export.");
    }

    const pdf = new jsPDF({
      unit: "px",
      format: [pageWidthPx, pageHeightPx],
      hotfixes: ["px_scaling"],
      compress: true,
    });
    const pageList = Array.from(pages);

    for (let i = 0; i < pageList.length; i += 1) {
      const page = pageList[i];
      const pageRect = page.getBoundingClientRect();
      const canvas = await html2canvas(page, {
        scale: exportScale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: pageWidthPx,
        height: pageHeightPx,
        windowWidth: pageWidthPx,
        windowHeight: pageHeightPx,
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidthPx,
        pageHeightPx,
        undefined,
        "SLOW",
      );

      const linkScaleX = pageWidthPx / pageRect.width;
      const linkScaleY = pageHeightPx / pageRect.height;
      const anchors = page.querySelectorAll<HTMLAnchorElement>("a[href]");
      anchors.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const rect = anchor.getBoundingClientRect();
        const x = (rect.left - pageRect.left) * linkScaleX;
        const y = (rect.top - pageRect.top) * linkScaleY;
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

    pdf.save(resolvedFileName ?? defaultFileName);
  } finally {
    resumeDocEl.removeAttribute(PDF_EXPORT_ATTR);
    resumeWrapperEl?.removeAttribute(PDF_EXPORT_ATTR);
    exportHost?.remove();
  }
}
