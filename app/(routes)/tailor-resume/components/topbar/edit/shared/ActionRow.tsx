"use client";

export function ActionRow({
  isPending,
  onSavePreview,
  onSaveProfile,
  canClearDraft,
  onClearDraft,
}: {
  isPending: boolean;
  onSavePreview: () => void;
  onSaveProfile: () => void;
  canClearDraft: boolean;
  onClearDraft: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="group relative pb-9">
            <button
              type="button"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
              onClick={onSavePreview}
            >
              {isPending ? "Saving..." : "Save to resume"}
            </button>
            <div className="pointer-events-none absolute left-1/2 bottom-1 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 shadow-lg group-hover:block">
              Affects the resume only
            </div>
          </div>

          <div className="group relative pb-9">
            <button
              type="button"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
              onClick={onSaveProfile}
            >
              Save to profile
            </button>
            <div className="pointer-events-none absolute left-1/2 bottom-1 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 shadow-lg group-hover:block">
              Updates your profile
            </div>
          </div>
        </div>
      </div>
      {canClearDraft ? (
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-60 sm:text-sm"
          onClick={onClearDraft}
        >
          Clear resume changes
        </button>
      ) : null}
    </div>
  );
}
