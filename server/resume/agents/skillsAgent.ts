import { generateText } from "ai";
import { normalizeToken, tokenAppearsInText, tryParseJsonArray, tryParseJsonObject } from "../utils";
import type { ModelInput, GetModel } from "./types";

type Model = Parameters<typeof generateText>[0]["model"];

export async function skillsAgent(
  input: ModelInput,
  jd: string,
  apiKey: string | undefined,
  getModel: GetModel,
): Promise<Record<string, string[]>> {
  const skillsByCategory = input.skillsByCategory; // required; must always be preserved
  const experiences = input.experiences;
  const projects = input.projects;
  const model = getModel(apiKey) as Model;

  const expText = experiences
    .map(
      (exp) =>
        `${exp.role || ""} ${exp.company || ""} ${exp.period || ""} ${exp.location || ""}\n${(exp.impactBullets || []).join("\n")}`,
    )
    .join("\n\n")
    .trim();

  const projectText = projects
    .map(
      (p) =>
        `${p.title || ""}\n${p.description || ""}\nTech: ${(p.technologies || []).join(", ")}`,
    )
    .join("\n\n")
    .trim();

  const categories = Object.keys(skillsByCategory);

  const requiredSkillsByCategory: Record<string, string[]> = {};
  for (const cat of categories) {
    requiredSkillsByCategory[cat] = (skillsByCategory[cat] ?? []).slice();
  }

  const requiredAll = new Set<string>();
  for (const cat of categories) {
    (requiredSkillsByCategory[cat] ?? []).forEach((s) => requiredAll.add(normalizeToken(s)));
  }

  const profileEvidenceText = [expText, projectText].filter(Boolean).join("\n\n");
  const profileEvidenceLines = profileEvidenceText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const profileEvidenceLinesWithIndex = profileEvidenceLines.map((text, index) => ({ index, text }));

  type ExtractedExtraSkill = { skill: string; evidenceIndex: number };

  const { text: extractRaw } = await generateText({
    model,
    temperature: 0,
    maxOutputTokens: 400,
    system: `
You extract optional resume skills from PROFILE_EVIDENCE_LINES.

Output JSON ONLY: an array of objects:
{ "skill": string, "evidenceIndex": number }

Hard Rules:
1) The skill text must appear in the chosen evidence line (by index).
2) Do NOT include any skill already present in REQUIRED_SKILLS (case-insensitive match).
3) Do NOT include generic words like "engineering", "stakeholders", "testing", "workflows", etc.
4) Keep the list short (<= 20).
5) Output compact JSON on a single line. No markdown, no commentary.
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `REQUIRED_SKILLS:\n${JSON.stringify(Array.from(requiredAll))}` },
          { type: "text", text: `PROFILE_EVIDENCE_LINES:\n${JSON.stringify(profileEvidenceLinesWithIndex, null, 2)}` },
          { type: "text", text: "Return JSON array now." },
        ],
      },
    ],
  });

  const extracted = tryParseJsonArray<ExtractedExtraSkill>(extractRaw) ?? [];

  const extraSkills: ExtractedExtraSkill[] = [];
  const extraByNormalized = new Map<string, ExtractedExtraSkill>();
  for (const item of extracted) {
    const skill = item?.skill?.trim();
    const evidenceIndex = item?.evidenceIndex;
    if (!skill || typeof evidenceIndex !== "number") continue;
    const line = profileEvidenceLines[evidenceIndex];
    if (!line) continue;
    if (!line.toLowerCase().includes(skill.toLowerCase())) continue;

    const normalized = normalizeToken(skill);
    if (requiredAll.has(normalized)) continue;
    if (extraByNormalized.has(normalized)) continue;

    const cleaned: ExtractedExtraSkill = { skill, evidenceIndex };
    extraSkills.push(cleaned);
    extraByNormalized.set(normalized, cleaned);
  }

  type MainSkillsOutput = {
    skillsByCategory: Record<string, string[]>;
    additions?: Array<{ skill: string; category: string }>;
  };

  const { text: mainRaw } = await generateText({
    model,
    temperature: 0,
    maxOutputTokens: 500,
    system: `
You produce the final resume SKILLS grouped by category for a specific job.

Inputs:
- REQUIRED_SKILLS_BY_CATEGORY: these MUST all be kept (you may reorder).
- EXTRACTED_OPTIONAL_SKILLS: optional skills found elsewhere in the profile (projects/bullets). You may choose to add some.
- JOB_DESCRIPTION: use this to decide relevance and ordering.

Output JSON ONLY with this shape:
{
  "skillsByCategory": { "CATEGORY": ["..."] },
  "additions": [ { "skill": "X", "category": "CATEGORY" } ]
}

Hard Rules:
1) Include EVERY required skill (no dropping). Reorder allowed.
2) You MAY create new categories if needed (e.g. "APIS", "BACKEND", "OBSERVABILITY") when no existing category fits.
3) Only add skills that appear in EXTRACTED_OPTIONAL_SKILLS (exact skill string).
4) Additions must be justified by the JD (favor JD-mentioned skills; avoid adding unrelated skills).
5) Keep additions minimal: add 0-5 max.
6) Output compact JSON on a single line. No markdown, no commentary.
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `CATEGORIES:\n${JSON.stringify(categories)}` },
          { type: "text", text: `JOB_DESCRIPTION:\n${jd}` },
          { type: "text", text: `REQUIRED_SKILLS_BY_CATEGORY:\n${JSON.stringify(requiredSkillsByCategory, null, 2)}` },
          { type: "text", text: `EXTRACTED_OPTIONAL_SKILLS:\n${JSON.stringify(extraSkills, null, 2)}` },
          { type: "text", text: "Return JSON now." },
        ],
      },
    ],
  });

  const parsed = tryParseJsonObject<MainSkillsOutput>(mainRaw);
  if (!parsed?.skillsByCategory || typeof parsed.skillsByCategory !== "object") {
    return requiredSkillsByCategory;
  }

  const finalByCategory: Record<string, string[]> = {};
  for (const cat of categories) {
    const required = requiredSkillsByCategory[cat] ?? [];
    const requiredSet = new Set(required.map(normalizeToken));

    const proposed = (parsed.skillsByCategory[cat] ?? [])
      .map((s) => s.trim())
      .filter(Boolean);

    const orderedRequired: string[] = [];
    const seen = new Set<string>();
    for (const s of proposed) {
      const key = normalizeToken(s);
      if (!requiredSet.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      const canonical = required.find((r) => normalizeToken(r) === key) ?? s;
      orderedRequired.push(canonical);
    }

    const missing = required.filter((r) => !seen.has(normalizeToken(r)));
    finalByCategory[cat] = [...orderedRequired, ...missing];
  }

  const additions = Array.isArray(parsed.additions) ? parsed.additions : [];
  for (const add of additions) {
    const skill = add?.skill?.trim();
    const category = (add?.category ?? "").trim();
    if (!skill || !category) continue;

    const normalized = normalizeToken(skill);
    const candidate = extraByNormalized.get(normalized);
    if (!candidate) continue;
    if (!tokenAppearsInText(skill, jd)) continue;

    const catKey = category.toUpperCase();
    const current = finalByCategory[catKey] ?? [];
    const already = new Set(current.map(normalizeToken));
    if (already.has(normalized)) continue;

    finalByCategory[catKey] = [...current, candidate.skill];
  }

  categories.forEach((cat) => {
    if (!finalByCategory[cat]) finalByCategory[cat] = requiredSkillsByCategory[cat] ?? [];
  });

  return finalByCategory;
}
