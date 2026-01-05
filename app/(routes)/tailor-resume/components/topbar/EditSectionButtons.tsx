"use client";

type SectionKey =
  | "header"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications";

type Section = { key: SectionKey; label: string; hasDraft: boolean };

export function EditSectionButtons({
  sections,
  onOpen,
}: {
  sections: Section[];
  onOpen: (key: SectionKey) => void;
}) {
  const resumeSavedIndicator = (
    <span className="ml-1 text-purple-700" aria-hidden="true">
      {"\u2022"}
    </span>
  );

  return (
    <div className="grid w-full flex-1 grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-6">
      {sections.map((s) => (
        <button
          key={s.key}
          type="button"
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-sm"
          onClick={() => onOpen(s.key)}
        >
          {s.label} {s.hasDraft ? resumeSavedIndicator : null}
        </button>
      ))}
    </div>
  );
}
