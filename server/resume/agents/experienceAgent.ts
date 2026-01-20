import { generateText } from "ai";
import type { GeneratedExperience } from "@/types/resume-agent";
import { normalizeForComparison, parseJsonArrayFromModelOutput } from "../utils";
import type { ModelInput, GetModel } from "./types";

type Model = Parameters<typeof generateText>[0]["model"];

function extractNumberTokens(text: string) {
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
    (skills ?? []).forEach((s) => known.add(normalizeForComparison(s)));
  });
  input.projects.forEach((p) => {
    (p.technologies ?? []).forEach((t) => known.add(normalizeForComparison(t)));
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
    const normalized = normalizeForComparison(cleaned);
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

export async function experienceAgent(
  input: ModelInput,
  jd: string,
  apiKey: string | undefined,
  getModel: GetModel,
): Promise<GeneratedExperience[]> {
  const experiences = input.experiences;
  if (!experiences.length) return [];

  const model = getModel(apiKey) as Model;
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

      const parsedOrder = parseJsonArrayFromModelOutput<number>(orderRaw);
      if (parsedOrder && isValidPermutation(parsedOrder, bulletsOriginal.length)) {
        bullets = parsedOrder.map((i) => bulletsOriginal[i] as string);
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
    const finalBullets =
      cleanedBullets.length === bullets.length
        ? cleanedBullets.map((candidate, index) => {
            const original = bullets[index] ?? "";
            const rewritten = candidate?.trim() || original;
            if (!original) return rewritten;

            if (hasNewQualifier(original, rewritten)) return original;
            if (hasNewBestPracticesClaim(original, rewritten)) return original;
            if (looksDownplayed(original, rewritten)) return original;

            const originalNumbers = new Set(extractNumberTokens(original));
            const rewrittenNumbers = new Set(extractNumberTokens(rewritten));
            // Preserve numbers exactly: no dropping originals and no introducing new ones.
            for (const n of originalNumbers) {
              if (!rewrittenNumbers.has(n)) return original;
            }
            for (const n of rewrittenNumbers) {
              if (!originalNumbers.has(n)) return original;
            }

            const allowedTech = extractTechTokens(original, knownTech);
            const rewrittenTech = extractTechTokens(rewritten, knownTech);
            for (const token of allowedTech) {
              if (!rewrittenTech.has(token)) return original;
            }
            for (const token of rewrittenTech) {
              if (!allowedTech.has(token)) return original;
            }

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
