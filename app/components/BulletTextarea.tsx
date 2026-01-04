"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

function stripBulletPrefix(line: string) {
  return line.replace(/^\s*[•\-]\s*/, "");
}

function toDisplayValue(bullets: string[]) {
  const items = bullets.length ? bullets : [""];
  return items.map((b) => `• ${b}`).join("\n");
}

function toBullets(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const content = stripBulletPrefix(line);
      return content.trim().length ? content : "";
    });
}

function displayLinesFromBullets(bullets: string[]) {
  const items = bullets.length ? bullets : [""];
  return items.map((b) => `• ${b}`);
}

function caretPosForBulletEnd(bullets: string[], bulletIndex: number) {
  const lines = displayLinesFromBullets(bullets);
  const idx = Math.max(0, Math.min(bulletIndex, lines.length - 1));
  let offset = 0;
  for (let i = 0; i < idx; i++) {
    offset += lines[i].length + 1; // + newline
  }
  return offset + lines[idx].length;
}

type Props = {
  label: string;
  bullets: string[];
  onChange: (next: string[]) => void;
  rows?: number;
  className?: string;
  placeholder?: string;
};

export function BulletTextarea({
  label,
  bullets,
  onChange,
  rows = 4,
  className = "rounded-lg border border-zinc-200 bg-white px-3 py-2",
  placeholder = "• Bullet",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);

  const displayValue = useMemo(() => toDisplayValue(bullets), [bullets]);

  useLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    const el = textareaRef.current;
    if (caret == null || !el) return;
    pendingCaretRef.current = null;
    el.setSelectionRange(caret, caret);
  }, [displayValue]);

  const handleChange = useCallback(
    (nextText: string) => {
      onChange(toBullets(nextText));
    },
    [onChange],
  );

  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold text-zinc-800">{label}</span>
      <textarea
        ref={textareaRef}
        rows={rows}
        className={className}
        value={displayValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Backspace") return;
          if (e.currentTarget.selectionStart !== e.currentTarget.selectionEnd) return;

          const caret = e.currentTarget.selectionStart ?? 0;
          const text = e.currentTarget.value;
          const lineStart = text.lastIndexOf("\n", Math.max(0, caret - 1)) + 1;
          const lineEndRaw = text.indexOf("\n", caret);
          const lineEnd = lineEndRaw === -1 ? text.length : lineEndRaw;
          const line = text.slice(lineStart, lineEnd);
          const bulletIndex = text.slice(0, lineStart).split("\n").length - 1;
          const content = stripBulletPrefix(line);
          const isEmptyBullet = content.trim().length === 0;
          const caretInPrefix = caret <= lineStart + 2;

          if (!caretInPrefix) return;

          e.preventDefault();

          if (isEmptyBullet) {
            const next = bullets.length ? bullets.slice() : [""];
            const removeAt = Math.max(0, Math.min(bulletIndex, next.length - 1));
            next.splice(removeAt, 1);
            if (!next.length) next.push("");
            const newCaret = caretPosForBulletEnd(next, Math.max(0, removeAt - 1));
            pendingCaretRef.current = newCaret;
            onChange(next);
            return;
          }

          // Don't allow deleting the bullet prefix; keep caret after `• `.
          pendingCaretRef.current = lineStart + 2;
        }}
      />
    </label>
  );
}
