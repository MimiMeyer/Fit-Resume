import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type {
  AgentExperienceInput,
  AgentProfileInput,
  AgentProjectInput,
  GeneratedExperience,
  GeneratedProject,
  GeneratedResume,
} from "@/types/resume-agent";

type ModelInput = {
  profile: Pick<
    AgentProfileInput,
    "fullName" | "title" | "summary"
  >;
  experiences: Array<{
    role: string;
    company: string;
    period?: string | null;
    location?: string | null;
    impactBullets: string[];
  }>;
  projects: Array<{
    title: string;
    description?: string | null;
    technologies: string[];
    link?: string | null;
  }>;
  skillsByCategory: Record<string, string[]>;
};

const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

function normalizeSkillToken(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenAppearsInText(token: string, text: string) {
  const t = token.trim();
  if (!t) return false;
  const escaped = escapeRegExp(t.toLowerCase());
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return pattern.test(` ${text.toLowerCase()} `);
}

function stripCodeFences(raw: string) {
  return raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

function tryParseJsonObject<T>(raw: string): T | null {
  const trimmed = stripCodeFences(raw);
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function tryParseJsonArray<T>(raw: string): T[] | null {
  const trimmed = stripCodeFences(raw);
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(trimmed.slice(start, end + 1));
        return Array.isArray(parsed) ? (parsed as T[]) : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractNumberTokens(text: string) {
  // Match standalone numeric tokens, not digits embedded in words (e.g. "Auth0").
  const tokens: string[] = [];
  const pattern = /(^|[^A-Za-z])(-?\d+(?:\.\d+)?%?)(?![A-Za-z])/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const token = (match[2] ?? "").trim();
    if (token) tokens.push(token);
  }
  return tokens;
}

function collectKnownTechTokens(input: ModelInput) {
  const known = new Set<string>();
  Object.values(input.skillsByCategory).forEach((skills) => {
    (skills ?? []).forEach((s) => known.add(normalizeSkillToken(s)));
  });
  input.projects.forEach((p) => {
    (p.technologies ?? []).forEach((t) => known.add(normalizeSkillToken(t)));
  });
  return known;
}

function looksLikeTechToken(token: string) {
  const t = token.trim();
  if (!t) return false;
  if (t.length < 2 || t.length > 40) return false;
  if (/[0-9#.+/]/.test(t)) return true;
  if (/\b(?:node\.js|next\.js|\.net)\b/i.test(t)) return true;
  if (/[A-Z].*[A-Z]/.test(t)) return true;
  return false;
}

function extractTechTokens(text: string, knownTech: Set<string>) {
  const tokens = new Set<string>();
  const matches = text.match(/[A-Za-z0-9][A-Za-z0-9.#/+_-]{1,39}/g) ?? [];
  for (const raw of matches) {
    const cleaned = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "").trim();
    if (!cleaned) continue;
    const normalized = normalizeSkillToken(cleaned);
    if (knownTech.has(normalized) || looksLikeTechToken(cleaned)) tokens.add(normalized);
  }
  return tokens;
}

function hasNewQualifier(original: string, rewritten: string) {
  const o = original.toLowerCase();
  const r = rewritten.toLowerCase();
  const qualifiers = ["customer-facing", "consumer-facing", "client-facing", "public-facing", "end-user"];
  return qualifiers.some((q) => r.includes(q) && !o.includes(q));
}

function hasNewBestPracticesClaim(original: string, rewritten: string) {
  const o = original.toLowerCase();
  const r = rewritten.toLowerCase();
  const phrases = ["best practices", "guidelines", "standards"];
  return phrases.some((p) => r.includes(p) && !o.includes(p));
}

function looksDownplayed(original: string, rewritten: string) {
  const o = original.toLowerCase();
  const r = rewritten.toLowerCase();
  const strong = ["led", "owned", "drove", "designed", "built", "implemented", "delivered", "architected", "spearheaded"];
  const weak = ["assisted", "supported", "helped", "contributed", "collaborated"];
  const originalStrong = strong.some((v) => o.includes(v));
  const rewrittenWeak = weak.some((v) => r.includes(v));
  const originalWeak = weak.some((v) => o.includes(v));
  return originalStrong && rewrittenWeak && !originalWeak;
}

function isValidPermutation(order: number[], length: number) {
  if (order.length !== length) return false;
  const seen = new Set<number>();
  for (const value of order) {
    if (!Number.isInteger(value)) return false;
    if (value < 0 || value >= length) return false;
    if (seen.has(value)) return false;
    seen.add(value);
  }
  return true;
}

function getAnthropicModel(apiKey?: string) {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    throw new Error("Claude API key is required.");
  }
  const provider = createAnthropic({ apiKey: trimmed });
  return provider(ANTHROPIC_MODEL);
}

function buildModelInput(profile: AgentProfileInput): ModelInput {
  const groupedSkills: Record<string, string[]> = {};
  for (const skill of profile.skills) {
    const cat = skill.category.name.toUpperCase();
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill.name);
  }

  return {
    profile: {
      fullName: profile.fullName,
      title: profile.title,
      summary: profile.summary,
    },
    experiences: profile.experiences.map((exp: AgentExperienceInput) => ({
      role: exp.role,
      company: exp.company,
      period: exp.period,
      location: exp.location,
      impactBullets: (exp.impactBullets ?? []).map((line) => line.trim()).filter(Boolean),
    })),
    projects: profile.projects.map((proj: AgentProjectInput) => ({
      title: proj.title,
      description: proj.description,
      technologies: proj.technologies || [],
      link: proj.link,
    })),
    skillsByCategory: groupedSkills,
  };
}

async function summaryAgent(input: ModelInput, jd: string, apiKey?: string) {
  const originalSummary = (input.profile.summary || "").trim();

  if (!originalSummary) {
    return "";
  }

  const { text } = await generateText({
    model: getAnthropicModel(apiKey),
    temperature: 0.2,
    maxOutputTokens: 200,
    system: `
You write JOB-SPECIFIC professional summaries for resumes.

Goals:
- Tailor the summary to match the focus and tone of the job description.
- Emphasize relevant experience, strengths, responsibilities, and problem-solving ability.
- Keep the language clear, simple, and friendly for nontechnical recruiters.
- You may mention domain areas ONLY if they appear in the original summary or job description.
- DO NOT add new technical domains, specialized jargon, or deep engineering concepts not present in the original summary.
- DO NOT mention specific technologies, tools, programming languages, frameworks, or platforms.

Hard Rules:
1) Use only factual information found in the original summary or in the provided profile context.
2) You MUST NOT invent new responsibilities, achievements, skills, or experience.
3) The summary must be 2-3 concise, impactful sentences.
4) You may rephrase and reorganize the original summary, but all facts must remain accurate.
5) Focus on general strengths such as collaboration, problem solving, adaptability, reliability, and delivering well-tested work.
6) Output ONLY the final rewritten summary. No headings, no lists, no explanations.
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
          { type: "text", text: `ORIGINAL SUMMARY:\n${originalSummary}` },
          {
            type: "text",
            text: `PROFILE CONTEXT (for factual grounding only):\n${JSON.stringify(
              {
                title: input.profile.title,
                experiences: input.experiences,
                projects: input.projects,
                skillsByCategory: input.skillsByCategory,
              },
              null,
              2,
            )}`,
          },
          { type: "text", text: "Write a 2-3 sentence job-specific summary following all rules." },
        ],
      },
    ],
  });

  return text.trim();
}

async function experienceAgent(
  input: ModelInput,
  jd: string,
  apiKey?: string,
): Promise<GeneratedExperience[]> {
  const experiences = input.experiences;
  if (!experiences.length) return [];

  const model = getAnthropicModel(apiKey);
  const rendered: GeneratedExperience[] = [];

  for (const exp of experiences) {
    const bulletsOriginal = (exp.impactBullets || []).filter(Boolean);
    const headerParts = [exp.role, exp.company].filter(Boolean);
    const metaParts = [exp.period, exp.location].filter(Boolean);
    const header =
      headerParts.join(" @ ") || "Experience";
    const meta = metaParts.length ? ` (${metaParts.join(" | ")})` : "";

    if (!bulletsOriginal.length) {
      rendered.push({
        role: exp.role,
        company: exp.company,
        location: exp.location || "",
        period: exp.period || "",
        bullets: ["(no bullet data)"],
      });
      continue;
    }

    // Reorder bullets by JD relevance, preserving bullet facts (rewrite step still validates per-bullet).
    let bullets = bulletsOriginal;
    if (bulletsOriginal.length > 1) {
      const { text: orderRaw } = await generateText({
        model,
        temperature: 0,
        maxOutputTokens: 80,
        system: `
You rank resume bullets by relevance to a job description.

Return JSON ONLY: an array of 0-based indices representing the bullets in best-to-worst order.

Hard Rules:
1) Return a permutation of all indices 0..N-1 with no omissions/duplicates.
2) Do NOT output any text besides valid JSON.
`.trim(),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
              { type: "text", text: `BULLETS (index: text):\n${bulletsOriginal.map((b, i) => `${i}: ${b}`).join("\n")}` },
              { type: "text", text: "Return the JSON index order now." },
            ],
          },
        ],
      });

      const parsedOrder = tryParseJsonArray<number>(orderRaw);
      if (parsedOrder && isValidPermutation(parsedOrder, bulletsOriginal.length)) {
        bullets = parsedOrder.map((i) => bulletsOriginal[i] as string);
        // order applied
      } else {
        // ignore invalid order
      }
    }

    const { text } = await generateText({
      model,
      temperature: 0.1,
      maxOutputTokens: Math.min(800, 200 + Math.max(0, bullets.length - 2) * 100),
      system: `
You rewrite resume bullets to better match a job description.

Goals:
- Align tone and terminology with the JD while keeping facts intact.
- Highlight relevant impact using recruiter-friendly language.
- Keep bullets concise and easy to scan.

Hard Rules:
1) Use ONLY the provided bullets; do not add new responsibilities, systems, technologies, or metrics.
2) Preserve factual meaning exactly; do not inflate scope, ownership, or seniority.
3) Do NOT upgrade responsibility unless the verb appears in the original bullet.
4) Keywords introduced from the JD must describe the same type of work.
5) You MUST NOT introduce keywords that imply new domains, systems, or ownership.
6) Do NOT add new scope qualifiers (audience/users) unless present in the original bullet.
7) Do NOT remove or generalize named tools/technologies mentioned in the original bullet.
8) Do NOT downplay ownership; preserve leadership verbs when present.
9) Do NOT mix or merge facts across bullets; each rewritten bullet must correspond to the same original bullet.
10) Preserve numbers/percentages exactly; do not remove or change them.
11) If you cannot rewrite a bullet without changing meaning, return the original bullet unchanged.
12) Do not change role/company/period/location; rewrite bullet text only.
13) Output bullets, each prefixed with "- "; no headers or explanations.
14) Keep tone professional and direct; avoid hype and buzzwords.
`.trim(),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
            { type: "text", text: `ROLE: ${header}${meta}` },
            { type: "text", text: `ORIGINAL BULLETS:\n${bullets.map((b: string) => `- ${b}`).join("\n")}` },
            { type: "text", text: "Rewrite the bullets following all rules above. Keep the same number of bullets." },
          ],
        },
      ],
    });

    const cleanedBullets = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-\u2022]\s*/, "").trim());

    const knownTech = collectKnownTechTokens(input);
    const decisions: Array<{ index: number; kept: boolean; reason?: string }> = [];

    const finalBullets =
      cleanedBullets.length === bullets.length
        ? cleanedBullets.map((candidate, index) => {
            const original = bullets[index] ?? "";
            const rewritten = candidate?.trim() || original;
            if (!original) return rewritten;

            if (hasNewQualifier(original, rewritten)) {
              decisions.push({ index, kept: false, reason: "new-qualifier" });
              return original;
            }
            if (hasNewBestPracticesClaim(original, rewritten)) {
              decisions.push({ index, kept: false, reason: "new-best-practices-claim" });
              return original;
            }
            if (looksDownplayed(original, rewritten)) {
              decisions.push({ index, kept: false, reason: "downplayed-ownership" });
              return original;
            }

            const originalNumbers = extractNumberTokens(original);
            if (originalNumbers.length) {
              const rewrittenNumbers = new Set(extractNumberTokens(rewritten));
              if (originalNumbers.some((n) => !rewrittenNumbers.has(n))) {
                decisions.push({ index, kept: false, reason: "dropped-number" });
                return original;
              }
            }

            const allowedTech = extractTechTokens(original, knownTech);
            const rewrittenTech = extractTechTokens(rewritten, knownTech);
            for (const token of rewrittenTech) {
              if (!allowedTech.has(token)) {
                decisions.push({ index, kept: false, reason: "new-tech-token" });
                return original;
              }
            }

            decisions.push({ index, kept: true });
            return rewritten;
          })
        : bullets;

    rendered.push({
      role: exp.role,
      company: exp.company,
      location: exp.location || "",
      period: exp.period || "",
      bullets: finalBullets.length ? finalBullets : ["(no bullet data)"],
    });
  }

  return rendered;
}

async function projectsAgent(input: ModelInput, jd: string, apiKey?: string): Promise<GeneratedProject[]> {
  const projects = input.projects;
  if (!projects.length) return [];

  const model = getAnthropicModel(apiKey);

  const { text } = await generateText({
    model,
    temperature: 0.2,
    maxOutputTokens: Math.min(800, 200 + Math.max(0, projects.length - 2) * 100),
    system: `
