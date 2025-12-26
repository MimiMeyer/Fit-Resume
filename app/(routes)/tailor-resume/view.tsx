"use client";

import { JdPanel } from "./components/JdPanel";
import { Preview } from "./components/Preview";
import { Toolbar } from "./components/Toolbar";
import type { GeneratedResume } from "@/types/resume-agent";
import type { Profile } from "@/types/profile";
import { styles } from "./style-constants";
import { useCreateResume } from "./useCreateResume";

const ZOOM_STEP = 0.05;

export function CreateResumeView({
  profile,
  onGenerate,
}: {
  profile: Profile;
  onGenerate: (jd: string) => Promise<GeneratedResume>;
}) {
  const {
    jd,
    setJd,
    generated,
    generateError,
    isGenerating,
    viewMode,
    setViewMode,
    showJobDescription,
    setShowJobDescription,
    zoomPercent,
    clampZoom,
    setZoom,
    pdfGenerating,
    pdfError,
    accentColor,
    setAccentColor,
    layoutMode,
    setLayoutMode,
    resumeStyles,
    pagesHtml,
    commitEditsHtml,
    hasCachedEdits,
    zoomStyle,
    pageStyle,
    paginatedSectionsCount,
    resumeRef,
    resumeWrapperRef,
    handleGenerate,
    handleDownloadPdf,
    resetToProfile,
  } = useCreateResume(profile, { onGenerate });

  return (
    <section className={styles.rootCard}>
      <div className={styles.headerRow}>
        <div className={styles.modeTogglePill}>
          {(["edit", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`${styles.modeButtonBase} ${
                viewMode === mode ? styles.modeButtonActive : styles.modeButtonInactive
              }`}
            >
              {mode === "edit" ? "Edit mode" : "Preview mode"}
            </button>
          ))}
        </div>
        {generated ? <span className={styles.statusBadge}>AI resume ready</span> : null}
        {generated || hasCachedEdits ? (
          <button
            type="button"
            onClick={resetToProfile}
            className={styles.resetButton}
          >
            Reset to Profile
          </button>
        ) : null}
      </div>

      <div
        className={`${styles.panelGrid} ${
          viewMode === "edit" && showJobDescription
            ? "lg:grid-cols-[360px_minmax(0,1fr)]"
            : "grid-cols-1"
        }`}
      >
        {viewMode === "edit" && showJobDescription ? (
          <JdPanel
            show={showJobDescription}
            jd={jd}
            setJd={setJd}
            onGenerate={handleGenerate}
            onToggle={() => setShowJobDescription((s) => !s)}
            isGenerating={isGenerating}
            hasGenerated={!!generated}
            error={generateError}
          />
        ) : null}

        <div className={styles.previewPanel}>
          <Toolbar
            viewMode={viewMode}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            zoomPercent={zoomPercent}
            zoomStep={ZOOM_STEP * 100}
            onZoomChange={(val) => setZoom(clampZoom(val / 100))}
            onDownloadPdf={handleDownloadPdf}
            pdfGenerating={pdfGenerating}
            pdfError={pdfError}
            onShowJd={
              !showJobDescription && viewMode === "edit"
                ? () => setShowJobDescription(true)
                : undefined
            }
          />

          <Preview
            resumeStyles={resumeStyles}
            pagesHtml={pagesHtml}
            zoomStyle={zoomStyle}
            pageStyle={pageStyle}
            paginatedSectionsCount={paginatedSectionsCount}
            zoomPercent={zoomPercent}
            resumeRef={resumeRef}
            resumeWrapperRef={resumeWrapperRef}
            maxHeight={viewMode === "edit" ? "75vh" : "85vh"}
            isEditable={viewMode === "edit"}
            onCommitEdits={(html) => commitEditsHtml(html)}
          />
        </div>
      </div>
    </section>
  );
}
