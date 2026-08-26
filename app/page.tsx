'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CosmicHeader } from '@/components/CosmicHeader'
import { CosmicFooter } from '@/components/CosmicFooter'
import { Starfield, Medallion, HeroMedallion } from '@/components/CosmicMedallion'
import {
  fetchStorefrontData,
  REAL_MOON_IMAGE_URL,
  REAL_CANDLE_IMAGE_URL,
  type StorefrontCategory,
} from '@/lib/storefront-data'
import type { Product } from '@/components/ProductCard'

// The Dark Cosmic homepage — chosen from the 5 design previews built at
// /design-1 .. /design-5 (this is what was /design-2). Real Supabase data
// via the same fetchStorefrontData() helper the previews used; no preview
// chrome (DesignConceptBar / design switcher) since this is the live site.
export default function Home() {
  const [categories, setCategories] = useState<StorefrontCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorefrontData().then((data) => {
      setCategories(data.categories)
      setProducts(data.products)
      setLoading(false)
    })
  }, [])

  const featured = products.filter((p) => p.is_featured).slice(0, 6)
  const showcase = (featured.length > 0 ? featured : products).slice(0, 6)
  const telescopeProducts = products.filter((p) =>
    p.categories?.name?.toLowerCase().includes('telescope')
  )

  return (
    <main className="min-h-screen bg-cream text-charcoal font-mono">
      <CosmicHeader />

      {/* HERO — full-bleed real Moon photo + two-color string-art medallion overlay */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={REAL_MOON_IMAGE_URL}
          alt="The Moon — a real NASA photograph showing craters and maria in detail, public domain"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0">
          <HeroMedallion />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/60 to-cream/20" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-terracotta">
            Handmade. Creative. Unique.
          </p>
          <h1 className="mb-6 font-display text-6xl italic leading-[1.02] tracking-tight text-charcoal sm:text-8xl">
            Look Beyond.
          </h1>
          <p className="mx-auto mb-10 max-w-md text-sm leading-7 text-charcoal-soft">
            Discover handmade art and explore the universe from your own backyard.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-full border border-terracotta px-9 py-3.5 text-xs uppercase tracking-[0.16em] text-terracotta transition hover:bg-terracotta hover:text-cream"
          >
            Explore Products
          </Link>
        </div>
      </section>

      {/* FROM ART TO THE COSMOS — category discovery */}
      <section id="cosmos" className="relative border-t border-cream/10 py-24">
        <Starfield />
        <div className="relative mx-auto max-w-[1400px] px-6">
          <p className="mb-3 text-center text-[11px] uppercase tracking-[0.24em] text-terracotta">
            The Collections
          </p>
          <h2 className="mb-16 text-center font-display text-4xl italic sm:text-5xl">
            From Art To The Cosmos
          </h2>

          {loading && <p className="text-center text-sm text-charcoal-soft">Loading…</p>}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {categories.map((cat) => {
              const isString = cat.name.toLowerCase().includes('string')
              const isCandle = cat.name.toLowerCase().includes('candle')
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group overflow-hidden rounded-lg border border-cream/10 bg-cream-dark transition hover:border-terracotta/50"
                >
                  <div className="relative h-56 overflow-hidden bg-beige">
                    {cat.image_url ? (
                      // A real photo uploaded for this category (Admin →
                      // Categories → Image URL) always wins over the
                      // built-in fallbacks below.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : isCandle ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={REAL_CANDLE_IMAGE_URL}
                        alt="Lit pillar candles in a dark room"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : isString ? (
                      <div className="h-full w-full p-8">
                        <Medallion tone="#e14b2e" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={REAL_MOON_IMAGE_URL}
                        alt="The Moon — NASA"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 font-display text-2xl italic text-charcoal">{cat.name}</h3>
                    <p className="mb-4 text-xs leading-6 text-charcoal-soft">
                      {cat.description ||
                        (isString
                          ? 'Handcrafted patterns created thread by thread.'
                          : isCandle
                            ? 'Sculptural candles designed to bring art into everyday spaces.'
                            : 'Build, explore and discover the night sky.')}
                    </p>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-terracotta group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="border-t border-cream/10 bg-beige-dark py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-terracotta">Featured</p>
          <h2 className="mb-14 font-display text-4xl italic sm:text-5xl">Pieces worth a second look.</h2>

          {!loading && showcase.length === 0 && (
            <p className="text-sm text-charcoal-soft">No products available yet.</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((product) => {
              const primary =
                product.product_images?.find((im) => im.is_primary) || product.product_images?.[0]
              const hasDiscount =
                product.compare_at_price != null && product.compare_at_price > product.price
              return (
                <div key={product.id} className="overflow-hidden rounded-lg border border-cream/10 bg-cream-dark">
                  <Link
                    href={`/product/${product.slug}`}
                    className="group relative block h-64 w-full overflow-hidden bg-beige text-left"
                  >
                    {primary ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primary.image_url}
                        alt={primary.alt_text || product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-10">
                        <Medallion />
                      </div>
                    )}
                    {product.is_featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-terracotta px-3 py-1 text-[10px] font-semibold uppercase text-cream">
                        Featured
                      </span>
                    )}
                  </Link>
                  <div className="p-5">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-charcoal-soft">
                      {product.categories?.name}
                    </p>
                    <h3 className="mb-2 font-display text-xl italic text-charcoal">{product.name}</h3>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {product.is_handmade && (
                        <span className="rounded-full border border-cream/15 px-2.5 py-0.5 text-[10px] text-charcoal-soft">Handmade</span>
                      )}
                      {product.is_customizable && (
                        <span className="rounded-full border border-cream/15 px-2.5 py-0.5 text-[10px] text-charcoal-soft">Customizable</span>
                      )}
                      {product.is_diy && (
                        <span className="rounded-full border border-cream/15 px-2.5 py-0.5 text-[10px] text-charcoal-soft">DIY</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-charcoal">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                        {hasDiscount && (
                          <span className="ml-2 text-xs font-normal text-charcoal-soft line-through">
                            ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </p>
                      <Link href={`/product/${product.slug}`} className="text-[11px] uppercase tracking-[0.12em] text-terracotta hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-terracotta">Our Story</p>
          <p className="font-display text-3xl italic leading-snug text-charcoal sm:text-4xl">
            SudoWorld began the same way most good things do — curiosity,
            a workbench, and no interest in doing it the easy way.
          </p>
        </div>
      </section>

      {/* HANDMADE STORY */}
      <section className="border-t border-cream/10 bg-beige-dark py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <p className="mb-14 text-[11px] uppercase tracking-[0.24em] text-terracotta">Crafted, Not Manufactured</p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              ['01', 'Design', 'Every piece starts as a sketch worth chasing.'],
              ['02', 'Craft', 'Made by hand, one at a time, real materials.'],
              ['03', 'Deliver', 'Carefully packed and sent from the bench.'],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="mb-3 font-display text-3xl italic text-terracotta">{n}</p>
                <h3 className="mb-2 text-xs uppercase tracking-[0.14em] text-charcoal">{t}</h3>
                <p className="text-xs leading-6 text-charcoal-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COSMIC / TELESCOPE — dedicated section */}
      <section className="relative overflow-hidden border-t border-cream/10 py-24">
        <Starfield />
        <div className="relative mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-terracotta">A Closer Look</p>
              <h2 className="mb-6 font-display text-4xl italic leading-tight sm:text-5xl">
                Telescopes, pointed<br />somewhere real.
              </h2>
              <p className="mb-8 max-w-md text-sm leading-7 text-charcoal-soft">
                Not toys — instruments, assembled and finished by hand for
                anyone who still looks up at night.
              </p>
              <Link
                href="/category/diy-telescope"
                className="inline-block rounded-full border border-terracotta px-8 py-3 text-xs uppercase tracking-[0.16em] text-terracotta transition hover:bg-terracotta hover:text-cream"
              >
                View Telescopes
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(telescopeProducts.length > 0 ? telescopeProducts : products).slice(0, 2).map((p) => {
                const primary = p.product_images?.find((im) => im.is_primary) || p.product_images?.[0]
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="overflow-hidden rounded-lg border border-cream/10 bg-cream-dark"
                  >
                    <div className="relative h-40 bg-beige">
                      {primary ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={primary.image_url} alt={primary.alt_text || p.name} className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={REAL_MOON_IMAGE_URL} alt="The Moon — NASA" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-charcoal">{p.name}</p>
                      <p className="mt-1 text-xs text-terracotta">₹{Number(p.price).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WHY SUDOWORLD */}
      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <p className="mb-14 text-center text-[11px] uppercase tracking-[0.24em] text-terracotta">Why SudoWorld</p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Handmade With Care', 'Every creation made with attention to detail.'],
              ['Unique Designs', 'Nothing here is mass-produced.'],
              ['Creative & Original', 'Made for people who love imagination.'],
              ['Made With Passion', "A little of the maker's passion, in every piece."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-cream/10 p-6">
                <h3 className="mb-2 font-display text-lg italic text-charcoal">{t}</h3>
                <p className="text-xs leading-6 text-charcoal-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-cream/10 py-24 text-center">
        <Starfield />
        <div className="relative mx-auto max-w-xl px-6">
          <h2 className="mb-8 font-display text-4xl italic sm:text-5xl">Something worth discovering.</h2>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-terracotta px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition hover:bg-terracotta-dark"
          >
            Shop All Products
          </Link>
        </div>
      </section>

      <CosmicFooter />
    </main>
  )
}
