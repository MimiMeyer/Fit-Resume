export function normalizeForComparison(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function stripCodeFences(raw: string) {
  return raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

export function parseJsonArrayFromModelOutput<T>(raw: string): T[] | null {
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
