import type { CSSProperties, ReactNode, Ref } from 'react'
import type { ImageSize } from '../hooks/useImageSize'
import type { MaskPosition } from '../hooks/useMaskPositions'

interface MaskedCardProps {
  bgImage: string
  position?: MaskPosition
  imageSize: ImageSize | null
  /** Horizontal focal point (0 = left edge, 1 = right edge) used when the image overflows the section. */
  focalX?: number
  /** Vertical focal point, same idea. */
  focalY?: number
  className?: string
  style?: CSSProperties
  cardRef?: Ref<HTMLDivElement>
  children?: ReactNode
}

/**
 * A card that shows one "window" of a background image shared by every
 * MaskedCard in the same section. The image is scaled to cover the whole
 * section, then each card offsets it by its own position so the mosaic
 * reads as a single picture with gaps cut out of it.
 */
export default function MaskedCard({
  bgImage,
  position,
  imageSize,
  focalX = 0.8,
  focalY = 0.5,
  className = '',
  style,
  cardRef,
  children,
}: MaskedCardProps) {
  let bgStyle: CSSProperties = {}

  if (position && imageSize && position.sw > 0 && position.sh > 0) {
    const scale = Math.max(position.sw / imageSize.width, position.sh / imageSize.height)
    const renderW = imageSize.width * scale
    const renderH = imageSize.height * scale
    const overflowX = Math.max(renderW - position.sw, 0)
    const overflowY = Math.max(renderH - position.sh, 0)
    const focalOffsetX = overflowX * focalX
    const focalOffsetY = overflowY * focalY

    bgStyle = {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: `${renderW}px ${renderH}px`,
      backgroundPosition: `${-(position.x + focalOffsetX)}px ${-(position.y + focalOffsetY)}px`,
      backgroundRepeat: 'no-repeat',
    }
  }

  return (
    <div ref={cardRef} className={`bg-stone-100 ${className}`} style={{ ...bgStyle, ...style }}>
      {children}
    </div>
  )
}
