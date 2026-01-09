"use client";

import { useEffect, useRef, useState } from "react";

export function SectionAdd({
  label,
  onAdd,
  disabled,
  mode,
  itemsCount,
  className,
}: {
  label: string;
  onAdd: () => void;
  disabled?: boolean;
  mode: "top" | "bottom";
  itemsCount?: number;
  className?: string;
}) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [showBottom, setShowBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (mode !== "bottom") return;
    if (!anchorRef.current) return;

    const root = anchorRef.current.closest("[data-modal-scroll]") as HTMLElement | null;
    if (!root) return;

    const thresholdPx = 8;

    const compute = () => {
      const nextScrollable = root.scrollHeight > root.clientHeight + 2;
      setIsScrollable(nextScrollable);
      if (!nextScrollable) return setShowBottom(false);

      const remaining = root.scrollHeight - root.scrollTop - root.clientHeight;
      setShowBottom(remaining <= thresholdPx);
    };

    const raf = window.requestAnimationFrame(compute);
    root.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.cancelAnimationFrame(raf);
      root.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [itemsCount, mode]);

  if (mode === "bottom" && (itemsCount ?? 0) <= 0) return null;

  const button = (
    <button
      type="button"
      disabled={disabled}
      className={[
        "text-xs font-semibold text-[var(--accent)] disabled:opacity-60 sm:text-sm",
        className ?? "",
      ].join(" ")}
      onClick={onAdd}
    >
      {label}
    </button>
  );

  if (mode === "top") return button;

  const bottomVisible = isScrollable && showBottom;

  return (
    <div className={isScrollable ? "mt-4" : "mt-0"}>
      <div ref={anchorRef} className="h-px w-full" aria-hidden="true" />
      <div className="flex justify-end">
        <div
          className={[
            "transition-opacity",
            bottomVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {button}
        </div>
      </div>
    </div>
  );
}
