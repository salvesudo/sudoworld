'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export type LightboxImage = {
  src: string
  alt: string
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: LightboxImage[]
  initialIndex?: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), images.length - 1)
  )
  const [zoomed, setZoomed] = useState(false)

  const hasMultiple = images.length > 1
  const active = images[index]

  function goPrev() {
    setZoomed(false)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  function goNext() {
    setZoomed(false)
    setIndex((i) => (i + 1) % images.length)
  }

  // Close on Escape, arrow-key navigation, and lock page scroll while the
  // lightbox is open — restored exactly on unmount either way (Escape,
  // the X button, or clicking outside all unmount this component the
  // same way, so there's a single restoration path, not three).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev()
      if (e.key === 'ArrowRight' && hasMultiple) goNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, hasMultiple])

  if (!active) return null

  return (
    // No backdrop-blur here on purpose: `backdrop-filter: blur()` across
    // a full-viewport fixed element is GPU-expensive and can recomposite
    // on every cursor move, visible as flicker right at the image edge.
    // A solid, slightly more opaque backdrop gives the same dimmed-page
    // effect without that cost.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-charcoal/95 p-4 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full image view"
        className="absolute right-4 top-4 z-20 rounded-full bg-cream/10 p-3 text-cream transition hover:bg-cream/20"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream/10 p-3 text-cream transition hover:bg-cream/20 sm:left-4"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream/10 p-3 text-cream transition hover:bg-cream/20 sm:right-4"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/*
        Explicit, viewport-derived size (not `h-full` inside a flex
        parent) so this container has a stable intrinsic size on its own.
        next/image's `fill` doesn't contribute a size back to its parent,
        so relying on flex auto-sizing here caused the browser to
        re-resolve layout on every hover-triggered repaint — visible as
        image jitter that only showed up with a mouse.
      */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          setZoomed((z) => !z)
        }}
        className={`relative h-[min(78vh,64rem)] w-[min(90vw,64rem)] overflow-hidden ${
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}
      >
        {/* fill mode stays constant (keeps next/image's prop shape simple
            and type-safe); zoom is a CSS scale on this inner wrapper,
            clipped by the outer box's overflow-hidden — so it can never
            grow past the frame or affect page layout either way. */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ${
            zoomed ? 'scale-[1.8]' : 'scale-100'
          }`}
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            sizes="100vw"
            quality={95}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {hasMultiple && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 mt-4 flex max-w-full gap-2 overflow-x-auto px-2"
        >
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => {
                setZoomed(false)
                setIndex(i)
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index ? 'border-terracotta' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.src} alt={img.alt} fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
