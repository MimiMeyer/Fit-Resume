"use client";

import {
  useEffect,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
  type TransitionStartFunction,
} from "react";
import { useRouter } from "next/navigation";
import { updateSkill } from "@/app/actions/profile";
import { deleteCategory, getCategories, updateCategoryName } from "@/app/actions/categories";

import type {
  Category,
  Certification,
  Education,
  Experience,
  Profile,
  Project,
  Skill,
} from "./types";

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
  loadCategories: () => Promise<void>;
  handleDeleteCategory: (cat: Category) => Promise<void>;
  startEditCategory: (category: Category) => void;
  saveCategoryEdit: () => Promise<void>;
  cancelCategoryEdit: () => void;
  draggingSkill: Skill | null;
  handleSkillDragStart: (skill: Skill) => void;
  handleSkillDragEnd: () => void;
  handleSkillDrop: (targetCategory: string) => void;
};

export function useAbout(profile: Profile): AboutLogic {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [editCategoryMode, setEditCategoryMode] = useState<"existing" | "new">("existing");
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editCategoryOther, setEditCategoryOther] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [draggingSkill, setDraggingSkill] = useState<Skill | null>(null);

  const [skills, setSkills] = useState<Skill[]>(
    [...(profile.skills || [])].sort((a, b) => a.name.localeCompare(b.name)),
  );

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category?.name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedSkills).sort();

  const loadCategories = async () => {
    try {
      const next = await getCategories();
      setCategories(next);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleProfileRefresh = () => {
      loadCategories();
      router.refresh();
    };
    window.addEventListener("profile-refresh", handleProfileRefresh);
    return () => window.removeEventListener("profile-refresh", handleProfileRefresh);
  }, [router]);

  useEffect(() => {
    if (editingSkill) {
      const existing = editingSkill.category?.name ?? "";
      setEditCategoryMode(existing ? "existing" : "new");
      setEditCategoryValue(existing);
      setEditCategoryOther("");
    } else {
      setEditCategoryMode("existing");
      setEditCategoryValue("");
      setEditCategoryOther("");
    }
  }, [editingSkill]);

  useEffect(() => {
    setSkills([...(profile.skills || [])].sort((a, b) => a.name.localeCompare(b.name)));
  }, [profile.skills]);

  const handleDeleteCategory = async (cat: Category) => {
    setCategoryBusy(true);
    try {
      const toRemove = cat.name.toUpperCase();
      await deleteCategory(cat.id);

      if (toRemove) {
        setSkills((prev) =>
          prev.filter(
            (skill) =>
              (skill.category?.name ?? "Uncategorized").toUpperCase() !== toRemove,
          ),
        );
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setOpenCategories((prev) => {
        const next = { ...prev };
        delete next[toRemove];
        return next;
      });
      await loadCategories();
      router.refresh();
      window.dispatchEvent(new Event("categories-refresh"));
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
      await updateCategoryName(editingCategoryId, nextName);
      await loadCategories();
      router.refresh();
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
    const currentCategory = draggingSkill.category?.name || "Uncategorized";
    if (currentCategory === targetCategory) {
      setDraggingSkill(null);
      return;
    }
    const fd = new FormData();
    fd.set("skillId", String(draggingSkill.id));
    fd.set("name", draggingSkill.name);
    fd.set("category", targetCategory);
    startTransition(async () => {
      await updateSkill(fd);
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
    loadCategories,
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
