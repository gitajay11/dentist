interface ChevronProps {
  className?: string
  direction?: 'down' | 'left' | 'right'
}

const rotate = { down: '', left: 'rotate-90', right: '-rotate-90' }

export default function Chevron({ className = '', direction = 'down' }: ChevronProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`${rotate[direction]} ${className}`}
    >
      <path d="M2.5 5l4.5 4.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
