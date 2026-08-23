import type { ReactNode } from 'react'

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white/60 p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta-light text-terracotta">
        {icon}
      </div>

      <h3 className="font-display text-lg font-medium text-charcoal">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-charcoal-soft">
        {description}
      </p>
    </div>
  )
}
