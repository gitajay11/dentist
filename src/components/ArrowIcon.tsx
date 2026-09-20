interface ArrowIconProps {
  className?: string
  size?: number
}

/** Reference-template arrow: a plain right arrow, rotated -45° for "open" affordance. */
export default function ArrowIcon({ className = '', size = 14 }: ArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={`rotate-[-45deg] ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
