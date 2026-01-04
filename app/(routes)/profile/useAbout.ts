"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type TransitionStartFunction,
} from "react";

import type { Category } from "@/types/category";
import type { Certification } from "@/types/certification";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { Profile } from "@/types/profile";
import type { Project } from "@/types/project";
import type { Skill } from "@/types/skill";
import {
  deleteSkillCategory as deleteSkillCategoryLocal,
  renameSkillCategory as renameSkillCategoryLocal,
  updateSkill as updateSkillLocal,
} from "@/app/local/profile-store";

export type AboutLogic = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
  editOpen: boolean;
  setEditOpen: Dispatch<SetStateAction<boolean>>;
  editingExp: Experience | null;
  setEditingExp: Dispatch<SetStateAction<Experience | null>>;
  editingProject: Project | null;
  setEditingProject: Dispatch<SetStateAction<Project | null>>;
  editingEdu: Education | null;
  setEditingEdu: Dispatch<SetStateAction<Education | null>>;
  editingCert: Certification | null;
  setEditingCert: Dispatch<SetStateAction<Certification | null>>;
  editingSkill: Skill | null;
  setEditingSkill: Dispatch<SetStateAction<Skill | null>>;
  openCategories: Record<string, boolean>;
  setOpenCategories: Dispatch<SetStateAction<Record<string, boolean>>>;
  categories: Category[];
  categoryBusy: boolean;
  editCategoryMode: "existing" | "new";
  setEditCategoryMode: Dispatch<SetStateAction<"existing" | "new">>;
  editCategoryValue: string;
  setEditCategoryValue: Dispatch<SetStateAction<string>>;
  editCategoryOther: string;
  setEditCategoryOther: Dispatch<SetStateAction<string>>;
  editingCategoryId: number | null;
  editingCategoryName: string;
  setEditingCategoryName: Dispatch<SetStateAction<string>>;
  skills: Skill[];
  groupedSkills: Record<string, Skill[]>;
  sortedCategories: string[];
  handleDeleteCategory: (cat: Category) => Promise<void>;
  startEditCategory: (category: Category) => void;
  saveCategoryEdit: () => Promise<void>;
  cancelCategoryEdit: () => void;
  draggingSkill: Skill | null;
  handleSkillDragStart: (skill: Skill) => void;
  handleSkillDragEnd: () => void;
  handleSkillDrop: (targetCategory: string) => void;
};

function categoryIdFromName(name: string): number {
  const value = name.toUpperCase();
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function useAbout(
  profile: Profile,
  controls: { isPending: boolean; startTransition: TransitionStartFunction },
  updateProfile: (updater: (current: Profile) => Profile) => void,
): AboutLogic {
  const { isPending, startTransition } = controls;
  const [editOpen, setEditOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [editCategoryMode, setEditCategoryMode] = useState<"existing" | "new">("existing");
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editCategoryOther, setEditCategoryOther] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [draggingSkill, setDraggingSkill] = useState<Skill | null>(null);

  const skills = [...(profile.skills || [])].sort((a, b) => a.name.localeCompare(b.name));

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category.name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedSkills).sort();

  const categories: Category[] = sortedCategories.map((name) => ({
    id: categoryIdFromName(name),
    name,
    count: groupedSkills[name]?.length ?? 0,
  }));

  useEffect(() => {
    if (editingSkill) {
      const existing = editingSkill.category.name;
      setEditCategoryMode(existing ? "existing" : "new");
      setEditCategoryValue(existing);
      setEditCategoryOther("");
    } else {
      setEditCategoryMode("existing");
      setEditCategoryValue("");
      setEditCategoryOther("");
    }
  }, [editingSkill]);

  const handleDeleteCategory = async (cat: Category) => {
    setCategoryBusy(true);
    try {
      updateProfile((current) => deleteSkillCategoryLocal(current, cat.name));
      setOpenCategories((prev) => {
        const next = { ...prev };
        delete next[cat.name.toUpperCase()];
        return next;
      });
    } catch (err) {
      console.error("Failed to delete category", err);
    } finally {
      setCategoryBusy(false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const saveCategoryEdit = async () => {
    const nextName = editingCategoryName.trim();
    if (!editingCategoryId || !nextName) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
      return;
    }
    setCategoryBusy(true);
    try {
      const currentCategory = categories.find((c) => c.id === editingCategoryId);
      if (currentCategory) {
        updateProfile((current) =>
          renameSkillCategoryLocal(current, currentCategory.name, nextName),
        );
      }
    } catch (err) {
      console.error("Failed to edit category", err);
    } finally {
      setCategoryBusy(false);
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleSkillDragStart = (skill: Skill) => {
    setDraggingSkill(skill);
  };

  const handleSkillDragEnd = () => {
    setDraggingSkill(null);
  };

  const handleSkillDrop = (targetCategory: string) => {
    if (!draggingSkill) return;
    const currentCategory = draggingSkill.category.name;
    if (currentCategory === targetCategory) {
      setDraggingSkill(null);
      return;
    }
    startTransition(async () => {
      updateProfile((current) =>
        updateSkillLocal(current, draggingSkill.id, {
          name: draggingSkill.name,
          categoryName: targetCategory,
        }),
      );
      setDraggingSkill(null);
    });
  };

  return {
    isPending,
    startTransition,
    editOpen,
    setEditOpen,
    editingExp,
    setEditingExp,
    editingProject,
    setEditingProject,
    editingEdu,
    setEditingEdu,
    editingCert,
    setEditingCert,
    editingSkill,
    setEditingSkill,
    openCategories,
    setOpenCategories,
    categories,
    categoryBusy,
    editCategoryMode,
    setEditCategoryMode,
    editCategoryValue,
    setEditCategoryValue,
    editCategoryOther,
    setEditCategoryOther,
    editingCategoryId,
    editingCategoryName,
    setEditingCategoryName,
    skills,
    groupedSkills,
    sortedCategories,
    handleDeleteCategory,
    startEditCategory,
    saveCategoryEdit,
    cancelCategoryEdit,
    draggingSkill,
    handleSkillDragStart,
    handleSkillDragEnd,
    handleSkillDrop,
  };
}
