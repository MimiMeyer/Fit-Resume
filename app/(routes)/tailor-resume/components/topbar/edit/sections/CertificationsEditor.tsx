"use client";

import { useMemo, useState } from "react";
import type { TailorCertificationDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
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

  const fieldDiffs = useMemo(() => {
    const remaining = [...(baseline || [])];

    const scoreMatch = (current: TailorCertificationDraft, candidate: TailorCertificationDraft) => {
      let score = 0;
      if (
        normalizeText(current.credentialUrl).toLowerCase() &&
        normalizeText(current.credentialUrl).toLowerCase() ===
          normalizeText(candidate.credentialUrl).toLowerCase()
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
                    className={dirtyInputClass(!!fieldDiffs[idx]?.nameDirty)}
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
                    className={dirtyInputClass(!!fieldDiffs[idx]?.issuerDirty)}
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
                    className={dirtyInputClass(!!fieldDiffs[idx]?.issuedYearDirty)}
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