You rewrite project descriptions to better match a job description.

Goals:
- Rewrite each description to 1-1.5 concise sentences aligned to the JD.
- Produce a clean, recruiter-friendly output.

Hard Rules:
1) Use ONLY details present in the original project descriptions and technologies; do not invent facts, metrics, or tools.
2) Preserve titles, technologies, and links; rewrite description text only.
3) Output plain text in this format (repeat once per project, in the same order as input):
   <Title> | Tech: <tech list> | Link: <link>
   - <rewritten description>
4) Avoid adding interpretive or evaluative phrases; focus on what was built and what it does.
5) Do not add extra sections or commentary.
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
          {
            type: "text",
            text: `PROJECTS:\n${JSON.stringify(
              projects.map((p) => ({
                title: p.title,
                description: p.description,
                technologies: p.technologies,
                link: p.link,
              })),
              null,
              2,
            )}`,
          },
          { type: "text", text: "Return one formatted entry per project, in order." },
        ],
      },
    ],
  });

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed: GeneratedProject[] = [];
  let current: GeneratedProject | null = null;

  for (const line of lines) {
    if (!line.startsWith("-")) {
      const [titlePart, techPartRaw = "", linkPartRaw = ""] = line.split("|").map((s) => s.trim());
      const techList = techPartRaw.replace(/^Tech:\s*/i, "").split(",").map((t) => t.trim()).filter(Boolean);
      const link = linkPartRaw.replace(/^Link:\s*/i, "").trim() || undefined;
      current = {
        title: titlePart,
        technologies: techList.length ? techList : undefined,
        link: link || undefined,
      };
      parsed.push(current);
    } else if (current) {
      const desc = line.replace(/^[-\u2022]\s*/, "").trim();
      current.description = desc;
    }
  }

  return parsed;
}

