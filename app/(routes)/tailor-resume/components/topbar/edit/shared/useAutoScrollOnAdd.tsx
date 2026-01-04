"use client";

import { useEffect, useRef, useState } from "react";

export function useAutoScrollOnAdd(itemsLength: number) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [didAdd, setDidAdd] = useState(false);

  useEffect(() => {
    if (!didAdd) return;
    setDidAdd(false);
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstField = el.querySelector("input,textarea") as HTMLElement | null;
    firstField?.focus();
  }, [didAdd, itemsLength]);

  return { listRef, markAdded: () => setDidAdd(true) };
}
