"use client";

import { useMemo, useState } from "react";
import type { TailorProjectDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { dirtyInputClass, normalizeKey, normalizeText, takeBestMatch } from "../shared/diffUtils";

function normalizeTechText(value: string) {
  return value
    .split(",")
    .map((t) => normalizeKey(t))
    .filter(Boolean)
    .sort()
    .join(",");
}

export function ProjectsEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorProjectDraft[];
  baseline: TailorProjectDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorProjectDraft[]) => void;
  onSaveProfile: (next: TailorProjectDraft[]) => void;
}) {
  type ProjectForm = Omit<TailorProjectDraft, "technologies"> & { technologiesText: string };
  const [items, setItems] = useState<ProjectForm[]>(
    initial.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link,
      technologiesText: (p.technologies || []).join(", "),
    })),
  );
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  const diffs = useMemo(() => {
    const remaining = [...(baseline || [])];

    const scoreMatch = (current: ProjectForm, candidate: TailorProjectDraft) => {
      let score = 0;
      if (normalizeKey(current.title) && normalizeKey(current.title) === normalizeKey(candidate.title)) score += 5;
      if (normalizeKey(current.link) && normalizeKey(current.link) === normalizeKey(candidate.link || "")) score += 4;
      if (normalizeText(current.description) && normalizeText(current.description) === normalizeText(candidate.description || "")) score += 2;

      const currentTech = new Set(normalizeTechText(current.technologiesText).split(",").filter(Boolean));
      const candidateTech = normalizeTechText((candidate.technologies || []).join(", ")).split(",").filter(Boolean);
      let overlap = 0;
      for (const t of candidateTech) {
        if (currentTech.has(t)) overlap++;
      }
      score += Math.min(3, overlap);
      return score;
    };

    return items.map((proj) => {
      const base = takeBestMatch(remaining, proj, scoreMatch);
      if (!base) {
        return {
          titleDirty: true,
          descriptionDirty: true,
          linkDirty: true,
          technologiesDirty: true,
        };
      }

      const tech = normalizeTechText(proj.technologiesText);
      const baseTech = normalizeTechText((base.technologies || []).join(", "));

      return {
        titleDirty: normalizeText(proj.title) !== normalizeText(base.title),
        descriptionDirty: normalizeText(proj.description) !== normalizeText(base.description || ""),
        linkDirty: normalizeText(proj.link) !== normalizeText(base.link || ""),
        technologiesDirty: tech !== baseTech,
      };
    });
  }, [baseline, items]);

  const toDraft = (): TailorProjectDraft[] =>
    items.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link,
      technologies: p.technologiesText.split(",").map((t) => t.trim()).filter(Boolean),
    }));

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
              { id: undefined, title: "", description: "", link: "", technologiesText: "" },
            ]);
          }}
        >
          + Add project
        </button>
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((proj, idx) => (
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
                  <span className="font-semibold text-zinc-800">Title</span>
                  <input
                  className={dirtyInputClass(!!diffs[idx]?.titleDirty)}
                  value={proj.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, title: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <label className="grid gap-1 text-xs sm:text-sm">
                <span className="font-semibold text-zinc-800">Description</span>
                <textarea
                  rows={3}
                  className={dirtyInputClass(!!diffs[idx]?.descriptionDirty)}
                  value={proj.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, description: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Link</span>
                  <input
                    className={dirtyInputClass(!!diffs[idx]?.linkDirty)}
                    value={proj.link}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, link: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Technologies</span>
                  <input
                    className={dirtyInputClass(!!diffs[idx]?.technologiesDirty)}
                    placeholder="React, Node.js, etc."
                    value={proj.technologiesText}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, technologiesText: e.target.value } : p,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ActionRow
        isPending={isPending}
        onSavePreview={() => onSavePreview(toDraft())}
        onSaveProfile={() => onSaveProfile(toDraft())}
        canClearDraft={canClearDraft}
        onClearDraft={onClearDraft}
      />
    </div>
  );
}
