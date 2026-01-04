"use client";

import { useState } from "react";
import type { TailorHeaderDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";

export function SummaryEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorHeaderDraft;
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorHeaderDraft) => void;
  onSaveProfile: (next: TailorHeaderDraft) => void;
}) {
  const [state, setState] = useState<TailorHeaderDraft>(initial);

  return (
    <div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Full name</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.fullName}
            onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Title</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder="Job title / position (e.g., Software Engineer)"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">Email</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.email}
              onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
              placeholder="name@email.com"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">Phone</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.phone}
              onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="(555) 555-5555"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">Location</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.location}
              onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
              placeholder="City, State"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">Website</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.websiteUrl}
              onChange={(e) => setState((s) => ({ ...s, websiteUrl: e.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">LinkedIn</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.linkedinUrl}
              onChange={(e) => setState((s) => ({ ...s, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-zinc-800">GitHub</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              value={state.githubUrl}
              onChange={(e) => setState((s) => ({ ...s, githubUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Summary</span>
          <textarea
            rows={6}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
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