async function skillsAgent(
  input: ModelInput,
  jd: string,
  apiKey?: string,
): Promise<Record<string, string[]>> {
  const skillsByCategory = input.skillsByCategory; // required; must always be preserved
  const experiences = input.experiences;
  const projects = input.projects;

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
    (requiredSkillsByCategory[cat] ?? []).forEach((s) => requiredAll.add(normalizeSkillToken(s)));
  }

  const profileEvidenceText = [expText, projectText].filter(Boolean).join("\n\n");
  const profileEvidenceLines = profileEvidenceText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const profileEvidenceLinesWithIndex = profileEvidenceLines.map((text, index) => ({ index, text }));

  type ExtractedExtraSkill = { skill: string; evidenceIndex: number };

  // 1) Extract optional skills that are present in profile evidence but not already in required skills.
  const { text: extractRaw } = await generateText({
    model: getAnthropicModel(apiKey),
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

    const normalized = normalizeSkillToken(skill);
    if (requiredAll.has(normalized)) continue;
    if (extraByNormalized.has(normalized)) continue;

    const cleaned: ExtractedExtraSkill = { skill, evidenceIndex };
    extraSkills.push(cleaned);
    extraByNormalized.set(normalized, cleaned);
  }

  // 2) Main skills agent: reorder required skills + optionally add from extracted extras based on JD.
  type MainSkillsOutput = {
    skillsByCategory: Record<string, string[]>;
    additions?: Array<{ skill: string; category: string }>;
  };

  const { text: mainRaw } = await generateText({
    model: getAnthropicModel(apiKey),
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

  // 3) Deterministic merge + validation:
  // - Preserve all required skills
  // - Only accept additions that are in extraSkills (extractor is the only source of optional skills)
  const finalByCategory: Record<string, string[]> = {};
  for (const cat of categories) {
    const required = requiredSkillsByCategory[cat] ?? [];
    const requiredSet = new Set(required.map(normalizeSkillToken));

    const proposed = (parsed.skillsByCategory[cat] ?? [])
      .map((s) => s.trim())
      .filter(Boolean);

    const orderedRequired: string[] = [];
    const seen = new Set<string>();
    for (const s of proposed) {
      const key = normalizeSkillToken(s);
      if (!requiredSet.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      const canonical = required.find((r) => normalizeSkillToken(r) === key) ?? s;
      orderedRequired.push(canonical);
    }

    const missing = required.filter((r) => !seen.has(normalizeSkillToken(r)));
    finalByCategory[cat] = [...orderedRequired, ...missing];
  }

  const additions = Array.isArray(parsed.additions) ? parsed.additions : [];
  const added: Array<{ skill: string; category: string }> = [];
  const rejected: Record<string, number> = {};
  const reject = (reason: string) => {
    rejected[reason] = (rejected[reason] ?? 0) + 1;
  };

  for (const add of additions) {
    const skill = add?.skill?.trim();
    const category = (add?.category ?? "").trim();
    if (!skill || !category) {
      reject("missing-fields");
      continue;
    }

    const normalized = normalizeSkillToken(skill);
    const candidate = extraByNormalized.get(normalized);
    if (!candidate) {
      reject("not-in-extracted-optional");
      continue;
    }
    if (!tokenAppearsInText(skill, jd)) {
      reject("not-in-jd");
      continue;
    }

    const catKey = category.toUpperCase();
    const current = finalByCategory[catKey] ?? [];
    const already = new Set(current.map(normalizeSkillToken));
    if (already.has(normalized)) {
      reject("already-present");
      continue;
    }

    finalByCategory[catKey] = [...current, candidate.skill];
    added.push({ skill: candidate.skill, category: catKey });
  }

  // Ensure required categories are present even if agent returns only new categories
  categories.forEach((cat) => {
    if (!finalByCategory[cat]) finalByCategory[cat] = requiredSkillsByCategory[cat] ?? [];
  });

  return finalByCategory;
}

export async function runResumeAgents(
  profile: AgentProfileInput,
  jd: string,
  apiKey?: string,
): Promise<GeneratedResume> {
  const input = buildModelInput(profile);

  const [summary, experiences, projects, skillsByCategory] = await Promise.all([
    summaryAgent(input, jd, apiKey),
    experienceAgent(input, jd, apiKey),
    projectsAgent(input, jd, apiKey),
    skillsAgent(input, jd, apiKey),
  ]);

  return {
    summary,
    experiences,
    projects,
    skillsByCategory,
  };
}
