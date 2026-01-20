import { generateText } from "ai";
import type { GeneratedProject } from "@/types/resume-agent";
import type { ModelInput, GetModel } from "./types";

type Model = Parameters<typeof generateText>[0]["model"];

export async function projectsAgent(
  input: ModelInput,
  jd: string,
  apiKey: string | undefined,
  getModel: GetModel,
): Promise<GeneratedProject[]> {
  const projects = input.projects;
  if (!projects.length) return [];

  const model = getModel(apiKey) as Model;

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
