export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeKey(value: string) {
  return normalizeText(value).toLowerCase();
}

