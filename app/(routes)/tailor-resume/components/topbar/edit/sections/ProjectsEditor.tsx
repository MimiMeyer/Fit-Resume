"use client";

import { useState } from "react";
import type { TailorProjectDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";

export function ProjectsEditor({
  initial,
  isPending,
  canClearDraft,
  onClearDraft,
  onSavePreview,
  onSaveProfile,
}: {
  initial: TailorProjectDraft[];
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
          className="text-sm font-semibold text-[var(--accent)]"
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
                className="text-sm font-semibold text-red-600"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Title</span>
                <input
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={proj.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, title: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-zinc-800">Description</span>
                <textarea
                  rows={3}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  value={proj.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, description: e.target.value } : p)),
                    )
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Link</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                    value={proj.link}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, link: e.target.value } : p)),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-zinc-800">Technologies</span>
                  <input
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
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
