import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runResumeAgents } from "@/lib/resumeAgents";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const jd = (body.jd as string | undefined)?.trim();
    if (!jd) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst({
      include: {
        experiences: true,
        projects: true,
        skills: { include: { category: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "No profile found. Add details in About Me first." }, { status: 400 });
    }

    const generated = await runResumeAgents(profile, jd);

    return NextResponse.json(generated);
  } catch (err) {
    console.error("generate-resume failed", err);
    const message = err instanceof Error ? err.message : "Failed to generate resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
