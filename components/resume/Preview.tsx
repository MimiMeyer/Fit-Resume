import { CSSProperties, MutableRefObject } from "react";

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
}: PreviewProps) {
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
          <style dangerouslySetInnerHTML={{ __html: resumeStyles }} />
          <div style={zoomStyle} className="resume-wrapper" ref={resumeWrapperRef}>
            <div className="resume-root" style={pageStyle}>
              <div className="resume-doc" ref={resumeRef} dangerouslySetInnerHTML={{ __html: pagesHtml }} />
            </div>
          </div>
          <p className="text-[11px] text-zinc-600">
            {paginatedSectionsCount} page{paginatedSectionsCount > 1 ? "s" : ""} | {zoomPercent}% zoom
          </p>
        </div>
      </div>
    </div>
  );
}
