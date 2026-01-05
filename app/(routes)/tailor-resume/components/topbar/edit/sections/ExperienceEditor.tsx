"use client";

import { useMemo, useState } from "react";
import type { TailorExperienceDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { BulletTextarea } from "@/app/components/BulletTextarea";
import { dirtyInputClass, normalizeKey, normalizeText, takeBestMatch } from "../shared/diffUtils";

function normalizeBullets(items: string[]) {
  return items.map((b) => normalizeText(b)).filter(Boolean);
}

export function ExperienceEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorExperienceDraft[];
  baseline: TailorExperienceDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorExperienceDraft[]) => void;
  onSaveProfile: (next: TailorExperienceDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorExperienceDraft[]>(initial);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  const diffs = useMemo(() => {
    const remaining = [...(baseline || [])];

    const scoreMatch = (current: TailorExperienceDraft, candidate: TailorExperienceDraft) => {
      let score = 0;
      if (normalizeKey(current.company) && normalizeKey(current.company) === normalizeKey(candidate.company)) score += 6;
      if (normalizeKey(current.role) && normalizeKey(current.role) === normalizeKey(candidate.role)) score += 5;
      if (normalizeKey(current.period) && normalizeKey(current.period) === normalizeKey(candidate.period)) score += 2;
      if (normalizeKey(current.location) && normalizeKey(current.location) === normalizeKey(candidate.location)) score += 1;

      const currentBullets = new Set(normalizeBullets(current.impactBullets || []));
      const candidateBullets = normalizeBullets(candidate.impactBullets || []);
      let overlap = 0;
      for (const bullet of candidateBullets) {
        if (currentBullets.has(bullet)) overlap++;
      }
      score += Math.min(2, overlap);
      return score;
    };

    return items.map((exp) => {
      const base = takeBestMatch(remaining, exp, scoreMatch);
      if (!base) {
        return {
          roleDirty: true,
          companyDirty: true,
          locationDirty: true,
          periodDirty: true,
          impactDirty: true,
        };
      }

      const roleDirty = normalizeText(exp.role) !== normalizeText(base.role);
      const companyDirty = normalizeText(exp.company) !== normalizeText(base.company);
      const locationDirty = normalizeText(exp.location) !== normalizeText(base.location);
      const periodDirty = normalizeText(exp.period) !== normalizeText(base.period);
      const impactDirty =
        normalizeBullets(exp.impactBullets).join("\n") !== normalizeBullets(base.impactBullets).join("\n");

      return {
        roleDirty,
        companyDirty,
        locationDirty,
        periodDirty,
        impactDirty,
      };
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
        {items.map((exp, idx) => {
          const rowDiff = diffs[idx];
          const impactDirty = rowDiff?.impactDirty ?? false;

          return (
            <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-xs font-semibold text-red-600 sm:text-sm"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
              </div>

            <div className="mt-3 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Role</span>
                  <input
                    className={dirtyInputClass(!!rowDiff?.roleDirty)}
                    value={exp.role}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, role: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Company</span>
                  <input
                    className={dirtyInputClass(!!rowDiff?.companyDirty)}
                    value={exp.company}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, company: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Location</span>
                  <input
                    className={dirtyInputClass(!!rowDiff?.locationDirty)}
                    value={exp.location}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, location: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Period</span>
                  <input
                    className={dirtyInputClass(!!rowDiff?.periodDirty)}
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
                className={dirtyInputClass(impactDirty)}
                placeholder="• Impact bullet"
              />
            </div>
          </div>
          );
        })}
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
