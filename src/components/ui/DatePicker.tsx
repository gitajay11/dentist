import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import Chevron from './Chevron'

interface DatePickerProps {
  id: string
  name: string
  /** ISO date (YYYY-MM-DD) or empty string. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  /** Earliest selectable ISO date. */
  min?: string
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fromISO = (iso: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

const formatLong = (iso: string) => {
  const d = fromISO(iso)
  return d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

/**
 * Accessible calendar popover replacing <input type="date">.
 * Arrow keys move between days, PageUp/Down between months, Enter selects,
 * Escape closes. Days before `min` are disabled.
 */
export default function DatePicker({
  id,
  name,
  value,
  onChange,
  onBlur,
  min,
  placeholder = 'Choose a date',
  invalid = false,
  describedBy,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const uid = useId()

  const today = toISO(new Date())
  const minISO = min && min > today ? min : min ?? ''
  const initial = fromISO(value) ?? fromISO(minISO) ?? new Date()

  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [focusedISO, setFocusedISO] = useState(toISO(initial))

  const close = useCallback(() => setOpen(false), [])
  useOutsideClick(rootRef, open, close)

  // When opening, jump the view to the selected date (or the earliest allowed).
  const openPicker = () => {
    const base = fromISO(value) ?? fromISO(minISO) ?? new Date()
    setViewYear(base.getFullYear())
    setViewMonth(base.getMonth())
    setFocusedISO(toISO(base))
    setOpen(true)
  }

  // Move DOM focus to the focused day whenever the grid re-renders while open.
  useEffect(() => {
    if (!open) return
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focusedISO}"]`)
    btn?.focus()
  }, [open, focusedISO, viewMonth, viewYear])

  const isDisabled = (iso: string) => Boolean(minISO && iso < minISO)

  const select = (iso: string) => {
    if (isDisabled(iso)) return
    onChange(iso)
    setOpen(false)
    triggerRef.current?.focus()
  }

  // Report blur only when focus leaves the whole control (not into the calendar).
  const onLeave = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) onBlur?.()
  }

  const moveFocus = (days: number, months = 0) => {
    const d = fromISO(focusedISO) ?? new Date()
    d.setMonth(d.getMonth() + months)
    d.setDate(d.getDate() + days)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    setFocusedISO(toISO(d))
  }

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => moveFocus(-1),
      ArrowRight: () => moveFocus(1),
      ArrowUp: () => moveFocus(-7),
      ArrowDown: () => moveFocus(7),
      PageUp: () => moveFocus(0, -1),
      PageDown: () => moveFocus(0, 1),
      Home: () => moveFocus(-((fromISO(focusedISO)?.getDay() ?? 1) + 6) % 7),
      End: () => moveFocus((7 - (fromISO(focusedISO)?.getDay() ?? 1)) % 7),
      Enter: () => select(focusedISO),
      ' ': () => select(focusedISO),
      Escape: () => {
        setOpen(false)
        triggerRef.current?.focus()
      },
    }
    const fn = map[e.key]
    if (fn) {
      e.preventDefault()
      fn()
    }
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  // Build the 6-row grid (Monday first).
  const first = new Date(viewYear, viewMonth, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(viewYear, viewMonth, d)))
  while (cells.length % 7 !== 0) cells.push(null)

  const gridLabel = `${MONTHS[viewMonth]} ${viewYear}`

  return (
    <div ref={rootRef} className="relative">
      {/* Real form value for anything reading the DOM (tests, progressive enhancement). */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        data-field={name}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${uid}-cal`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openPicker())}
        onBlur={onLeave}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          } else if (e.key === 'Escape' && open) {
            setOpen(false)
          }
        }}
        className="field-input flex items-center justify-between gap-3 text-left disabled:opacity-60"
      >
        <span className={value ? 'text-black' : 'text-neutral-400'}>{value ? formatLong(value) : placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 text-neutral-500">
          <rect x="2.25" y="3.75" width="13.5" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2.25 7.5h13.5M6 2.25v3M12 2.25v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          id={`${uid}-cal`}
          role="dialog"
          aria-label="Choose a date"
          className="card-r absolute top-full left-0 z-40 mt-2 w-[19.5rem] bg-white p-3 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_0.35)] ring-1 ring-black/10"
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            >
              <Chevron direction="left" />
            </button>
            <p className="text-sm font-bold" aria-live="polite">
              {gridLabel}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            >
              <Chevron direction="right" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center" aria-hidden="true">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                {w}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            role="group"
            aria-label={gridLabel}
            onKeyDown={onGridKey}
            className="grid grid-cols-7 gap-y-0.5"
          >
            {cells.map((iso, i) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  data-iso={iso}
                  tabIndex={iso === focusedISO ? 0 : -1}
                  disabled={isDisabled(iso)}
                  aria-label={formatLong(iso)}
                  aria-pressed={iso === value}
                  aria-current={iso === today ? 'date' : undefined}
                  onClick={() => select(iso)}
                  onFocus={() => setFocusedISO(iso)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:text-neutral-300 ${
                    iso === value
                      ? 'bg-black text-white'
                      : iso === today
                        ? 'ring-1 ring-black/30 ring-inset hover:bg-black/5'
                        : 'hover:bg-black/5'
                  }`}
                >
                  {Number(iso.slice(-2))}
                </button>
              ) : (
                <span key={`empty-${i}`} aria-hidden="true" />
              ),
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-black/10 px-1 pt-2 text-[11px] font-semibold text-neutral-500">
            <span>{minISO ? 'Today or later' : ''}</span>
            <button type="button" onClick={() => select(today)} className="link-underline text-black">
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
