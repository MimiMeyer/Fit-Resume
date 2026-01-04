"use client";

import { useState } from "react";
import type { TailorExperienceDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { BulletTextarea } from "@/app/components/BulletTextarea";

export function ExperienceEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorExperienceDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorExperienceDraft[]) => void;
  onSaveProfile: (next: TailorExperienceDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorExperienceDraft[]>(initial);
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
              { id: undefined, role: "", company: "", location: "", period: "", impactBullets: [] },
            ]);
          }}
        >
          + Add experience
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((exp, idx) => (
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
                  <span className="font-semibold text-zinc-800">Role</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.role}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, role: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Company</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.company}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, company: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Location</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.location}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, location: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Period</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={exp.period}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, period: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>

              <BulletTextarea
                label="Impact"
                bullets={exp.impactBullets}
                onChange={(nextBullets) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, impactBullets: nextBullets } : p)),
                  )
                }
                rows={5}
                placeholder="• Impact bullet"
              />
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
