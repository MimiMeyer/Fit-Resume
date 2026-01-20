import { generateText } from "ai";
import type { ModelInput, GetModel } from "./types";

type Model = Parameters<typeof generateText>[0]["model"];

export async function summaryAgent(
  input: ModelInput,
  jd: string,
  apiKey: string | undefined,
  getModel: GetModel,
) {
  const originalSummary = (input.profile.summary || "").trim();

  if (!originalSummary) {
    return "";
  }

  const { text } = await generateText({
    model: getModel(apiKey) as Model,
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
