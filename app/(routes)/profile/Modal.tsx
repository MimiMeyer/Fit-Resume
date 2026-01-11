"use client";

import { ReactNode, useState } from "react";

type ModalProps = {
  triggerLabel?: string;
  title: string;
  description?: string;
  children: ReactNode;
  onClose?: () => void;
  open?: boolean;
};

export function Modal({
  triggerLabel = "Add",
  title,
  description,
  onClose,
  children,
  open: controlledOpen,
}: ModalProps) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;

  const handleClose = () => {
    if (controlledOpen === undefined) {
      setOpen(false);
    }
    onClose?.();
  };

  return (
    <>
      {triggerLabel && (
        <button
          type="button"
          onClick={() => {
            if (controlledOpen === undefined) {
              setOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {triggerLabel}
        </button>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/30 px-3 py-8 backdrop-blur-sm sm:px-4 sm:py-10">
          <div
            data-modal-scroll
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-3xl bg-white shadow-xl ring-1 ring-indigo-100"
            onClick={(e) => {
              if ((e.target as HTMLElement | null)?.dataset.closeModal !== undefined) {
                handleClose();
              }
            }}
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-indigo-100 bg-gradient-to-r from-white via-[var(--accent-soft)] to-white p-4 sm:p-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">{title}</h3>
                {description ? (
                  <p className="text-sm text-zinc-600">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleClose()}
                className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:text-sm"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
