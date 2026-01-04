const ESCAPE_RE = /[&<>"']/g;

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string | null | undefined): string {
  const text = String(value ?? "");
  return text.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch] ?? ch);
}

export function escapeAttr(value: string | null | undefined): string {
  // Escapes HTML specials and also normalizes newlines which can break attributes.
  return escapeHtml(value).replace(/\r?\n/g, " ");
}

export function sanitizeHref(raw: string | null | undefined): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return null;
  }

  // Allow absolute http(s), mailto, tel. Also allow protocol-relative inputs by normalizing to https.
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return trimmed;
  if (lower.startsWith("//")) return `https:${trimmed}`;

  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
    return null;
  } catch {
    return null;
  }
}

