"use client";

import { useTransition, useState } from "react";
import React from "react";
import { Modal } from "@/components/Modal";
import {
  addCertification,
  addEducation,
  addExperience,
  addProject,
  addSkill,
} from "@/app/actions/profile";

export const primaryButton =
  "rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
export const dangerButton =
  "rounded border border-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

const cancelButtonClass =
  "rounded border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50";

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

  return (
    <Modal
      triggerLabel="Add role"
      title="Add experience"
      description="Share your role, company, and a quick highlight."
    >
      <form
        action={addExperience}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            addExperience(formData);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Role" name="role" placeholder="Software Engineer" required />
        <FormField label="Company" name="company" placeholder="Company name" required />
        <FormField label="Period" name="period" placeholder="2022 – Present" />
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
  );
}

export function AddProjectModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <Modal
      triggerLabel="Add project"
      title="Add project"
      description="List what you built, tech used, and a link."
    >
      <form
        action={addProject}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            addProject(formData);
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
  );
}

export function AddEducationModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <Modal
      triggerLabel="Add education"
      title="Add education"
      description="Include institution, degree, field, and years."
    >
      <form
        action={addEducation}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            addEducation(formData);
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
  );
}

export function AddCertificationModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <Modal
      triggerLabel="Add certification"
      title="Add certification"
      description="Include the issuer, year, and credential URL if you have one."
    >
      <form
        action={addCertification}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            addCertification(formData);
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
  );
}

export function AddSkillModal({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [useExisting, setUseExisting] = useState(true);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Load existing categories on mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/skills/categories");
        if (response.ok) {
          const data = await response.json();
          setExistingCategories(data.categories || []);
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    };
    loadCategories();
  }, []);

  return (
    <Modal
      triggerLabel="Add skill"
      title="Add skill"
      description="Add a skill and assign it to a category."
      onClose={() => setOpen(false)}
    >
      <form
        action={addSkill}
        className="space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await addSkill(formData);
            setOpen(false);
          });
        }}
      >
        <input type="hidden" name="profileId" value={profileId} />
        <FormField label="Skill" name="name" placeholder="TypeScript" required />
        
        <div className="space-y-2">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="categorySource"
                value="existing"
                checked={useExisting}
                onChange={() => setUseExisting(true)}
              />
              <span className="text-xs font-semibold text-zinc-700">Existing category</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="categorySource"
                value="new"
                checked={!useExisting}
                onChange={() => setUseExisting(false)}
              />
              <span className="text-xs font-semibold text-zinc-700">New category</span>
            </label>
          </div>

          {useExisting && existingCategories.length > 0 ? (
            <FormField
              label="Category"
              name="category"
              placeholder="Select a category"
              as="select"
              options={existingCategories.map((cat) => ({ value: cat, label: cat }))}
            />
          ) : (
            <FormField
              label="Category"
              name="category"
              placeholder="e.g., FRONTEND, BACKEND, DEVOPS"
            />
          )}
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
  );
}
