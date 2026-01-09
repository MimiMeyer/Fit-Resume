"use client";

import { useEffect, useMemo, useState } from "react";
import type { TailorSkillDraft } from "../../../../model/edit-state";
import { ActionRow } from "../shared/ActionRow";
import { useAutoScrollOnAdd } from "../shared/useAutoScrollOnAdd";
import { SectionAdd } from "../shared/SectionAdd";
import { dirtyInputClass, normalizeKey, normalizeText } from "../shared/diffUtils";
import { ReorderButtons } from "@/app/components/ReorderButtons";
import { moveArrayItem } from "@/lib/moveArrayItem";

type SkillGroupForm = {
  id: string;
  category: string;
  skills: TailorSkillDraft[];
  skillsText: string;
};

function newGroupId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function groupSkills(items: TailorSkillDraft[]): SkillGroupForm[] {
  const groups: SkillGroupForm[] = [];
  const index = new Map<string, number>();

  for (const item of items) {
    const key = normalizeKey(item.category);
    const existing = index.get(key);
    if (existing !== undefined) {
      groups[existing]?.skills.push(item);
      continue;
    }
    index.set(key, groups.length);
    groups.push({
      id: newGroupId(),
      category: item.category,
      skills: [item],
      skillsText: "",
    });
  }

  for (const group of groups) {
    group.skillsText = group.skills.map((s) => s.name).filter(Boolean).join(", ");
  }

  return groups;
}

function splitSkillText(value: string) {
  return value
    .split(/[,\n]/g)
    .map((v) => normalizeText(v))
    .filter(Boolean);
}

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
  const [groups, setGroups] = useState<SkillGroupForm[]>(() => groupSkills(initial));
  useEffect(() => {
    setGroups(groupSkills(initial));
  }, [initial]);

  const items = useMemo(
    () =>
      groups.flatMap((g) =>
        g.skills.map((s) => ({
          ...s,
          category: g.category,
        })),
      ),
    [groups],
  );

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

  const addCategory = () => {
    markAdded();
    setGroups((prev) => [
      ...prev,
      {
        id: newGroupId(),
        category: "",
        skills: [],
        skillsText: "",
      },
    ]);
  };

  const moveCategory = (fromIndex: number, toIndex: number) =>
    setGroups((prev) => moveArrayItem(prev, fromIndex, toIndex));

  const updateGroupSkillsText = (groupId: string, nextText: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const names = splitSkillText(nextText);

        const byName = new Map<string, TailorSkillDraft[]>();
        for (const s of g.skills) {
          const key = normalizeKey(s.name);
          if (!byName.has(key)) byName.set(key, []);
          byName.get(key)!.push(s);
        }

        const nextSkills: TailorSkillDraft[] = names.map((name) => {
          const key = normalizeKey(name);
          const list = byName.get(key);
          const reused = list?.shift();
          return {
            id: reused?.id,
            name,
            category: g.category,
          };
        });

        return { ...g, skillsText: nextText, skills: nextSkills };
      }),
    );
  };

  const toDraft = () =>
    groups.flatMap((g) =>
      g.skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: g.category,
      })),
    );

  const groupsWithStarts = useMemo(() => {
    return groups.reduce<{ group: SkillGroupForm; start: number }[]>((acc, group) => {
      const prev = acc[acc.length - 1];
      const start = prev ? prev.start + prev.group.skills.length : 0;
      acc.push({ group, start });
      return acc;
    }, []);
  }, [groups]);

  return (
    <div>
      <div className="flex justify-end">
        <SectionAdd label="+ Add category" disabled={isPending} onAdd={addCategory} mode="top" />
      </div>

      <div ref={listRef} className="mt-3 grid gap-4">
        {groups.length ? null : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Add a category (e.g. Frontend, Backend, Tools) and then add skills inside it.
          </div>
        )}

        {groupsWithStarts.map(({ group, start: groupStart }) => {
          const categoryDirty = group.skills.some((_, idx) => diffs[groupStart + idx]?.categoryDirty);
          const hasAnySkill = splitSkillText(group.skillsText).length > 0;
          const categoryIsMissing = hasAnySkill && !normalizeText(group.category);
          const categoryInputClass = dirtyInputClass(Boolean(categoryDirty || categoryIsMissing));
          const skillsDirty = group.skills.some((_, idx) => diffs[groupStart + idx]?.nameDirty);

          return (
            <div key={group.id} className="rounded-xl border border-zinc-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <label className="grid flex-1 gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Category</span>
                  <input
                    className={categoryInputClass}
                    value={group.category}
                    placeholder="e.g. Frontend"
                    onChange={(e) => {
                      const nextCategory = e.target.value;
                      setGroups((prev) =>
                        prev.map((g) =>
                          g.id === group.id
                            ? {
                                ...g,
                                category: nextCategory,
                                skills: g.skills.map((s) => ({ ...s, category: nextCategory })),
                              }
                            : g,
                        ),
                      );
                    }}
                  />
                </label>

                 <div className="flex items-center gap-2">
                   {(() => {
                     const position = groups.findIndex((g) => g.id === group.id);
                     const upDisabled = position <= 0;
                     const downDisabled = position === -1 || position >= groups.length - 1;

                     return (
                       <ReorderButtons
                         upDisabled={upDisabled}
                         downDisabled={downDisabled}
                         onUp={() => moveCategory(position, position - 1)}
                         onDown={() => moveCategory(position, position + 1)}
                         buttonClassName="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 sm:text-sm"
                         upAriaLabel="Move category up"
                         downAriaLabel="Move category down"
                       />
                     );
                   })()}
                   <button
                     type="button"
                     className="text-xs font-semibold text-red-600 sm:text-sm"
                     onClick={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="grid gap-1 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-800">Skills</span>
                  <textarea
                    rows={3}
                    className={dirtyInputClass(Boolean(skillsDirty))}
                    value={group.skillsText}
                    placeholder="Airflow, AWS, Azure, Docker, GitHub Actions"
                    onChange={(e) => updateGroupSkillsText(group.id, e.target.value)}
                    disabled={isPending}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <SectionAdd label="+ Add category" disabled={isPending} onAdd={addCategory} mode="bottom" itemsCount={groups.length} />

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
