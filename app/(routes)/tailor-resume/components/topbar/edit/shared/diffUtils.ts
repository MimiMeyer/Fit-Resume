export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeKey(value: string) {
  return normalizeText(value).toLowerCase();
}

export function equalStringSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

export function dirtyInputClass(isDirty: boolean) {
  return [
    "w-full min-w-0 rounded-lg border bg-white px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm",
    isDirty
      ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300 focus:outline-none shadow-sm"
      : "border-zinc-200",
  ].join(" ");
}

export function takeBestMatch<TCurrent, TBase>(
  remaining: TBase[],
  current: TCurrent,
  score: (current: TCurrent, candidate: TBase) => number,
  opts?: { minScore?: number },
): TBase | null {
  const minScore = opts?.minScore ?? 1;
  let bestIndex = -1;
  let bestScore = 0;
  for (let i = 0; i < remaining.length; i++) {
    const nextScore = score(current, remaining[i]);
    if (nextScore > bestScore) {
      bestScore = nextScore;
      bestIndex = i;
    }
  }
  if (bestIndex === -1 || bestScore < minScore) return null;
  const [picked] = remaining.splice(bestIndex, 1);
  return picked ?? null;
}

