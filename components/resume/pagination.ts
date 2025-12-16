const PAGE_HEIGHT_PX = 1123;

type SectionId = "experience" | "skills" | "education" | "projects" | "certifications";

export function measureSections(
  root: HTMLElement,
  sectionOrder: SectionId[]
): { limit: number; heights: Partial<Record<SectionId, number>> } {
  const pageEl = root.querySelector<HTMLElement>(".resume-page");
  const bodyEl = pageEl?.querySelector<HTMLElement>(".resume-body");
  const rawLimit = bodyEl?.clientHeight || pageEl?.clientHeight || PAGE_HEIGHT_PX;
  const limit = Math.max(0, rawLimit - 24); // keep headroom for rounding/padding

  const heights: Partial<Record<SectionId, number>> = {};
  sectionOrder.forEach((id) => {
    const el = root.querySelector<HTMLElement>(`.resume-section[data-section-id="${id}"]`);
    if (el) heights[id] = el.offsetHeight;
  });

  return { limit, heights };
}

export function paginateByMeasurement(
  order: SectionId[],
  heights: Partial<Record<SectionId, number>>,
  layoutMode: "single" | "two",
  limit: number,
  gap: number
) {
  const pages: SectionId[][] = [[]];
  let mainHeight = 0;
  let sideHeight = 0;

  order.forEach((id) => {
    const h = heights[id] ?? 0;
    const isSide = layoutMode === "two" && (id === "skills" || id === "certifications");
    const addGapMain = !isSide && pages[pages.length - 1].some((sid) => sid !== "skills" && sid !== "certifications");
    const addGapSide = isSide && pages[pages.length - 1].some((sid) => sid === "skills" || sid === "certifications");

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
