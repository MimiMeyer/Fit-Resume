"use client";

type DownloadResumePdfArgs = {
  resumeDocEl: HTMLElement | null;
  resumeWrapperEl: HTMLElement | null;
  fullName?: string | null;
  pageWidthPx: number;
  pageHeightPx: number;
};

function buildSafeBaseName(fullName?: string | null) {
  const baseName = (fullName || "Resume").trim();
  const safeBaseName = baseName.replace(/[\\/:*?"<>|]+/g, "").trim() || "Resume";
  return safeBaseName.replace(/\s+/g, "_");
}

export async function downloadResumePdf({
  resumeDocEl,
  resumeWrapperEl,
  fullName,
  pageWidthPx,
  pageHeightPx,
}: DownloadResumePdfArgs) {
  if (!resumeDocEl) {
    throw new Error("No resume content found to export.");
  }

  const fileBase = buildSafeBaseName(fullName);

  let resumeRoot: HTMLElement | null = null;
  let prevPageWidth: string | null = null;
  let prevPageHeight: string | null = null;
  let prevWrapperTransform: string | null = null;

  try {
    resumeRoot = resumeDocEl.closest<HTMLElement>(".resume-root") ?? null;
    if (resumeRoot) {
      prevPageWidth = resumeRoot.style.getPropertyValue("--page-width");
      prevPageHeight = resumeRoot.style.getPropertyValue("--page-height");
      resumeRoot.style.setProperty("--page-width", `${pageWidthPx}px`);
      resumeRoot.style.setProperty("--page-height", `${pageHeightPx}px`);
    }

    if (resumeWrapperEl) {
      prevWrapperTransform = resumeWrapperEl.style.transform;
      resumeWrapperEl.style.transform = "none";
    }

    document.body.style.setProperty("background", "#ffffff");

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const pages = resumeDocEl.querySelectorAll<HTMLElement>(".resume-page");
    if (!pages.length) {
      throw new Error("No resume pages found to export.");
    }

    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageList = Array.from(pages);

    for (let i = 0; i < pageList.length; i += 1) {
      const page = pageList[i];
      const pageRect = page.getBoundingClientRect();
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: pageWidthPx,
        height: pageHeightPx,
        windowWidth: pageWidthPx,
        windowHeight: pageHeightPx,
      });

      const imgData = canvas.toDataURL("image/png");
      const fitScale = pdfWidth / canvas.width;
      const renderWidth = canvas.width * fitScale;
      const renderHeight = canvas.height * fitScale;
      const xOffset = Math.max((pdfWidth - renderWidth) / 2, 0);
      const yOffset = Math.max((pdfHeight - renderHeight) / 2, 0);

      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        renderWidth,
        renderHeight,
        undefined,
        "FAST",
      );

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
  } finally {
    if (resumeRoot) {
      resumeRoot.style.setProperty("--page-width", prevPageWidth ?? "");
      resumeRoot.style.setProperty("--page-height", prevPageHeight ?? "");
    }

    if (resumeWrapperEl && prevWrapperTransform !== null) {
      resumeWrapperEl.style.transform = prevWrapperTransform;
    }

    document.body.style.removeProperty("background");
  }
}
