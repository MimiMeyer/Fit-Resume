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
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-zinc-800">Headline</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            value={state.headline}
            onChange={(e) => setState((s) => ({ ...s, headline: e.target.value }))}
          />
        </label>
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
