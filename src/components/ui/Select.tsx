import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import Chevron from './Chevron'

export interface SelectOption {
  value: string
  label: string
  /** Optional group heading rendered above this option. */
  group?: string
}

interface SelectProps {
  id: string
  name: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

/**
 * Custom single-select listbox replacing the native <select>.
 * Keyboard: Up/Down move, Home/End jump, Enter/Space choose, Escape closes,
 * typing a letter jumps to the next matching option.
 */
export default function Select({
  id,
  name,
  value,
  options,
  onChange,
  onBlur,
  placeholder = 'Select…',
  invalid = false,
  describedBy,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const uid = useId()

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  const close = useCallback(() => setOpen(false), [])
  useOutsideClick(rootRef, open, close)

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const choose = (index: number) => {
    const opt = options[index]
    if (!opt) return
    onChange(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  // Report blur only when focus leaves the whole control (not into the list).
  const onLeave = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
      setOpen(false)
      onBlur?.()
    }
  }

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, last))
        return
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        return
      case 'End':
        e.preventDefault()
        setActiveIndex(last)
        return
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(activeIndex)
        return
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        return
      case 'Tab':
        setOpen(false)
        return
    }
    // Type-ahead
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = e.timeStamp
      const t = typeahead.current
      t.text = now - t.at < 700 ? t.text + e.key.toLowerCase() : e.key.toLowerCase()
      t.at = now
      const start = activeIndex + (t.text.length === 1 ? 1 : 0)
      const order = [...options.keys()].map((i) => (start + i) % options.length)
      const hit = order.find((i) => options[i].label.toLowerCase().startsWith(t.text))
      if (hit !== undefined) setActiveIndex(hit)
    }
  }

  // Group headings appear on the first option of each group.
  const rows = options.map((opt, i) => ({ ...opt, showGroup: Boolean(opt.group) && opt.group !== options[i - 1]?.group }))

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        data-field={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onBlur={onLeave}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openList()
          }
        }}
        className="field-input flex items-center justify-between gap-3 text-left disabled:opacity-60"
      >
        <span className={`truncate ${selected ? 'text-black' : 'text-neutral-400'}`}>{selected ? selected.label : placeholder}</span>
        <Chevron className={`shrink-0 text-neutral-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined}
          onKeyDown={onListKey}
          onBlur={onLeave}
          className="card-r absolute top-full left-0 z-40 mt-2 max-h-72 w-full overflow-y-auto bg-white p-1.5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_0.35)] ring-1 ring-black/10 outline-none"
        >
          {rows.map((opt, i) => {
            const showGroup = opt.showGroup
            const isSelected = opt.value === value
            const isActive = i === activeIndex
            return (
              <li
                key={opt.value}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(i)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isSelected ? 'bg-black text-white' : isActive ? 'bg-black/[0.06] text-black' : 'text-black'
                }`}
              >
                {showGroup && (
                  <span
                    aria-hidden="true"
                    className={`mb-1 block text-[10px] font-semibold tracking-[0.12em] uppercase ${isSelected ? 'text-white/60' : 'text-neutral-400'}`}
                  >
                    {opt.group}
                  </span>
                )}
                <span className="flex items-center justify-between gap-3">
                  {opt.label}
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
