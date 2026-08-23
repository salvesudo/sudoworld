type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <div className={`mb-10 max-w-2xl sm:mb-14 ${alignClass}`}>
      {eyebrow && (
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${
            light ? 'text-cream/70' : 'text-terracotta'
          }`}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={`font-display text-3xl font-medium tracking-tight sm:text-4xl ${
          light ? 'text-cream' : 'text-charcoal'
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-base leading-7 ${
            light ? 'text-cream/80' : 'text-charcoal-soft'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
