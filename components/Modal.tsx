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

export function Modal({ triggerLabel = "Add", title, description, onClose, children, open: controlledOpen }: ModalProps) {
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
          className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {triggerLabel}
        </button>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur overflow-hidden">
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-zinc-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              if ((e.target as HTMLElement | null)?.dataset.closeModal !== undefined) {
                handleClose();
              }
            }}
          >
            <div className="flex items-start justify-between gap-3 p-6 sticky top-0 bg-white border-b border-zinc-200">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                {description ? (
                  <p className="text-sm text-zinc-600">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleClose()}
                className="rounded px-2 py-1 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
