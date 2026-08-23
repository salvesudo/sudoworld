'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  // Close on Escape, and lock page scroll while the lightbox is open.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-sm sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full image view"
        className="absolute right-4 top-4 z-10 rounded-full bg-cream/10 p-3 text-cream transition hover:bg-cream/20"
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

      {/*
        Explicit, viewport-derived size (not `h-full` inside a flex
        parent) so this container has a stable intrinsic size on its own.
        next/image's `fill` doesn't contribute a size back to its parent,
        so relying on flex auto-sizing here caused the browser to
        re-resolve the layout on every hover-triggered repaint — visible
        as image jitter that only showed up with a mouse (no hover on
        touch devices, so mobile never triggered it).
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-[min(85vh,64rem)] w-[min(90vw,64rem)]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={95}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
