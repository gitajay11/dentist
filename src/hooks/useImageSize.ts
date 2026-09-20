import { useEffect, useState } from 'react'

export interface ImageSize {
  width: number
  height: number
}

/**
 * Loads an image off-screen and reports its natural dimensions, so a
 * MaskedCard can work out how large the shared image renders when it is
 * scaled to cover the section (and therefore how much to offset each card).
 */
export function useImageSize(src: string): ImageSize | null {
  const [size, setSize] = useState<ImageSize | null>(null)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!cancelled) setSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return size
}
