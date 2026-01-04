"use client";

import { useEffect, useRef } from "react";

export function useAutoScrollOnAdd(itemsLength: number) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollRef = useRef(false);
  const prevLengthRef = useRef(itemsLength);

  useEffect(() => {
    const prevLength = prevLengthRef.current;
    prevLengthRef.current = itemsLength;

    if (!pendingScrollRef.current) return;
    if (itemsLength <= prevLength) return;

    pendingScrollRef.current = false;
    const el = listRef.current?.lastElementChild as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstField = el.querySelector("input,textarea") as HTMLElement | null;
    firstField?.focus();
  }, [itemsLength]);

  return { listRef, markAdded: () => (pendingScrollRef.current = true) };
}
