export function normalizeToken(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function tokenAppearsInText(token: string, text: string) {
  const t = token.trim();
  if (!t) return false;
  const escaped = escapeRegExp(t.toLowerCase());
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return pattern.test(` ${text.toLowerCase()} `);
}

export function stripCodeFences(raw: string) {
  return raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

export function tryParseJsonObject<T>(raw: string): T | null {
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

export function tryParseJsonArray<T>(raw: string): T[] | null {
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

