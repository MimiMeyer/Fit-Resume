"use client";

import { useEffect, useMemo, useState } from "react";
import type { TailorSkillDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { dirtyInputClass, normalizeKey } from "../shared/diffUtils";

export function SkillsEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorSkillDraft[];
  baseline: TailorSkillDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorSkillDraft[]) => void;
  onSaveProfile: (next: TailorSkillDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorSkillDraft[]>(initial);
  useEffect(() => {
    setItems(initial);
  }, [initial]);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  const diffs = useMemo(() => {
    const baseCounts = new Map<string, number>();
    const baseNameCounts = new Map<string, number>();
    for (const s of baseline || []) {
      const name = normalizeKey(s.name);
      const key = `${normalizeKey(s.category)}|${name}`;
      baseCounts.set(key, (baseCounts.get(key) ?? 0) + 1);
      baseNameCounts.set(name, (baseNameCounts.get(name) ?? 0) + 1);
    }

    return items.map((s) => {
      const name = normalizeKey(s.name);
      const key = `${normalizeKey(s.category)}|${name}`;
      const exactRemaining = baseCounts.get(key) ?? 0;
      if (exactRemaining > 0) {
        baseCounts.set(key, exactRemaining - 1);
        const n = baseNameCounts.get(name) ?? 0;
        if (n > 0) baseNameCounts.set(name, n - 1);
        return { nameDirty: false, categoryDirty: false };
      }

      const nameRemaining = baseNameCounts.get(name) ?? 0;
      if (name && nameRemaining > 0) {
        baseNameCounts.set(name, nameRemaining - 1);
        return { nameDirty: false, categoryDirty: true };
      }

      return { nameDirty: true, categoryDirty: true };
    });
  }, [baseline, items]);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs font-semibold text-[var(--accent)] sm:text-sm"
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
            className="grid items-end gap-2 rounded-xl border border-zinc-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="grid gap-1 text-xs sm:text-sm">
              <span className="font-semibold text-zinc-800">Skill</span>
              <input
                className={dirtyInputClass(!!diffs[idx]?.nameDirty)}
                value={s.name}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)),
                  )
                }
              />
            </label>
            <label className="grid gap-1 text-xs sm:text-sm">
              <span className="font-semibold text-zinc-800">Category</span>
              <input
                className={dirtyInputClass(!!diffs[idx]?.categoryDirty)}
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
              className="text-xs font-semibold text-red-600 sm:mb-1 sm:text-sm"
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
