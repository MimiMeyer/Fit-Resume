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
    <div className="grid w-full flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {sections.map((s) => (
        <button
          key={s.key}
          type="button"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          onClick={() => onOpen(s.key)}
        >
          {s.label} {s.hasDraft ? resumeSavedIndicator : null}
        </button>
      ))}
    </div>
  );
}
