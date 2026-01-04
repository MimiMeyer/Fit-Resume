"use client";

import { useState } from "react";
import type { TailorCertificationDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";

export function CertificationsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorCertificationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorCertificationDraft[]) => void;
  onSaveProfile: (next: TailorCertificationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorCertificationDraft[]>(initial);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => {
            markAdded();
            setItems((prev) => [
              ...prev,
              { id: undefined, name: "", issuer: "", issuedYear: null, credentialUrl: "" },
            ]);
          }}
        >
          + Add certification
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((c, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Name</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={c.name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Issuer</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={c.issuer}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, issuer: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Issued year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={c.issuedYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, issuedYear: next } : p)),
                      );
                    }}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Credential URL</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={c.credentialUrl}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, credentialUrl: e.target.value } : p)),
                    )
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(items)}
        onSaveProfile={() => onSaveProfile(items)}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}
