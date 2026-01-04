import type { ResumeLayoutMode, ResumeSectionId } from "../../../types";

export function measureSections(
  root: HTMLElement,
  sectionOrder: ResumeSectionId[],
  pageHeightPx: number,
): { limit: number; heights: Partial<Record<ResumeSectionId, number>> } {
  const pageEl = root.querySelector<HTMLElement>(".resume-page");
  const bodyEl = pageEl?.querySelector<HTMLElement>(".resume-body");
  const rawLimit = bodyEl?.clientHeight || pageEl?.clientHeight || pageHeightPx;
  const limit = Math.max(0, rawLimit - 24);

  const heights: Partial<Record<ResumeSectionId, number>> = {};
  sectionOrder.forEach((id) => {
    const el = root.querySelector<HTMLElement>(
      `.resume-section[data-section-id="${id}"]`,
    );
    if (el) heights[id] = el.offsetHeight;
  });

  return { limit, heights };
}

export function paginateByMeasurement(
  order: ResumeSectionId[],
  heights: Partial<Record<ResumeSectionId, number>>,
  layoutMode: ResumeLayoutMode,
  limit: number,
  gap: number,
) {
  const pages: ResumeSectionId[][] = [[]];
  let mainHeight = 0;
  let sideHeight = 0;

  order.forEach((id) => {
    const h = heights[id] ?? 0;
    const isSide =
      layoutMode === "two" && (id === "skills" || id === "certifications");
    const addGapMain =
      !isSide &&
      pages[pages.length - 1].some(
        (sid) => sid !== "skills" && sid !== "certifications",
      );
    const addGapSide =
      isSide &&
      pages[pages.length - 1].some(
        (sid) => sid === "skills" || sid === "certifications",
      );

    const nextMain = isSide ? mainHeight : mainHeight + h + (addGapMain ? gap : 0);
    const nextSide = isSide ? sideHeight + h + (addGapSide ? gap : 0) : sideHeight;
    const overflow = Math.max(nextMain, nextSide) > limit;

    if (overflow && pages[pages.length - 1].length > 0) {
      pages.push([]);
      mainHeight = 0;
      sideHeight = 0;
    }

    pages[pages.length - 1].push(id);
    if (isSide) sideHeight += h + (sideHeight > 0 ? gap : 0);
    else mainHeight += h + (mainHeight > 0 ? gap : 0);
  });

  return pages;
}
