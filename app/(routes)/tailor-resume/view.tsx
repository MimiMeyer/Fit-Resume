"use client";

import { JobDescriptionPanel } from "./components/job-description/JobDescriptionPanel";
import { Preview } from "./components/preview/Preview";
import { Toolbar } from "./components/topbar/Toolbar";
import { EditSections } from "./components/topbar/edit/EditSections";
import type { Profile } from "@/types/profile";
import { styles } from "./style-constants";
import { useCreateResume } from "./useCreateResume";

const ZOOM_STEP = 0.05;

export function CreateResumeView({
  profile,
  updateProfile,
}: {
  profile: Profile;
  updateProfile: (updater: (current: Profile) => Profile, opts?: { flush?: boolean }) => void;
}) {
  const {
    jobDescription,
    setJobDescription,
    claudeApiKey,
    setClaudeApiKey,
    promptForApiKey,
    generated,
    generateError,
    isGenerating,
    showJobDescription,
    setShowJobDescription,
    zoomPercent,
    clampZoom,
    setZoom,
    pdfGenerating,
    pdfError,
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
    layoutMode,
    setLayoutMode,
    resumeStyles,
    pagesHtml,
    zoomStyle,
    pageStyle,
    paginatedSectionsCount,
    resumeRef,
    resumeWrapperRef,
    handleGenerate,
    handleDownloadPdf,
    resetToProfile,
    defaultPdfFileName,
    draft,
    setDraft,
    headerForEdit,
    experiencesForEdit,
    projectsForEdit,
    skillsForEdit,
    educationsForEdit,
    certificationsForEdit,
  } = useCreateResume(profile);

  const hasDraft = !!draft;

  return (
    <section className={styles.rootCard}>
      <div className={styles.headerRow}>
        <div className="flex flex-wrap items-center gap-2">
          {generated ? <span className={styles.statusBadge}>AI resume ready</span> : null}
          {generated || hasDraft ? (
            <button
              type="button"
              onClick={resetToProfile}
              className={styles.resetButton}
              title="Clears resume changes and reloads from profile"
            >
              Reset resume changes
            </button>
          ) : null}
        </div>
        <EditSections
          updateProfile={updateProfile}
          draft={draft}
          setDraft={setDraft}
          header={headerForEdit}
          experiences={experiencesForEdit}
          projects={projectsForEdit}
          skills={skillsForEdit}
          educations={educationsForEdit}
          certifications={certificationsForEdit}
        />
      </div>

      <div
        className={`${styles.panelGrid} ${
          showJobDescription ? "lg:grid-cols-[360px_minmax(0,1fr)]" : ""
        }`}
      >
        {showJobDescription ? (
          <div className="flex flex-col gap-3">
            <JobDescriptionPanel
              show
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              claudeApiKey={claudeApiKey}
              setClaudeApiKey={setClaudeApiKey}
              promptForApiKey={promptForApiKey}
              onGenerate={handleGenerate}
              onToggle={() => setShowJobDescription((s) => !s)}
              isGenerating={isGenerating}
              hasGenerated={!!generated}
              error={generateError}
            />
          </div>
        ) : null}

        <div className={styles.previewPanel}>
          <Toolbar
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            accentOpacity={accentOpacity}
            setAccentOpacity={setAccentOpacity}
            fontSizes={fontSizes}
            setFontSizes={setFontSizes}
            fontFamilies={fontFamilies}
            setFontFamilies={setFontFamilies}
            borders={borders}
            setBorders={setBorders}
            spacing={spacing}
            setSpacing={setSpacing}
            zoomPercent={zoomPercent}
            zoomStep={ZOOM_STEP * 100}
            onZoomChange={(val) => setZoom(clampZoom(val / 100))}
            onDownloadPdf={handleDownloadPdf}
            defaultPdfFileName={defaultPdfFileName}
            pdfGenerating={pdfGenerating}
            pdfError={pdfError}
            onShowJobDescription={
              !showJobDescription ? () => setShowJobDescription(true) : undefined
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
            maxHeight={showJobDescription ? "75vh" : "85vh"}
          />
        </div>
      </div>
    </section>
  );
}
