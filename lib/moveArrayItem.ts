export function moveArrayItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return [...items];
  if (fromIndex < 0 || fromIndex >= items.length) return [...items];
  if (toIndex < 0 || toIndex >= items.length) return [...items];
  const next = [...items];
  const [picked] = next.splice(fromIndex, 1);
  if (picked === undefined) return [...items];
  next.splice(toIndex, 0, picked);
  return next;
}

