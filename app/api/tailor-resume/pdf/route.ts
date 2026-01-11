import React from "react";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { ResumePdfDocument } from "./ResumePdfDocument";
import type { TailorResumePdfRequest } from "./types";
import { enforceRateLimit, readJsonWithLimit } from "@/app/api/_lib/request-guards";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function safePdfFileName(fileName: string | null | undefined) {
  const base = (fileName || "").trim();
  const clean = base.replace(/[\\/:*?"<>|]+/g, "").trim();
  if (!clean) return "Resume.pdf";
  return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean}.pdf`;
}

export async function POST(req: Request) {
  const rate = enforceRateLimit(req, { keyPrefix: "tailor-resume-pdf", limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return Response.json(
      { error: rate.error },
      { status: rate.status, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const parsed = await readJsonWithLimit<TailorResumePdfRequest>(req, { maxBytes: 500_000 });
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);
  const payload = parsed.value;

  if (!payload.layoutMode) return jsonError("Missing layoutMode.");
  if (!payload.palette) return jsonError("Missing palette.");
  if (typeof payload.accentOpacity !== "number") return jsonError("Missing accentOpacity.");

  const fileName = safePdfFileName(payload.fileName ?? null);
  const normalizedPayload: TailorResumePdfRequest = {
    ...payload,
    header: {
      fullName: payload.header?.fullName ?? "",
      title: payload.header?.title ?? "",
      summary: payload.header?.summary ?? "",
      email: payload.header?.email ?? "",
      phone: payload.header?.phone ?? "",
      location: payload.header?.location ?? "",
      linkedinUrl: payload.header?.linkedinUrl ?? "",
      githubUrl: payload.header?.githubUrl ?? "",
      websiteUrl: payload.header?.websiteUrl ?? "",
    },
    experiences: payload.experiences ?? [],
    education: payload.education ?? [],
    skillGroups: payload.skillGroups ?? [],
    projects: payload.projects ?? [],
    certifications: payload.certifications ?? [],
    paginatedSections: payload.paginatedSections ?? [],
  };

  try {
    const documentElement = React.createElement(
      Document,
      null,
      React.createElement(ResumePdfDocument, normalizedPayload),
    );
    const buffer = await renderToBuffer(documentElement);
    const pdfBytes = new Uint8Array(buffer);
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to generate PDF.";
    return jsonError(message, 500);
  }
}
