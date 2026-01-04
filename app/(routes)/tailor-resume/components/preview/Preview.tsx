"use client";

import { CSSProperties, MutableRefObject, useEffect, useRef, useState } from "react";

type PreviewProps = {
  resumeStyles: string;
  pagesHtml: string;
  zoomStyle: CSSProperties;
  pageStyle: CSSProperties;
  paginatedSectionsCount: number;
  zoomPercent: number;
  resumeRef: MutableRefObject<HTMLDivElement | null>;
  resumeWrapperRef: MutableRefObject<HTMLDivElement | null>;
  maxHeight: string;
  isEditable?: boolean;
  onCommitEdits?: (html: string) => void;
};

export function Preview({
  resumeStyles,
  pagesHtml,
  zoomStyle,
  pageStyle,
  paginatedSectionsCount,
  zoomPercent,
  resumeRef,
  resumeWrapperRef,
  maxHeight,
  isEditable = false,
  onCommitEdits,
}: PreviewProps) {
  const hasPendingEditsRef = useRef(false);
  const latestHtmlRef = useRef("");
  const paginateRafRef = useRef<number | null>(null);
  const isPaginatingRef = useRef(false);

  const [livePageCount, setLivePageCount] = useState(paginatedSectionsCount);

  const getPages = () => {
    const doc = resumeRef.current;
    if (!doc) return [];
    return Array.from(doc.querySelectorAll<HTMLElement>(".resume-page"));
  };

  const updatePageLabels = (pages: HTMLElement[]) => {
    const shouldShow = pages.length > 1;
    pages.forEach((page, idx) => {
      page.setAttribute("data-page", shouldShow ? `Page ${idx + 1}` : "");
    });
  };

  const getColumns = (page: HTMLElement) => {
    const body = page.querySelector<HTMLElement>(".resume-body");
    if (!body) return null;

    if (page.classList.contains("layout-two")) {
      return {
        mode: "two" as const,
        body,
        side: body.querySelector<HTMLElement>(".resume-col-side"),
        main: body.querySelector<HTMLElement>(".resume-col-main"),
      };
    }

    return { mode: "single" as const, body };
  };

  const getFirstSection = (container: HTMLElement | null) =>
    container?.querySelector<HTMLElement>(".resume-section[data-section-id]") ?? null;

  const getLastSection = (container: HTMLElement | null) =>
    container?.querySelector<HTMLElement>(".resume-section[data-section-id]:last-of-type") ?? null;

  const getContainerForSection = (
    cols:
      | { mode: "two"; side: HTMLElement | null; main: HTMLElement | null }
      | { mode: "single"; body: HTMLElement },
    section: HTMLElement,
  ) => {
    if (cols.mode === "single") return cols.body;
    const id = section.getAttribute("data-section-id");
    const isSide = id === "skills" || id === "certifications";
    return isSide ? cols.side : cols.main;
  };

  const getCutoffBottom = (page: HTMLElement) => page.getBoundingClientRect().bottom - 24;

  const containerOverflows = (page: HTMLElement, container: HTMLElement | null) => {
    if (!container) return false;
    const last = getLastSection(container);
    if (!last) return false;
    return last.getBoundingClientRect().bottom > getCutoffBottom(page) + 0.5;
  };

  const insertGapBefore = (doc: HTMLElement, node: Element | null) => {
    const gap = doc.ownerDocument.createElement("div");
    gap.className = "resume-page-gap";
    gap.setAttribute("aria-hidden", "true");
    if (node) doc.insertBefore(gap, node);
    else doc.appendChild(gap);
    return gap;
  };

  const clearPageSections = (page: HTMLElement) => {
    const cols = getColumns(page);
    if (!cols) return;

    if (cols.mode === "two") {
      cols.main?.querySelectorAll(".resume-section[data-section-id]").forEach((el) => el.remove());
      cols.side?.querySelectorAll(".resume-section[data-section-id]").forEach((el) => el.remove());
      cols.side?.querySelectorAll(".resume-contact-card").forEach((el) => el.remove());
      return;
    }

    cols.body.querySelectorAll(".resume-section[data-section-id]").forEach((el) => el.remove());
  };

  const createEmptyPageFromTemplate = (template: HTMLElement) => {
    const clone = template.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".resume-top").forEach((el) => el.remove());
    clearPageSections(clone);
    return clone;
  };

  const ensureNextPage = (page: HTMLElement) => {
    const doc = resumeRef.current;
    if (!doc) return null;

    // Skip gap if present.
    const next =
      page.nextElementSibling?.classList.contains("resume-page-gap")
        ? page.nextElementSibling.nextElementSibling
        : page.nextElementSibling;

    if (next?.classList.contains("resume-page")) return next as HTMLElement;

    const template = getPages()[0];
    if (!template) return null;

    const insertBefore = page.nextElementSibling;
    const gap = insertGapBefore(doc, insertBefore);
    const newPage = createEmptyPageFromTemplate(template);
    if (insertBefore) doc.insertBefore(newPage, insertBefore);
    else doc.appendChild(newPage);

    // Keep gap right before the new page.
    if (gap.nextElementSibling !== newPage) {
      gap.remove();
      insertGapBefore(doc, newPage);
    }

    return newPage;
  };

  const prependSection = (container: HTMLElement, section: HTMLElement) => {
    const first = getFirstSection(container);
    if (first) container.insertBefore(section, first);
    else container.appendChild(section);
  };

  const appendSection = (container: HTMLElement, section: HTMLElement) => {
    container.appendChild(section);
  };

  const repaginate = () => {
    const doc = resumeRef.current;
    if (!doc) return;

    const shouldPreserveSelection = (() => {
      const active = document.activeElement;
      if (!active) return false;
      return doc.contains(active);
    })();

    const selection = shouldPreserveSelection ? window.getSelection() : null;
    const savedRange =
      selection && selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;

    isPaginatingRef.current = true;
    try {
      // Push overflow forward (whole sections only).
      let pages = getPages();
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const cols = getColumns(page);
        if (!cols) continue;

        let guard = 0;
        while (
          (cols.mode === "two"
            ? containerOverflows(page, cols.main) || containerOverflows(page, cols.side)
            : containerOverflows(page, cols.body)) &&
          guard < 50
        ) {
          guard++;

          const nextPage = ensureNextPage(page);
          if (!nextPage) break;
          const nextCols = getColumns(nextPage);
          if (!nextCols) break;

          if (cols.mode === "two" && nextCols.mode === "two") {
            const overflowMain = containerOverflows(page, cols.main);
            const overflowSide = containerOverflows(page, cols.side);
            const source = overflowMain ? cols.main : overflowSide ? cols.side : cols.main;
            const last = getLastSection(source) ?? getLastSection(cols.main) ?? getLastSection(cols.side);
            if (!last) break;
            if (pageIndex > 0 && (source?.querySelectorAll(".resume-section[data-section-id]").length ?? 0) <= 1) {
              break;
            }

            const target = getContainerForSection(nextCols, last);
            if (!target) break;

            last.remove();
            prependSection(target, last);
          } else {
            const last = getLastSection(cols.mode === "two" ? cols.body : cols.body);
            if (!last) break;
            if (pageIndex > 0 && cols.body.querySelectorAll(".resume-section[data-section-id]").length <= 1) {
              break;
            }
            last.remove();
            prependSection(nextCols.body, last);
          }

          pages = getPages();
        }
      }

      // Pull sections back when space becomes available (deletions).
      let pagesAfter = getPages();
      for (let pageIndex = 0; pageIndex < pagesAfter.length - 1; pageIndex++) {
        const page = pagesAfter[pageIndex];
        const nextPage = pagesAfter[pageIndex + 1];
        const cols = getColumns(page);
        const nextCols = getColumns(nextPage);
        if (!cols || !nextCols) continue;

        let guard = 0;
        while (guard < 50) {
          guard++;

          if (cols.mode === "two" && nextCols.mode === "two") {
            const tryPull = (from: HTMLElement | null, to: HTMLElement | null) => {
              if (!from || !to) return false;
              const first = getFirstSection(from);
              if (!first) return false;
              first.remove();
              appendSection(to, first);
              if (containerOverflows(page, to)) {
                first.remove();
                prependSection(from, first);
                return false;
              }
              return true;
            };

            const pulledMain = tryPull(nextCols.main, cols.main);
            const pulledSide = tryPull(nextCols.side, cols.side);
            if (!pulledMain && !pulledSide) break;
          } else {
            const first = getFirstSection(nextCols.body);
            if (!first) break;
            first.remove();
            appendSection(cols.body, first);
            if (containerOverflows(page, cols.body)) {
              first.remove();
              prependSection(nextCols.body, first);
              break;
            }
          }

          pagesAfter = getPages();
        }
      }

      // Remove trailing empty pages + gaps.
      let finalPages = getPages();
      for (let i = finalPages.length - 1; i >= 1; i--) {
        const page = finalPages[i];
        if (page.querySelector(".resume-section[data-section-id]")) break;
        const gap = page.previousElementSibling;
        page.remove();
        if (gap?.classList.contains("resume-page-gap")) gap.remove();
      }

      finalPages = getPages();
      updatePageLabels(finalPages);
      setLivePageCount(finalPages.length || 1);
    } finally {
      isPaginatingRef.current = false;

      if (savedRange && selection) {
        try {
          if (!savedRange.startContainer.isConnected || !savedRange.endContainer.isConnected) {
            // Skip restoring selection if nodes are no longer in the DOM.
            return;
          }
          selection.removeAllRanges();
          selection.addRange(savedRange);
        } catch {
          // ignore selection restore failures
        }
      }
    }
  };

  const handleInput = () => {
    if (!isEditable) return;
    if (isPaginatingRef.current) return;
    hasPendingEditsRef.current = true;
    latestHtmlRef.current = resumeRef.current?.innerHTML ?? "";

    if (paginateRafRef.current) cancelAnimationFrame(paginateRafRef.current);
    paginateRafRef.current = requestAnimationFrame(() => {
      paginateRafRef.current = null;
      repaginate();
      latestHtmlRef.current = resumeRef.current?.innerHTML ?? "";
    });
  };

  const handleBlur = () => {
    if (!isEditable || !onCommitEdits) return;
    if (!hasPendingEditsRef.current) return;
    onCommitEdits(latestHtmlRef.current || resumeRef.current?.innerHTML || "");
    hasPendingEditsRef.current = false;
  };

  useEffect(() => {
    if (!isEditable) return;
    if (!resumeRef.current) return;

    // Hydrate once from props (layout changes, generate, reset) and then let DOM be the source of truth while editing.
    resumeRef.current.innerHTML = pagesHtml;
    const pages = getPages();
    updatePageLabels(pages);
    setLivePageCount(pages.length || 1);

    repaginate();

    return () => {
      if (paginateRafRef.current) cancelAnimationFrame(paginateRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable, pagesHtml]);

  useEffect(() => {
    if (!isEditable) return;
    if (!resumeRef.current) return;

    // Font-size / style changes affect layout but don't change pagesHtml while editing.
    if (paginateRafRef.current) cancelAnimationFrame(paginateRafRef.current);
    paginateRafRef.current = requestAnimationFrame(() => {
      paginateRafRef.current = null;
      repaginate();
      latestHtmlRef.current = resumeRef.current?.innerHTML ?? "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable, resumeStyles]);

  useEffect(() => {
    if (isEditable) return;
    setLivePageCount(paginatedSectionsCount);
  }, [isEditable, paginatedSectionsCount]);

  return (
    <div
      className="relative overflow-auto rounded-lg bg-zinc-100 p-4 min-w-0 w-full"
      style={{
        maxHeight,
        marginInline: "auto",
        overflowX: "auto",
        scrollbarGutter: "stable",
      }}
    >
      <div className="flex w-full justify-center">
        <div className="relative z-10 flex w-full max-w-full flex-col items-center" style={{ gap: "22px" }}>
          <style>{resumeStyles}</style>
          <div style={zoomStyle} className="resume-wrapper" ref={resumeWrapperRef}>
            <div className="resume-root" style={pageStyle}>
              <div
                className="resume-doc"
                ref={resumeRef}
                contentEditable={isEditable}
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleBlur}
                {...(!isEditable ? { dangerouslySetInnerHTML: { __html: pagesHtml } } : {})}
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-600">
            {(isEditable ? livePageCount : paginatedSectionsCount)} page
            {(isEditable ? livePageCount : paginatedSectionsCount) > 1 ? "s" : ""} | {zoomPercent}% zoom
          </p>
        </div>
      </div>
    </div>
  );
}
