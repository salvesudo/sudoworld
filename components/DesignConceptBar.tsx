'use client'

import Link from 'next/link'

const CONCEPTS = [
  { href: '/design-1', label: 'Design 1' },
  { href: '/design-2', label: 'Design 2' },
  { href: '/design-3', label: 'Design 3' },
  { href: '/design-4', label: 'Design 4' },
  { href: '/design-5', label: 'Design 5' },
]

export function DesignConceptBar({
  number,
  name,
  dark = false,
}: {
  number: string
  name: string
  dark?: boolean
}) {
  return (
    <div
      className={`sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-xs ${
        dark
          ? 'border-white/10 bg-black/90 text-white/70 backdrop-blur'
          : 'border-black/10 bg-white/90 text-black/60 backdrop-blur'
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        <span className={dark ? 'text-white' : 'text-black'}>
          SudoWorld Design Concept {number}
        </span>
        <span className="opacity-50">— {name}</span>
      </div>

      <nav className="flex flex-wrap items-center gap-1.5">
        <Link
          href="/"
          className={`rounded-full border px-3 py-1 transition ${
            dark
              ? 'border-white/20 hover:bg-white/10'
              : 'border-black/15 hover:bg-black/5'
          }`}
        >
          Current Site
        </Link>
        {CONCEPTS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-full border px-3 py-1 transition ${
              c.href === `/design-${number}`
                ? dark
                  ? 'border-white bg-white text-black'
                  : 'border-black bg-black text-white'
                : dark
                  ? 'border-white/20 hover:bg-white/10'
                  : 'border-black/15 hover:bg-black/5'
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
