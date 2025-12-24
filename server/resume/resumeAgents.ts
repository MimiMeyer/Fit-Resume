import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type {
  AgentExperienceInput,
  AgentProfileInput,
  AgentProjectInput,
  GeneratedExperience,
  GeneratedProject,
  GeneratedResume,
} from "@/types/resume-agent";

function getAnthropicModel() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing in environment");
  }
  const modelName = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
  return anthropic(modelName);
}

function buildModelInput(profile: AgentProfileInput) {
  const groupedSkills: Record<string, string[]> = {};
  for (const skill of profile.skills) {
    const cat = (skill.category?.name || "Uncategorized").toUpperCase();
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill.name);
  }

  return {
    profile: {
      fullName: profile.fullName,
      title: profile.title,
      headline: profile.headline,
      summary: profile.summary,
    },
    experiences: profile.experiences.map((exp: AgentExperienceInput) => ({
      role: exp.role,
      company: exp.company,
      period: exp.period,
      location: exp.location,
      impactBullets: (exp.impact ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
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

async function summaryAgent(input: any, jd: string) {
  const profile = input.profile || {};
  const originalSummary = (profile.summary || "").trim();

  if (!originalSummary) {
    return "";
  }

  const { text } = await generateText({
    model: getAnthropicModel(),
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
                title: profile.title,
                headline: profile.headline,
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

async function experienceAgent(input: any, jd: string): Promise<GeneratedExperience[]> {
  const experiences = input.experiences || [];
  if (!experiences.length) return [];

  const model = getAnthropicModel();
  const rendered: GeneratedExperience[] = [];

  for (const exp of experiences) {
    const bullets = (exp.impactBullets || []).filter(Boolean);
    const headerParts = [exp.role, exp.company].filter(Boolean);
    const metaParts = [exp.period, exp.location].filter(Boolean);
    const header =
      headerParts.join(" @ ") || "Experience";
    const meta = metaParts.length ? ` (${metaParts.join(" | ")})` : "";

    if (!bullets.length) {
      rendered.push({
        role: exp.role,
        company: exp.company,
        location: exp.location || "",
        period: exp.period || "",
        bullets: ["(no bullet data)"],
      });
      continue;
    }

    const { text } = await generateText({
      model,
      temperature: 0.1,
      maxOutputTokens: 200,
      system: `
You rewrite resume bullets to better match a job description.

Goals:
- Align tone and terminology with the JD while keeping facts intact.
- Highlight relevant impact using recruiter-friendly language.
- Keep bullets concise and easy to scan (up to 4 per role).

Hard Rules:
1) Use ONLY the provided bullets; do not add new responsibilities, systems, technologies, or metrics.
2) Preserve factual meaning exactly; do not inflate scope, ownership, or seniority.
3) Do NOT upgrade responsibility unless the verb appears in the original bullet.
4) Keywords introduced from the JD must describe the same type of work.
5) You MUST NOT introduce keywords that imply new domains, systems, or ownership.
6) Do not change role/company/period/location; rewrite bullet text only.
7) Output up to 4 bullets, each prefixed with "- "; no headers or explanations.
8) Keep tone professional and direct; avoid hype and buzzwords.
`.trim(),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
            { type: "text", text: `ROLE: ${header}${meta}` },
            { type: "text", text: `ORIGINAL BULLETS:\n${bullets.map((b: string) => `- ${b}`).join("\n")}` },
            { type: "text", text: "Rewrite the bullets following all rules above. Limit to 4 bullets." },
          ],
        },
      ],
    });

    const cleanedBullets = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((line) => line.replace(/^[-\u2022]\s*/, "").trim());

    rendered.push({
      role: exp.role,
      company: exp.company,
      location: exp.location || "",
      period: exp.period || "",
      bullets: cleanedBullets.length ? cleanedBullets : ["(no bullet data)"],
    });
  }

  return rendered;
}

async function projectsAgent(input: any, jd: string): Promise<GeneratedProject[]> {
  const projects = input.projects || [];
  if (!projects.length) return [];

  const model = getAnthropicModel();

  const { text } = await generateText({
    model,
    temperature: 0.2,
    maxOutputTokens: 200,
    system: `
You select the two best-fitting projects for a job description and rewrite ONLY their descriptions.

Goals:
- Choose the projects that best match the JD (if 2 or fewer projects exist, include all).
- Rewrite each description to 1-1.5 concise sentences aligned to the JD.
- Produce a clean, recruiter-friendly output.

Hard Rules:
1) Use ONLY details present in the original project descriptions and technologies; do not invent facts, metrics, or tools.
2) If there are 2 or fewer projects, include all of them. If more than 2, pick the two that best match the JD.
3) Preserve titles, technologies, and links; rewrite description text only.
4) Output plain text in this format:
   <Title> | Tech: <tech list> | Link: <link>
   - <rewritten description>
5) Avoid adding interpretive or evaluative phrases; focus on what was built and what it does.
6) Do not add extra sections or commentary.
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
          {
            type: "text",
            text: `PROJECTS:\n${JSON.stringify(
              projects.map((p: any) => ({
                title: p.title,
                description: p.description,
                technologies: p.technologies,
                link: p.link,
              })),
              null,
              2,
            )}`,
          },
          { type: "text", text: "Return exactly 2 formatted project entries as instructed." },
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

  return parsed.slice(0, 2);
}

async function skillsAgent(input: any, jd: string): Promise<Record<string, string[]>> {
  const skillsByCategory = input.skillsByCategory || {};
  const experiences = input.experiences || [];
  const projects = input.projects || [];

  const expText = experiences
    .map(
      (exp: any) =>
        `${exp.role || ""} ${exp.company || ""} ${exp.period || ""} ${exp.location || ""}\n${(exp.impactBullets || []).join("\n")}`,
    )
    .join("\n\n")
    .trim();

  const projectText = projects
    .map(
      (p: any) =>
        `${p.title || ""}\n${p.description || ""}\nTech: ${(p.technologies || []).join(", ")}`,
    )
    .join("\n\n")
    .trim();

  const { text } = await generateText({
    model: getAnthropicModel(),
    temperature: 0.1,
    maxOutputTokens: 200,
    system: `
You produce skills grouped by category for a resume.

Goals:
- Keep all provided skills, reordered by relevance to the job description.
- Add only skills that appear in BOTH the job description AND the user's projects/experience text, placing them into existing categories.
- Present concise, readable category groupings for a recruiter audience.

Hard Rules:
1) Do NOT drop any provided skills; you may reorder them based on JD relevance.
2) Do NOT invent new skills, tools, or technologies.
3) Do NOT introduce new categories; use only existing categories from the profile.
4) Only add skills that appear in BOTH the JD AND the user's projects/experience text.
5) Output plain text grouped by category in the format:
   CATEGORY: skill1, skill2, skill3
6) Include all original categories (even if some end up with only original skills).
`.trim(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `JOB DESCRIPTION:\n${jd}` },
          {
            type: "text",
            text: `PROFILE SKILLS BY CATEGORY:\n${JSON.stringify(skillsByCategory, null, 2)}`,
          },
          { type: "text", text: `EXPERIENCES TEXT:\n${expText}` },
          { type: "text", text: `PROJECTS TEXT:\n${projectText}` },
          {
            type: "text",
            text: "Return grouped skills as plain text per the format. Keep all provided skills; you may reorder and add only JD + experience/project overlaps.",
          },
        ],
      },
    ],
  });

  const grouped: Record<string, string[]> = {};
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [cat, skillsRaw] = line.split(":").map((s) => s.trim());
      if (!cat) return;
      const items = (skillsRaw || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      grouped[cat] = items;
    });

  // ensure we keep original categories even if empty
  Object.keys(skillsByCategory).forEach((cat) => {
    if (!grouped[cat]) grouped[cat] = skillsByCategory[cat];
  });

  return grouped;
}

export async function runResumeAgents(profile: AgentProfileInput, jd: string): Promise<GeneratedResume> {
  const input = buildModelInput(profile);

  const [summary, experiences, projects, skillsByCategory] = await Promise.all([
    summaryAgent(input, jd),
    experienceAgent(input, jd),
    projectsAgent(input, jd),
    skillsAgent(input, jd),
  ]);

  return {
    summary,
    experiences,
    projects,
    skillsByCategory,
  };
}
