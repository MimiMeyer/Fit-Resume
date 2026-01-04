"use client";

import type { Dispatch, SetStateAction } from "react";

type JobDescriptionPanelProps = {
  show: boolean;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  onGenerate: () => void;
  onToggle: () => void;
  isGenerating?: boolean;
  hasGenerated?: boolean;
  error?: string | null;
};

export function JobDescriptionPanel({
  show,
  jobDescription,
  setJobDescription,
  onGenerate,
  onToggle,
  isGenerating,
  hasGenerated,
  error,
}: JobDescriptionPanelProps) {
  if (!show) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-900" htmlFor="job-description-input">
          Job description
        </label>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-semibold text-[var(--accent)]"
        >
          Hide
        </button>
      </div>
      <textarea
        id="job-description-input"
        className="min-h-[320px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 focus:border-[var(--accent)] focus:outline-none"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
      />
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : hasGenerated ? "Regenerate" : "Generate"}
        </button>
        {hasGenerated && !isGenerating ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 border border-emerald-100">
            Ready
          </span>
        ) : null}
      </div>
      <div className="space-y-2 text-xs text-zinc-600">
        {isGenerating ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-zinc-800">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              <span>Running agents...</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--accent)]" />
            </div>
          </div>
        ) : hasGenerated ? (
          <span className="font-semibold text-emerald-700">Generated. Preview updated.</span>
        ) : null}
        {error ? <span className="font-semibold text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}

