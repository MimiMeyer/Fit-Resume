"use client";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const formattedMessage = message
    .trim()
    .replace(/([.!?])\s+(?=[A-Z"'(\[])/g, "$1\n");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4 py-10 backdrop-blur-sm overflow-hidden">
      <div className="w-fit max-w-[min(92vw,30rem)] rounded-3xl bg-white shadow-xl ring-1 ring-indigo-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-end px-3 py-2 bg-gradient-to-r from-white via-[var(--accent-soft)] to-white border-b border-indigo-100">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-zinc-700 whitespace-pre-line">{formattedMessage}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              onClick={onConfirm}
            >
              {isPending ? "Saving..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

