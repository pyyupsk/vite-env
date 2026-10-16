// Brackets around a check mark: a value that passed validation.
export function Logo({ size = 24 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M18 11H12V37H18M30 11H36V37H30"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
      />
      <path
        d="M18.5 24.5L22.5 28.5L30 19"
        stroke="var(--link)"
        strokeWidth="3.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
