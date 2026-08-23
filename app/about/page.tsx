import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SectionHeading } from '@/components/SectionHeading'

export const metadata = {
  title: 'About — SudoWorld',
  description:
    'The story behind SudoWorld — handmade string art, decorative candles, telescopes and other creative pieces made with imagination.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream text-charcoal">
      <SiteHeader />

      <section className="bg-beige/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
            Our Story
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-charcoal sm:text-5xl">
            Made With Imagination
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-charcoal-soft">
            SudoWorld is a place for handmade creations, creative experiments
            and unique ideas. From detailed string art and decorative
            candles to telescopes and other DIY-inspired projects, we bring
            together products made for people who appreciate creativity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="How it starts"
          title="From a Home Workshop to Your Home"
          subtitle="Every SudoWorld piece begins the same way — an idea, some raw material, and a lot of patience."
        />

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-3xl text-terracotta">01</p>
            <h3 className="mt-2 font-medium text-charcoal">Design</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Every piece starts as a sketch or an idea worth chasing.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-terracotta">02</p>
            <h3 className="mt-2 font-medium text-charcoal">Craft</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Made by hand, in small batches, with real materials.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-terracotta">03</p>
            <h3 className="mt-2 font-medium text-charcoal">Deliver</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Carefully packed and sent from our workshop to your door.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-charcoal px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-terracotta"
          >
            Shop All Products
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
