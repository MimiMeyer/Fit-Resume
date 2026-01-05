"use client";

import { useMemo, useState } from "react";
import type { TailorHeaderDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { dirtyInputClass, normalizeText } from "../shared/diffUtils";

export function SummaryEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorHeaderDraft;
  baseline: TailorHeaderDraft;
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorHeaderDraft) => void;
  onSaveProfile: (next: TailorHeaderDraft) => void;
}) {
  const [state, setState] = useState<TailorHeaderDraft>(initial);

  const changed = useMemo(() => {
    return {
      fullName: normalizeText(state.fullName) !== normalizeText(baseline.fullName),
      title: normalizeText(state.title) !== normalizeText(baseline.title),
      email: normalizeText(state.email) !== normalizeText(baseline.email),
      phone: normalizeText(state.phone) !== normalizeText(baseline.phone),
      location: normalizeText(state.location) !== normalizeText(baseline.location),
      websiteUrl: normalizeText(state.websiteUrl) !== normalizeText(baseline.websiteUrl),
      linkedinUrl: normalizeText(state.linkedinUrl) !== normalizeText(baseline.linkedinUrl),
      githubUrl: normalizeText(state.githubUrl) !== normalizeText(baseline.githubUrl),
      summary: normalizeText(state.summary) !== normalizeText(baseline.summary),
    };
  }, [baseline, state]);

  return (
    <div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-xs sm:text-sm">
          <span className="font-semibold text-zinc-800">Full name</span>
          <input
            className={dirtyInputClass(changed.fullName)}
            value={state.fullName}
            onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-xs sm:text-sm">
          <span className="font-semibold text-zinc-800">Title</span>
          <input
            className={dirtyInputClass(changed.title)}
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder="Job title / position (e.g., Software Engineer)"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">Email</span>
            <input
              className={dirtyInputClass(changed.email)}
              value={state.email}
              onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
              placeholder="name@email.com"
            />
          </label>
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">Phone</span>
            <input
              className={dirtyInputClass(changed.phone)}
              value={state.phone}
              onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="(555) 555-5555"
            />
          </label>
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">Location</span>
            <input
              className={dirtyInputClass(changed.location)}
              value={state.location}
              onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
              placeholder="City, State"
            />
          </label>
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">Website</span>
            <input
              className={dirtyInputClass(changed.websiteUrl)}
              value={state.websiteUrl}
              onChange={(e) => setState((s) => ({ ...s, websiteUrl: e.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">LinkedIn</span>
            <input
              className={dirtyInputClass(changed.linkedinUrl)}
              value={state.linkedinUrl}
              onChange={(e) => setState((s) => ({ ...s, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
          </label>
          <label className="grid gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-800">GitHub</span>
            <input
              className={dirtyInputClass(changed.githubUrl)}
              value={state.githubUrl}
              onChange={(e) => setState((s) => ({ ...s, githubUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </label>
        </div>
        <label className="grid gap-1 text-xs sm:text-sm">
          <span className="font-semibold text-zinc-800">Summary</span>
          <textarea
            rows={6}
            className={dirtyInputClass(changed.summary)}
            value={state.summary}
            onChange={(e) => setState((s) => ({ ...s, summary: e.target.value }))}
          />
        </label>
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(state)}
        onSaveProfile={() => onSaveProfile(state)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}
