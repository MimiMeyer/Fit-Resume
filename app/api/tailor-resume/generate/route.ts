import { NextResponse } from "next/server";
import { runResumeAgents } from "@/server/resume/resumeAgents";
import type { Profile } from "@/types/profile";
import type { AgentProfileInput } from "@/types/resume-agent";
import { enforceRateLimit, readJsonWithLimit } from "@/app/api/_lib/request-guards";

export const dynamic = "force-dynamic";

function toAgentProfileInput(profile: Profile): AgentProfileInput {
  return {
    fullName: profile.fullName,
    title: profile.title ?? null,
    summary: profile.summary ?? null,
    location: profile.location ?? null,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    githubUrl: profile.githubUrl ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    websiteUrl: profile.websiteUrl ?? null,
    experiences: (profile.experiences ?? []).map((e) => ({
      role: e.role,
      company: e.company,
      location: e.location ?? null,
      period: e.period ?? null,
      impactBullets: e.impactBullets ?? [],
    })),
    projects: (profile.projects ?? []).map((p) => ({
      title: p.title,
      description: p.description ?? null,
      link: p.link ?? null,
      technologies: p.technologies ?? [],
    })),
    skills: (profile.skills ?? []).map((s) => ({
      name: s.name,
      category: { name: s.category?.name ?? "UNCATEGORIZED" },
    })),
  };
}

export async function POST(req: Request) {
  try {
    const rate = enforceRateLimit(req, { keyPrefix: "tailor-resume-generate", limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rate.ok) {
      return NextResponse.json(
        { error: rate.error },
        { status: rate.status, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }

    const apiKey = req.headers.get("x-claude-api-key")?.trim() || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Claude API key is required." }, { status: 400 });
    }

    const parsed = await readJsonWithLimit<{ profile?: Profile; jobDescription?: string }>(req, {
      maxBytes: 250_000,
    });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const body = parsed.value;

    const profile = body?.profile;
    const trimmedJd = (body?.jobDescription || "").trim();

    if (!trimmedJd) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    if (!profile?.fullName?.trim()) {
      return NextResponse.json(
        { error: "Profile is required. Add details in Profile first." },
        { status: 400 },
      );
    }

    const generated = await runResumeAgents(toAgentProfileInput(profile), trimmedJd, apiKey);
    return NextResponse.json(generated, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to generate suggestions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
