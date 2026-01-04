"use client";

import { useRef, useState, useTransition, type Dispatch, type SetStateAction } from "react";
import { PenIcon } from "@/app/icons/pen";
import { TrashIcon } from "@/app/icons/trash";
import { styles } from "../style-constants";
import type { Category } from "@/types/category";
import type { Skill } from "@/types/skill";
import { Modal } from "../Modal";

function skillChipClass(isDragging: boolean) {
  return isDragging
    ? `${styles.skillChipBase} ${styles.skillChipDragging}`
    : styles.skillChipBase;
}

type Props = {
  profileId: number;
  skills: Skill[];
  categories: Category[];
  groupedSkills: Record<string, Skill[]>;
  sortedCategories: string[];
  openCategories: Record<string, boolean>;
  setOpenCategories: Dispatch<SetStateAction<Record<string, boolean>>>;
  categoryBusy: boolean;
  editingCategoryId: number | null;
  editingCategoryName: string;
  setEditingCategoryName: Dispatch<SetStateAction<string>>;
  startEditCategory: (cat: Category) => void;
  saveCategoryEdit: () => void;
  cancelCategoryEdit: () => void;
  handleDeleteCategory: (cat: Category) => void;
  draggingSkill: Skill | null;
  handleSkillDragStart: (skill: Skill) => void;
  handleSkillDragEnd: () => void;
  handleSkillDrop: (category: string) => void;
  onEditSkill: (skill: Skill) => void;
  onAddSkill: (name: string, categoryName: string) => void;
  onDeleteSkill: (id: number) => void;
  onUpdateSkill: (id: number, name: string, categoryName: string) => void;
};

type AddSkillModalProps = {
  profileId: number;
  categories: Category[];
  presetCategory?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  onAddSkill: Props["onAddSkill"];
};

