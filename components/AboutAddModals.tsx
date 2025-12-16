"use client";

import { useTransition, useState } from "react";
import React from "react";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import {
  addCertification,
  addEducation,
  addExperience,
  addProject,
  addSkill,
} from "@/app/actions/profile";

export const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60";
export const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

const cancelButtonClass =
  "inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

type Props = {
  profileId: number;
};

type FormFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  rows?: number;
  options?: Array<{ value: string; label: string }>;
};

function FormField({
  label,
  name,
  placeholder,
  required = false,
  as = "input",
  rows = 2,
  options = [],
}: FormFieldProps) {
  const inputClass =
    "w-full rounded border border-zinc-200 px-3 py-2";
  const labelClass =
    "block space-y-1";
  const spanClass =
    "text-xs font-semibold text-zinc-700";

  return (
    <label className={labelClass}>
      <span className={spanClass}>{label}</span>
      {as === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={inputClass}
          required={required}
        />
      ) : as === "select" ? (
        <select
          name={name}
          className={inputClass}
          required={required}
        >
          <option value="">{placeholder || "Select..."}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
      )}
    </label>
  );
}

export function AddExperienceModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={primaryButton}
        onClick={() => setOpen(true)}
      >
        Add Role
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add experience"
        description="Share your role, company, and a quick highlight."
      >
      <form
        action={addExperience}
        className="space-y-4 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await addExperience(formData);
              setOpen(false);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Role" name="role" placeholder="Software Engineer" required />
        <FormField label="Company" name="company" placeholder="Company name" required />
        <FormField label="Location" name="location" placeholder="City, State" />
        <FormField label="Period" name="period" placeholder="2022 — Present" />
        <FormField label="Impact" name="impact" placeholder="Shipped features, improved reliability…" as="textarea" />
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isPending} className={primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={cancelButtonClass}>
            Cancel
          </button>
        </div>
      </form>
      </Modal>
    </>
  );
}

export function AddProjectModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={primaryButton}
        onClick={() => setOpen(true)}
      >
        Add Project
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add project"
        description="List what you built, tech used, and a link."
      >
      <form
        action={addProject}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await addProject(formData);
              setOpen(false);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Title" name="title" placeholder="Project name" required />
        <FormField label="Description" name="description" placeholder="What it does and why it matters" as="textarea" />
        <FormField label="Link" name="link" placeholder="https://" />
        <FormField label="Technologies" name="technologies" placeholder="React, Next.js, Tailwind" />
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isPending} className={primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={cancelButtonClass}>
            Cancel
          </button>
        </div>
      </form>
      </Modal>
    </>
  );
}

export function AddEducationModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={primaryButton}
        onClick={() => setOpen(true)}
      >
        Add Education
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add education"
        description="Include institution, degree, field, and years."
      >
      <form
        action={addEducation}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await addEducation(formData);
              setOpen(false);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Institution" name="institution" placeholder="School or program" required />
        <FormField label="Degree" name="degree" placeholder="B.Sc. Computer Science" />
        <FormField label="Field" name="field" placeholder="Computer Science" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start year" name="startYear" placeholder="2018" />
          <FormField label="End year" name="endYear" placeholder="2022" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isPending} className={primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={cancelButtonClass}>
            Cancel
          </button>
        </div>
      </form>
      </Modal>
    </>
  );
}

export function AddCertificationModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={primaryButton}
        onClick={() => setOpen(true)}
      >
        Add Certification
      </button>
      <Modal
        triggerLabel=""
        open={open}
        onClose={() => setOpen(false)}
        title="Add certification"
        description="Include the issuer, year, and credential URL if you have one."
      >
      <form
        action={addCertification}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await addCertification(formData);
              setOpen(false);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Name" name="name" placeholder="Certification name" required />
        <FormField label="Issuer" name="issuer" placeholder="Organization" />
        <FormField label="Issued year" name="issuedYear" placeholder="2023" />
        <FormField label="Credential URL" name="credentialUrl" placeholder="https://" />
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={isPending} className={primaryButton}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" data-close-modal="true" className={cancelButtonClass}>
            Cancel
          </button>
        </div>
      </form>
      </Modal>
    </>
  );
}

type AddSkillProps = Props & {
  triggerLabel?: string;
  presetCategory?: string;
  triggerClassName?: string;
  onOpen?: () => void;
};

