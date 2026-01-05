export function normalizeBullets(bullets: string[]) {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

