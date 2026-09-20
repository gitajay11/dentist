import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Tiny piece of shared state so any CTA (e.g. a treatment card) can
 * pre-select a treatment in the appointment form before scrolling to it.
 *
 * `requestId` increments on every request so the form can apply the same
 * treatment twice in a row without needing an effect.
 */
interface BookingContextValue {
  treatment: string
  requestId: number
  requestTreatment: (treatment: string) => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ treatment: '', requestId: 0 })

  const requestTreatment = useCallback((treatment: string) => {
    setState((s) => ({ treatment, requestId: s.requestId + 1 }))
  }, [])

  const value = useMemo(() => ({ ...state, requestTreatment }), [state, requestTreatment])
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within <BookingProvider>')
  return ctx
}
