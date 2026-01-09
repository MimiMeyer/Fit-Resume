"use client";

import { JobDescriptionPanel } from "./components/job-description/JobDescriptionPanel";
import { Toolbar } from "./components/topbar/Toolbar";
import { EditSections } from "./components/topbar/edit/EditSections";
import type { Profile } from "@/types/profile";
import { styles } from "./style-constants";
import { useCreateResume } from "./useCreateResume";

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
    pdfLiveUrl,
    pdfLiveGenerating,
    pdfLiveError,
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
          profileHeader={{
            fullName: profile.fullName,
            title: profile.title ?? "",
            summary: profile.summary ?? "",
            email: profile.email ?? "",
            phone: profile.phone ?? "",
            location: profile.location ?? "",
            linkedinUrl: profile.linkedinUrl ?? "",
            githubUrl: profile.githubUrl ?? "",
            websiteUrl: profile.websiteUrl ?? "",
          }}
          profileExperiences={(profile.experiences || []).map((e) => ({
            id: e.id,
            role: e.role,
            company: e.company,
            location: e.location ?? "",
            period: e.period ?? "",
            impactBullets: e.impactBullets ?? [],
          }))}
          projects={projectsForEdit}
          profileProjects={(profile.projects || []).map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? "",
            link: p.link ?? "",
            technologies: p.technologies ?? [],
          }))}
          skills={skillsForEdit}
          profileSkills={(profile.skills || []).map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category.name,
          }))}
          educations={educationsForEdit}
          profileEducations={(profile.educations || []).map((e) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ?? "",
            field: e.field ?? "",
            startYear: e.startYear ?? null,
            endYear: e.endYear ?? null,
            details: e.details ?? "",
          }))}
          certifications={certificationsForEdit}
          profileCertifications={(profile.certs || []).map((c) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuer ?? "",
            issuedYear: c.issuedYear ?? null,
            credentialUrl: c.credentialUrl ?? "",
          }))}
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
            onDownloadPdf={handleDownloadPdf}
            defaultPdfFileName={defaultPdfFileName}
            pdfGenerating={pdfGenerating}
            pdfError={pdfError}
            onShowJobDescription={
              !showJobDescription ? () => setShowJobDescription(true) : undefined
            }
          />

          <div
            className="relative overflow-hidden rounded-lg bg-zinc-100 p-4 min-w-0 w-full"
            style={{ maxHeight: showJobDescription ? "75vh" : "85vh" }}
          >
            <div className="flex w-full justify-center">
              <div className="relative z-10 flex w-full max-w-full flex-col items-center">
                {pdfLiveUrl ? (
                  <iframe
                    title="Resume PDF preview"
                    src={pdfLiveUrl}
                    className="h-[72vh] w-full max-w-[860px] rounded-md bg-white shadow-sm"
                    style={{ border: "none" }}
                  />
                ) : (
                  <div className="flex h-[72vh] w-full max-w-[860px] items-center justify-center rounded-md bg-white text-sm text-zinc-600 shadow-sm">
                    Generating PDF preview...
                  </div>
                )}

                {pdfLiveGenerating ? (
                  <div className="mt-2 text-[11px] font-medium text-zinc-500">Updating preview...</div>
                ) : null}
                {pdfLiveError ? (
                  <div className="mt-2 text-[11px] font-medium text-rose-700">{pdfLiveError}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