function AddSkillModal({
  profileId,
  categories,
  presetCategory,
  triggerLabel = "Add Skill",
  triggerClassName,
  onAddSkill,
}: AddSkillModalProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(presetCategory ?? "");
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const categoryInputRef = useRef<HTMLInputElement | null>(null);

  const close = () => {
    setOpen(false);
    setNewCategory("");
    setSelectedCategory(presetCategory ?? "");
    setCategoryPickerOpen(false);
    setCategorySearch("");
  };

  const openPicker = () => {
    setExistingCategories(
      Array.from(new Set(categories.map((c) => c.name).filter(Boolean))).sort(),
    );
    setCategoryPickerOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? styles.primaryButton}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>

      <Modal
        triggerLabel=""
        open={open}
        onClose={close}
        title="Add skill"
        description="Add a skill and assign it to a category."
      >
        <form
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            const categoryName = selectedCategory.trim();
            if (!categoryName) {
              categoryInputRef.current?.setCustomValidity("Please select or add a category.");
              categoryInputRef.current?.reportValidity();
              openPicker();
              return;
            }

            const formData = new FormData(e.currentTarget);
            const name = String(formData.get("name") ?? "").trim();
            if (!name) return;

            categoryInputRef.current?.setCustomValidity("");
            startTransition(() => {
              onAddSkill(name, categoryName);
              close();
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <label className={styles.formField}>
            <span className={styles.labelText}>Skill</span>
            <input name="name" className={styles.input} required />
          </label>

          <div className={styles.formSection}>
            <span className={styles.labelText}>Category</span>

            <input
              ref={categoryInputRef}
              name="category"
              required
              readOnly
              value={selectedCategory}
              placeholder="Choose category"
              onClick={() => openPicker()}
              onChange={() => {
                // no-op: category is selected via picker
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPicker();
                }
              }}
              className={styles.cancelButton}
            />

            {categoryPickerOpen ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4 py-10 backdrop-blur-sm overflow-hidden">
                <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-indigo-100 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-indigo-100 px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-zinc-900">Choose a category</p>
                      <p className="text-xs text-zinc-500">Search categories or add a new one.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      aria-label="Close category picker"
                      onClick={() => {
                        setCategoryPickerOpen(false);
                        setCategorySearch("");
                        setNewCategory("");
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4 p-5">
                    <input
                      autoFocus
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-zinc-900 shadow-inner placeholder:text-indigo-400 focus:border-[var(--accent)] focus:outline-none"
                      placeholder="Search categories"
                    />

                    <div className="max-h-80 overflow-y-auto rounded-xl border border-indigo-100">
                      {existingCategories
                        .filter((cat) =>
                          cat.toLowerCase().includes(categorySearch.toLowerCase()),
                        )
                        .map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-900 transition hover:bg-[var(--accent)]/10"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCategoryPickerOpen(false);
                              setCategorySearch("");
                              setNewCategory("");
                            }}
                          >
                            <span>{cat}</span>
                          </button>
                        ))}

                      {existingCategories.filter((cat) =>
                        cat.toLowerCase().includes(categorySearch.toLowerCase()),
                      ).length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-zinc-500">
                          No categories found. Try creating a new one.
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-900">Add new category</p>
                      <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const name = newCategory.trim().toUpperCase();
                            if (!name) return;
                            setExistingCategories((prev) =>
                              prev.includes(name) ? prev : [...prev, name].sort(),
                            );
                            setSelectedCategory(name);
                            setNewCategory("");
                            setCategorySearch("");
                            setCategoryPickerOpen(false);
                          }
                        }}
                        className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-inner placeholder:text-zinc-400 focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Type a category and press Enter"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.actionsRowPadded}>
            <button type="submit" disabled={isPending} className={styles.primaryButtonAlt}>
              {isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" data-close-modal="true" className={styles.secondaryButtonAlt}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function SkillsSection({
  profileId,
  skills,
  categories,
  groupedSkills,
  sortedCategories,
  openCategories,
  setOpenCategories,
  categoryBusy,
  editingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  startEditCategory,
  saveCategoryEdit,
  cancelCategoryEdit,
  handleDeleteCategory,
  draggingSkill,
  handleSkillDragStart,
  handleSkillDragEnd,
  handleSkillDrop,
  onEditSkill,
  onAddSkill,
  onDeleteSkill,
}: Props) {
  return (
    <section className={styles.sectionCardMd}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <AddSkillModal profileId={profileId} categories={categories} onAddSkill={onAddSkill} />
      </div>

      {skills.length ? (
        <div className={styles.stackMdPadded}>
          {sortedCategories.map((category) => (
            <div
              key={category}
              className={styles.categoryCard}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={() => handleSkillDrop(category)}
            >
              <div className={styles.skillsHeader}>
                <div className={styles.categoryHeaderLeft}>
                  {(() => {
                    const cat = categories.find((c) => c.name === category);
                    const isEditing = cat && editingCategoryId === cat.id;
                    return (
                      <>
                        {isEditing ? (
                          <input
                            className={styles.categoryEditInput}
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            onBlur={saveCategoryEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveCategoryEdit();
                              } else if (e.key === "Escape") {
                                cancelCategoryEdit();
                              }
                            }}
                            autoFocus
                            disabled={categoryBusy}
                          />
                        ) : (
                          <button
                            onClick={() =>
                              setOpenCategories((prev) => ({
                                ...prev,
                                [category]: !(prev[category] ?? true),
                              }))
                            }
                            className={styles.categoryToggle}
                          >
                            <span>{category}</span>
                            <span className={styles.countBadge}>
                              {groupedSkills[category].length}
                            </span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className={styles.skillsHeaderActions}>
                  {(() => {
                    const cat = categories.find((c) => c.name === category);
                    if (!cat) return null;
                    return (
                      <>
                        <AddSkillModal
                          profileId={profileId}
                          categories={categories}
                          presetCategory={category}
                          triggerLabel="+skill"
                          triggerClassName={styles.addButton}
                          onAddSkill={onAddSkill}
                        />
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className={styles.editButton}
                          aria-label={`Edit category ${cat.name}`}
                          disabled={categoryBusy}
                        >
                          <PenIcon className={styles.iconSm} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className={styles.skillRemove}
                          aria-label={`Delete category ${cat.name}`}
                          disabled={categoryBusy}
                        >
                          <TrashIcon className={styles.iconSm} />
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
              {(openCategories[category] ?? true) && (
                <div className={styles.chipWrap}>
                  {groupedSkills[category].map((skill) => (
                    <div
                      key={skill.id}
                      className={skillChipClass(draggingSkill?.id === skill.id)}
                      draggable
                      onDragStart={() => handleSkillDragStart(skill)}
                      onDragEnd={handleSkillDragEnd}
                    >
                      <span className={styles.skillName}>{skill.name}</span>
                      <div className={styles.hoverReveal}>
                        <button
                          onClick={() => onEditSkill(skill)}
                          className={styles.editButton}
                          aria-label="Edit skill"
                        >
                          <PenIcon className={styles.iconSm} />
                        </button>
                        <button
                          type="button"
                          className={styles.skillRemove}
                          aria-label="Remove skill"
                          onClick={() => onDeleteSkill(skill.id)}
                        >
                          <TrashIcon className={styles.iconSm} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.bodyText}>
          No skills yet.
        </p>
      )}
    </section>
  );
}
