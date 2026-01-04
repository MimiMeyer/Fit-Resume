"use client";

import { useState } from "react";
import type { TailorSkillDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";

export function SkillsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorSkillDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorSkillDraft[]) => void;
  onSaveProfile: (next: TailorSkillDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorSkillDraft[]>(initial);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-[var(--accent)]"
          onClick={() => {
            markAdded();
            setItems((prev) => [...prev, { id: undefined, name: "", category: "" }]);
          }}
        >
          + Add skill
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-3">
        {items.map((s, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-xl border border-zinc-200 bg-white p-3"
          >
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-zinc-800">Skill</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                value={s.name}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)),
                  )
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-zinc-800">Category</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                value={s.category}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, category: e.target.value } : p)),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="mb-1 text-sm font-semibold text-red-600"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
            >
              Delete
            </button>
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