export function AddSkillModal({
  profileId,
  triggerLabel = "Add Skill",
  presetCategory,
  triggerClassName,
  onOpen,
}: AddSkillProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">("existing");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Load existing categories on mount
  const loadCategories = React.useCallback(async () => {
    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const names = (data.categories || []).map((c: any) => c.name);
        const merged = presetCategory && !names.includes(presetCategory) ? [...names, presetCategory] : names;
        setExistingCategories(merged);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  }, [presetCategory]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    if (open) loadCategories();
  }, [open, loadCategories]);

  React.useEffect(() => {
    const handler = () => loadCategories();
    window.addEventListener("categories-refresh", handler);
    return () => window.removeEventListener("categories-refresh", handler);
  }, [loadCategories]);

  React.useEffect(() => {
    if (presetCategory) {
      setCategoryMode("existing");
      setSelectedCategory(presetCategory);
      setNewCategory("");
      setCategorySearch("");
    }
  }, [presetCategory]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? primaryButton}
          onClick={() => {
            onOpen?.();
            setOpen(true);
            if (presetCategory) {
              setCategoryMode("existing");
              setSelectedCategory(presetCategory);
              setNewCategory("");
            }
            setCategoryPickerOpen(false);
            setCategorySearch("");
          }}
        >
          {triggerLabel}
        </button>
      <Modal
        triggerLabel=""
        open={open}
        title="Add skill"
        description="Add a skill and assign it to a category."
        onClose={() => {
          setOpen(false);
          setCategoryMode("existing");
          setSelectedCategory(presetCategory ?? "");
          setNewCategory("");
          setCategoryPickerOpen(false);
          setCategorySearch("");
          }}
        >
        <form
          action={addSkill}
          className="space-y-5 text-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const categoryValue = (
              categoryMode === "new" ? newCategory : selectedCategory
            ).trim().toUpperCase();
            if (!categoryValue) {
              alert("Please select or add a category");
              return;
            }
            formData.set("category", categoryValue);
            startTransition(async () => {
              await addSkill(formData);
              router.refresh();
              window.dispatchEvent(new Event("profile-refresh"));
              window.dispatchEvent(new Event("categories-refresh"));
              setOpen(false);
              setCategoryMode("existing");
              setSelectedCategory(presetCategory ?? "");
              setNewCategory("");
              setCategoryPickerOpen(false);
              setCategorySearch("");
            });
          }}
        >
          <input type="hidden" name="profileId" value={profileId} />
          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-4 space-y-2 shadow-sm">
            <FormField label="Skill" name="name" placeholder="" required />
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="block text-[13px] font-semibold text-zinc-800 tracking-tight">Category</span>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded border border-zinc-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={() => {
                  setCategoryPickerOpen(true);
                  setCategorySearch("");
                }}
              >
                <span className="flex-1 text-left">
                  {categoryMode === "new"
                    ? newCategory || ""
                    : selectedCategory || ""}
                </span>
                <span className="text-xs text-zinc-500">Browse</span>
              </button>
              <p className="text-xs text-zinc-500">Choose an existing category or start a new one below.</p>
            </div>
            {categoryMode === "new" && (
              <input
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-zinc-900 shadow-inner placeholder:text-indigo-400"
                placeholder="Name your new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            )}
          </div>

          {categoryPickerOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4 py-10 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-indigo-100">
                <div className="flex items-center justify-between border-b border-indigo-100 px-5 py-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-zinc-900">Choose a category</p>
                    <p className="text-xs text-zinc-500">Search categories or add a new one.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full px-2 py-1 text-sm font-semibold text-zinc-600 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    aria-label="Close category picker"
                    onClick={() => {
                      setCategoryPickerOpen(false);
                      setCategorySearch("");
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
                      .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-900 transition hover:bg-[var(--accent)]/10"
                          onClick={() => {
                            setCategoryMode("existing");
                            setSelectedCategory(cat);
                            setNewCategory("");
                            setCategoryPickerOpen(false);
                            setCategorySearch("");
                          }}
                        >
                          <span>{cat}</span>
                        </button>
                      ))}
                    {existingCategories.filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-zinc-500">
                        No categories found. Try creating a new one.
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-900">Add new category</p>
                    <input
                      autoFocus
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const name = newCategory.trim().toUpperCase();
                          if (!name) return;
                          setExistingCategories((prev) =>
                            prev.includes(name) ? prev : [...prev, name]
                          );
                          setCategoryMode("existing");
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
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" data-close-modal="true" className={cancelButtonClass}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
