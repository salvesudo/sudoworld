import Image from 'next/image'
import Link from 'next/link'

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

// Category-specific fallback art (gradient + inline SVG motif) so an
// empty image_url never shows a boring blank box. Matched loosely by
// name/slug keywords; falls back to a generic SudoWorld mark otherwise.
function CategoryFallbackArt({ category }: { category: Category }) {
  const key = `${category.name} ${category.slug}`.toLowerCase()

  if (key.includes('string')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-beige to-beige-dark">
        <svg
          viewBox="0 0 200 200"
          className="h-28 w-28 opacity-70"
          aria-hidden="true"
        >
          <g stroke="#2A2420" strokeWidth="1">
            <path d="M20 180 L100 20" />
            <path d="M40 180 L120 30" />
            <path d="M60 180 L140 40" />
            <path d="M80 180 L160 50" />
            <path d="M100 180 L180 60" />
          </g>
          <g fill="#C1602E">
            <circle cx="20" cy="180" r="3" />
            <circle cx="100" cy="20" r="3" />
            <circle cx="60" cy="180" r="3" />
            <circle cx="140" cy="40" r="3" />
            <circle cx="100" cy="180" r="3" />
            <circle cx="180" cy="60" r="3" />
          </g>
        </svg>
      </div>
    )
  }

  if (key.includes('candle')) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-terracotta-light to-beige">
        <div className="absolute h-24 w-24 rounded-full bg-terracotta/30 blur-2xl" />
        <svg
          viewBox="0 0 100 140"
          className="relative h-28 w-20"
          aria-hidden="true"
        >
          <rect x="30" y="40" width="40" height="90" rx="6" fill="#EAD9BE" />
          <rect x="30" y="40" width="40" height="90" rx="6" fill="none" stroke="#5B5147" strokeWidth="1" opacity="0.3" />
          <path d="M50 40 C50 25 46 20 46 12 C46 6 50 2 50 2 C50 2 54 6 54 12 C54 20 50 25 50 40Z" fill="#C1602E" />
        </svg>
      </div>
    )
  }

  if (key.includes('telescope')) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal to-charcoal-soft">
        <svg
          viewBox="0 0 200 200"
          className="h-28 w-28 opacity-80"
          aria-hidden="true"
        >
          <g fill="#F0E4CF">
            <circle cx="40" cy="30" r="1.5" />
            <circle cx="70" cy="50" r="1" />
            <circle cx="150" cy="25" r="1.5" />
            <circle cx="170" cy="60" r="1" />
            <circle cx="30" cy="80" r="1" />
            <circle cx="120" cy="35" r="1" />
          </g>
          <circle cx="100" cy="100" r="55" stroke="#8C9B7B" strokeWidth="1.5" fill="none" opacity="0.6" />
          <rect x="60" y="95" width="80" height="14" rx="7" fill="#EAD9BE" transform="rotate(-25 100 100)" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-beige to-cream-dark text-4xl text-charcoal-soft">
      ✦
    </div>
  )
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group overflow-hidden rounded-3xl border border-charcoal/10 bg-white/60 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-72 overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="transition duration-500 group-hover:scale-105 h-full w-full">
            <CategoryFallbackArt category={category} />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-xl font-medium text-charcoal">
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-charcoal-soft">
            {category.description}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta transition group-hover:gap-2.5">
          Explore {category.name}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
