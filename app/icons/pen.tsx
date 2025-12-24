import type { IconProps } from "./icon-props";

export function PenIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 16.75 16.75 4a1.8 1.8 0 0 1 2.55 0l0.7 0.7a1.8 1.8 0 0 1 0 2.55L7.25 20H4z" />
      <path d="M15.5 5.5 18.5 8.5" />
      <path d="M4 20h3.25L4 16.75Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
