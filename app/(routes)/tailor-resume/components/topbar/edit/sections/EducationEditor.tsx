"use client";

import { useMemo, useState } from "react";
import type { TailorEducationDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { dirtyInputClass, normalizeText, takeBestMatch } from "../shared/diffUtils";

function eduKey(edu: TailorEducationDraft) {
  return [
    normalizeText(edu.institution).toLowerCase(),
    normalizeText(edu.degree).toLowerCase(),
    normalizeText(edu.field).toLowerCase(),
    String(edu.startYear ?? ""),
    String(edu.endYear ?? ""),
    normalizeText(edu.details).toLowerCase(),
  ].join("|");
}

export function EducationEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorEducationDraft[];
  baseline: TailorEducationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorEducationDraft[]) => void;
  onSaveProfile: (next: TailorEducationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorEducationDraft[]>(initial);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  const diffs = useMemo(() => {
    const remaining = [...(baseline || [])];

    const scoreMatch = (current: TailorEducationDraft, candidate: TailorEducationDraft) => {
      let score = 0;
      if (
        normalizeText(current.institution).toLowerCase() &&
        normalizeText(current.institution).toLowerCase() === normalizeText(candidate.institution).toLowerCase()
      ) {
        score += 6;
      }
      if (normalizeText(current.degree).toLowerCase() && normalizeText(current.degree).toLowerCase() === normalizeText(candidate.degree).toLowerCase()) score += 2;
      if (normalizeText(current.field).toLowerCase() && normalizeText(current.field).toLowerCase() === normalizeText(candidate.field).toLowerCase()) score += 2;
      if ((current.startYear ?? null) === (candidate.startYear ?? null) && current.startYear != null) score += 1;
      if ((current.endYear ?? null) === (candidate.endYear ?? null) && current.endYear != null) score += 1;
      if (normalizeText(current.details).toLowerCase() && normalizeText(current.details).toLowerCase() === normalizeText(candidate.details).toLowerCase()) score += 1;
      return score;
    };

    const match = (edu: TailorEducationDraft) => {
      const exactKey = eduKey(edu);
      const exactIdx = remaining.findIndex((c) => eduKey(c) === exactKey);
      if (exactIdx !== -1) {
        const [picked] = remaining.splice(exactIdx, 1);
        return picked ?? null;
      }
      return takeBestMatch(remaining, edu, scoreMatch);
    };

    return items.map((edu) => {
      const base = match(edu);
      if (!base) {
        return {
          institutionDirty: true,
          degreeDirty: true,
          fieldDirty: true,
          startYearDirty: true,
          endYearDirty: true,
          detailsDirty: true,
        };
      }

      return {
        institutionDirty: normalizeText(edu.institution) !== normalizeText(base.institution),
        degreeDirty: normalizeText(edu.degree) !== normalizeText(base.degree),
        fieldDirty: normalizeText(edu.field) !== normalizeText(base.field),
        startYearDirty: (edu.startYear ?? null) !== (base.startYear ?? null),
        endYearDirty: (edu.endYear ?? null) !== (base.endYear ?? null),
        detailsDirty: normalizeText(edu.details) !== normalizeText(base.details),
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
                className="text-xs font-semibold text-red-600 sm:text-sm"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-xs sm:text-sm">
                <span className="font-semibold text-zinc-800">Institution</span>
                <input
                  className={dirtyInputClass(!!diffs[idx]?.institutionDirty)}
                  value={edu.institution}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, institution: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Degree</span>
                  <input
                    className={dirtyInputClass(!!diffs[idx]?.degreeDirty)}
                    value={edu.degree}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, degree: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Field</span>
                  <input
                    className={dirtyInputClass(!!diffs[idx]?.fieldDirty)}
                    value={edu.field}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, field: e.target.value } : p)),
                      )
                    }
                  />
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Start year</span>
                  <input
                    type="number"
                    className={dirtyInputClass(!!diffs[idx]?.startYearDirty)}
                    value={edu.startYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, startYear: next } : p)),
                      );
                    }}
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">End year</span>
                  <input
                    type="number"
                    className={dirtyInputClass(!!diffs[idx]?.endYearDirty)}
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
              <label className="grid gap-1 text-xs sm:text-sm">
                <span className="font-semibold text-zinc-800">Details</span>
                <textarea
                  rows={4}
                  className={dirtyInputClass(!!diffs[idx]?.detailsDirty)}
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
