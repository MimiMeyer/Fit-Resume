"use client";

export function ReorderButtons({
  upDisabled,
  downDisabled,
  onUp,
  onDown,
  buttonClassName,
  upTitle = "Move up",
  downTitle = "Move down",
  upAriaLabel = "Move up",
  downAriaLabel = "Move down",
}: {
  upDisabled: boolean;
  downDisabled: boolean;
  onUp: () => void;
  onDown: () => void;
  buttonClassName: string;
  upTitle?: string;
  downTitle?: string;
  upAriaLabel?: string;
  downAriaLabel?: string;
}) {
  if (upDisabled && downDisabled) return null;

  return (
    <>
      {!upDisabled ? (
        <button
          type="button"
          disabled={upDisabled}
          className={buttonClassName}
          onClick={onUp}
          aria-label={upAriaLabel}
          title={upTitle}
        >
          ↑
        </button>
      ) : null}
      {!downDisabled ? (
        <button
          type="button"
          disabled={downDisabled}
          className={buttonClassName}
          onClick={onDown}
          aria-label={downAriaLabel}
          title={downTitle}
        >
          ↓
        </button>
      ) : null}
    </>
  );
}
