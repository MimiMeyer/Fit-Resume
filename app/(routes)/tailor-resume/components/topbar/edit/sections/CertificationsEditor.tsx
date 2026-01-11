"use client";

import { useMemo, useState } from "react";
import type { TailorCertificationDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { SectionAdd } from "../shared/SectionAdd";
import { ReorderButtons } from "@/app/components/ReorderButtons";
import { moveArrayItem } from "@/lib/moveArrayItem";
import { dirtyInputClass, normalizeText, takeBestMatch } from "../shared/diffUtils";

export function CertificationsEditor({
  initial,
  baseline,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorCertificationDraft[];
  baseline: TailorCertificationDraft[];
  isPending: boolean;
  canClearDraft: boolean;
  onClearDraft: () => void;
  onSavePreview: (next: TailorCertificationDraft[]) => void;
  onSaveProfile: (next: TailorCertificationDraft[]) => void;
}) {
  const [items, setItems] = useState<TailorCertificationDraft[]>(initial);
  const { listRef, markAdded } = useAutoScrollOnAdd(items.length);

  const moveItem = (fromIndex: number, toIndex: number) =>
    setItems((prev) => moveArrayItem(prev, fromIndex, toIndex));

  const fieldDiffs = useMemo(() => {
    const remaining = [...(baseline || [])];

    const scoreMatch = (current: TailorCertificationDraft, candidate: TailorCertificationDraft) => {
      let score = 0;
      if (
        normalizeText(current.credentialUrl).toLowerCase() &&
        normalizeText(current.credentialUrl).toLowerCase() === normalizeText(candidate.credentialUrl).toLowerCase()
      ) {
        score += 6;
      }
      if (
        normalizeText(current.name).toLowerCase() &&
        normalizeText(current.name).toLowerCase() === normalizeText(candidate.name).toLowerCase()
      ) {
        score += 4;
      }
      if (
        normalizeText(current.issuer).toLowerCase() &&
        normalizeText(current.issuer).toLowerCase() === normalizeText(candidate.issuer).toLowerCase()
      ) {
        score += 2;
      }
      if ((current.issuedYear ?? null) === (candidate.issuedYear ?? null) && current.issuedYear != null) score += 1;
      return score;
    };

    return items.map((c) => {
      const base = takeBestMatch(remaining, c, scoreMatch);
      if (!base) {
        return { nameDirty: true, issuerDirty: true, issuedYearDirty: true, credentialUrlDirty: true };
      }

      return {
        nameDirty: normalizeText(c.name) !== normalizeText(base.name),
        issuerDirty: normalizeText(c.issuer) !== normalizeText(base.issuer),
        issuedYearDirty: (c.issuedYear ?? null) !== (base.issuedYear ?? null),
        credentialUrlDirty: normalizeText(c.credentialUrl) !== normalizeText(base.credentialUrl),
      };
    });
  }, [baseline, items]);

  const addCertification = () => {
    markAdded();
    setItems((prev) => [...prev, { id: undefined, name: "", issuer: "", issuedYear: null, credentialUrl: "" }]);
  };

  return (
    <div>
      <div className="flex justify-end">
        <SectionAdd label="+ Add certification" disabled={isPending} onAdd={addCertification} mode="top" />
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {items.map((c, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-end gap-2">
              <ReorderButtons
                upDisabled={idx === 0}
                downDisabled={idx === items.length - 1}
                onUp={() => moveItem(idx, idx - 1)}
                onDown={() => moveItem(idx, idx + 1)}
                buttonClassName="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 sm:text-sm"
                upAriaLabel="Move certification up"
                downAriaLabel="Move certification down"
              />
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
                  <span className="font-semibold text-zinc-800">Name</span>
                  <input
                    className={dirtyInputClass(!!fieldDiffs[idx]?.nameDirty)}
                    value={c.name}
                    onChange={(e) =>
                      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))
                    }
                  />
                </label>
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Issuer</span>
                  <input
                    className={dirtyInputClass(!!fieldDiffs[idx]?.issuerDirty)}
                    value={c.issuer}
                    onChange={(e) =>
                      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, issuer: e.target.value } : p)))
                    }
                  />
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Issued year</span>
                  <input
                    type="number"
                    className={dirtyInputClass(!!fieldDiffs[idx]?.issuedYearDirty)}
                    value={c.issuedYear ?? ""}
                    onChange={(e) => {
                      const next = e.target.value ? Number(e.target.value) : null;
                      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, issuedYear: next } : p)));
                    }}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-xs sm:text-sm">
                <span className="font-semibold text-zinc-800">Credential URL</span>
                <input
                  className={dirtyInputClass(!!fieldDiffs[idx]?.credentialUrlDirty)}
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

      <SectionAdd
        label="+ Add certification"
        disabled={isPending}
        onAdd={addCertification}
        mode="bottom"
        itemsCount={items.length}
      />

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

