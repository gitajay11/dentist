import type { ReactNode } from 'react'

export interface SegmentOption {
  value: string
  label: string
  hint?: string
  icon?: ReactNode
}

interface SegmentedControlProps {
  id: string
  name: string
  value: string
  options: SegmentOption[]
  onChange: (value: string) => void
  onBlur?: () => void
  /** id of the visible label element. */
  labelledBy?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

/**
 * Pill-style radio group. Uses real radio inputs (visually hidden) so
 * keyboard and screen-reader behaviour comes for free.
 */
export default function SegmentedControl({
  id,
  name,
  value,
  options,
  onChange,
  onBlur,
  labelledBy,
  invalid = false,
  describedBy,
  disabled = false,
}: SegmentedControlProps) {
  return (
    <div
      id={id}
      data-field={name}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      tabIndex={-1}
      className={`grid gap-1 rounded-xl border bg-white p-1 outline-none transition-[border-color,box-shadow] duration-200 focus-within:border-black focus-within:shadow-[0_0_0_3px_rgb(0_0_0_/_0.08)] ${
        invalid ? 'border-red-600' : 'border-black/15'
      }`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const checked = opt.value === value
        const optId = `${id}-${opt.value.replace(/\s+/g, '-').toLowerCase()}`
        return (
          <label
            key={opt.value}
            htmlFor={optId}
            className={`flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2.5 text-center transition-[background-color,color] duration-300 select-none ${
              checked ? 'bg-black text-white' : 'text-black hover:bg-black/[0.05]'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              id={optId}
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
              onBlur={onBlur}
              className="sr-only"
            />
            {opt.icon}
            <span className="text-sm font-semibold">{opt.label}</span>
            {opt.hint && <span className={`text-[10px] font-medium ${checked ? 'text-white/60' : 'text-neutral-500'}`}>{opt.hint}</span>}
          </label>
        )
      })}
    </div>
  )
}
