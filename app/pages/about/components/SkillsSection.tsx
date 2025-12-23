"use client";

import type { Dispatch, SetStateAction } from "react";
import { PenIcon } from "@/app/icons/pen";
import { TrashIcon } from "@/app/icons/trash";
import { styles } from "../style-constants";
import type { Category, Skill } from "../types";
import { AddSkillModal } from "../modals/AboutAddModals";
import { deleteSkill } from "@/app/actions/profile";

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
};

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
}: Props) {
  return (
    <section className={styles.sectionCardMd}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <AddSkillModal profileId={profileId} />
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
                          presetCategory={category}
                          triggerLabel="+skill"
                          triggerClassName={styles.addButton}
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
                        <form action={deleteSkill}>
                          <input
                            type="hidden"
                            name="skillId"
                            value={skill.id}
                          />
                          <button
                            type="submit"
                            className={styles.skillRemove}
                            aria-label="Remove skill"
                          >
                            <TrashIcon className={styles.iconSm} />
                          </button>
                        </form>
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
          No skills added yet. Use the form above to add one.
        </p>
      )}
    </section>
  );
}
