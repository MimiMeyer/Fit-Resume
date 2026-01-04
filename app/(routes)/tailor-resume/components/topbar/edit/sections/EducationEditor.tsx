"use client";

import { useState } from "react";
import type { TailorEducationDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";

export function EducationEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorEducationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorEducationDraft[]) => void;
  onSaveProfile: (next: TailorEducationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorEducationDraft[]>(initial);
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
              {
                id: undefined,
                institution: "",
                degree: "",
                field: "",
                startYear: null,
                endYear: null,
                details: "",
              },
            ]);
          }}
        >
          + Add education
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((edu, idx) => (
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
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Institution</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={edu.institution}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, institution: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Degree</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.degree}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, degree: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Field</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.field}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, field: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Start year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.startYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, startYear: next } : p)),
                      );
                    }}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">End year</span>
                  <input
                    type="number"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={edu.endYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, endYear: next } : p)),
                      );
                    }}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Details</span>
                <textarea
                  rows={4}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={edu.details}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, details: e.target.value } : p)),
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
