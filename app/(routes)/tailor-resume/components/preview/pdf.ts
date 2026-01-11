"use client";

function buildSafePdfFileBase(fullName?: string | null) {
  const baseName = (fullName || "Resume").trim();
  const safeBaseName = baseName.replace(/[\\/:*?"<>|]+/g, "").trim() || "Resume";
  return safeBaseName.replace(/\s+/g, "_");
}

export function sanitizePdfFileName(fileName: string) {
  const trimmed = fileName.trim();
  if (!trimmed) return null;
  const safe = trimmed.replace(/[\\/:*?"<>|]+/g, "").trim();
  if (!safe) return null;
  const withExt = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
  return withExt;
}

export function buildDefaultResumePdfFileName(fullName?: string | null) {
  return `${buildSafePdfFileBase(fullName)}_Resume.pdf`;
}
