"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";

type JobDescriptionPanelProps = {
  show: boolean;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  claudeApiKey: string;
  setClaudeApiKey: Dispatch<SetStateAction<string>>;
  promptForApiKey?: boolean;
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
  claudeApiKey,
  setClaudeApiKey,
  promptForApiKey,
  onGenerate,
  onToggle,
  isGenerating,
  hasGenerated,
  error,
}: JobDescriptionPanelProps) {
  const apiKeyInputRef = useRef<HTMLInputElement | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!promptForApiKey) return;
    if (claudeApiKey.trim()) return;
    apiKeyInputRef.current?.focus();
  }, [claudeApiKey, promptForApiKey]);

  if (!show) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-semibold text-zinc-900 sm:text-sm"
          htmlFor="job-description-input"
        >
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
        className="min-h-[320px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-[var(--accent)] focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
      />

      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <label
            className="text-xs font-semibold text-zinc-900 sm:text-sm"
            htmlFor="claude-api-key-input"
          >
            Claude API key
          </label>
          <div className="flex items-center gap-3">
            {claudeApiKey.trim() ? (
              <button
                type="button"
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-900"
                onClick={() => setClaudeApiKey("")}
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              className="text-xs font-semibold text-[var(--accent)]"
              onClick={() => setShowApiKey((v) => !v)}
            >
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <input
          ref={apiKeyInputRef}
          id="claude-api-key-input"
          type={showApiKey ? "text" : "password"}
          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-[var(--accent)] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
          value={claudeApiKey}
          onChange={(e) => setClaudeApiKey(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
          inputMode="text"
        />
        <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600">
          <li>We do not store your key.</li>
          <li>This key stays in this tab and is cleared when you refresh.</li>
        </ul>
        <p className="text-xs text-zinc-600">
          Use at your own discretion — API usage and billing are your responsibility.
        </p>
        <p className="text-xs text-zinc-600">
          Create a key at{" "}
          <a
            href="https://platform.claude.com/settings/keys"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-[var(--accent)] underline underline-offset-2"
          >
            platform.claude.com/settings/keys
          </a>
          .
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
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

