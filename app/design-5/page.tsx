'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DesignConceptBar } from '@/components/DesignConceptBar'
import { ImageLightbox } from '@/components/ImageLightbox'
import {
  fetchStorefrontData,
  REAL_MOON_IMAGE_URL,
  REAL_CANDLE_IMAGE_URL,
  type StorefrontCategory,
} from '@/lib/storefront-data'
import type { Product } from '@/components/ProductCard'

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap'

function Medallion({ tone = '#d4a94a' }: { tone?: string }) {
  const n = 180
  const skip = 71
  const paths: string[] = []
  for (let k = 0; k < n; k++) {
    const j = (k * skip) % n
    const a1 = (k / n) * Math.PI * 2 - Math.PI / 2
    const a2 = (j / n) * Math.PI * 2 - Math.PI / 2
    // Coordinates rounded before embedding: Math.cos/sin aren't required by
    // spec to be bit-identical across JS engines, and Node (SSR) vs Chromium
    // (client) can differ by 1 ULP — enough to fail React's hydration check.
    paths.push(
      `M ${(50 + 46 * Math.cos(a1)).toFixed(3)} ${(50 + 46 * Math.sin(a1)).toFixed(3)} L ${(50 + 46 * Math.cos(a2)).toFixed(3)} ${(50 + 46 * Math.sin(a2)).toFixed(3)}`
    )
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g stroke={tone} strokeWidth="0.14" opacity="0.7">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}

export default function Design5Page() {
  const [categories, setCategories] = useState<StorefrontCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    fetchStorefrontData().then((data) => {
      setCategories(data.categories)
      setProducts(data.products)
      setLoading(false)
    })
  }, [])

  const featured = products.filter((p) => p.is_featured).slice(0, 6)
  const showcase = (featured.length > 0 ? featured : products).slice(0, 6)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONTS_HREF} rel="stylesheet" />

      <div style={{ fontFamily: "'Jost', sans-serif" }} className="bg-[#f7f2e7] text-[#1c1712]">
        <DesignConceptBar number="05" name="Premium Cosmic Art Boutique" />

        {/* NAV — split around a centered logo */}
        <header className="border-b border-[#1c1712]/10 bg-[#f7f2e7]">
          <div className="mx-auto grid max-w-[1360px] grid-cols-3 items-center px-6 py-6">
            <nav className="hidden gap-7 text-xs font-medium uppercase tracking-[0.16em] sm:flex">
              <Link href="/shop" className="hover:text-[#d4a94a]">Shop</Link>
              <Link href="/#journey" className="hover:text-[#d4a94a]">Categories</Link>
            </nav>
            <span style={{ fontFamily: "'Italiana', serif" }} className="text-center text-2xl tracking-wide">SudoWorld</span>
            <nav className="hidden justify-end gap-7 text-xs font-medium uppercase tracking-[0.16em] sm:flex">
              <Link href="/about" className="hover:text-[#d4a94a]">About</Link>
              <Link href="/cart" className="hover:text-[#d4a94a]">Cart</Link>
            </nav>
          </div>
        </header>

        {/* HERO — real Moon photo + string-art geometry overlay */}
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#1c1712]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={REAL_MOON_IMAGE_URL}
            alt="The Moon — a real NASA photograph showing craters and maria in detail, public domain"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <Medallion tone="#d4a94a" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1712] via-[#1c1712]/40 to-[#1c1712]/10" />
          <div className="relative z-10 mx-auto max-w-2xl px-6 text-center text-[#f7f2e7]">
            <p className="mb-6 text-xs uppercase tracking-[0.28em] text-[#d4a94a]">Handmade. Creative. Unique.</p>
            <h1 style={{ fontFamily: "'Italiana', serif" }} className="mb-4 text-5xl leading-tight sm:text-7xl">
              Create Something Beautiful.
            </h1>
            <h2 style={{ fontFamily: "'Italiana', serif" }} className="mb-9 text-3xl leading-tight text-[#d4a94a] sm:text-5xl">
              Discover Something Extraordinary.
            </h2>
            <Link
              href="/shop"
              className="inline-block rounded-none border border-[#d4a94a] px-9 py-3.5 text-xs uppercase tracking-[0.16em] transition hover:bg-[#d4a94a] hover:text-[#1c1712]"
            >
              Explore Products
            </Link>
          </div>
        </section>

        {/* THE JOURNEY — String Art → Candles → Telescope → Moon */}
        <section id="journey" className="mx-auto max-w-[1360px] px-6 py-24">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.24em] text-[#d4a94a]">The Journey</p>
          <h2 style={{ fontFamily: "'Italiana', serif" }} className="mb-14 text-center text-4xl sm:text-5xl">
            From thread, to flame, to sky.
          </h2>

          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-sm sm:grid-cols-4">
            <div className="relative h-64 bg-[#2a1f14] p-10">
              <Medallion tone="#e14b2e" />
              <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.14em] text-[#e14b2e]">String Art</p>
            </div>
            <div className="relative h-64 overflow-hidden bg-[#3a2c1c]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover opacity-80" />
              <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.14em] text-[#f0a24d]">Candles</p>
            </div>
            <div className="relative h-64 bg-[#182338] p-10">
              <Medallion tone="#6f93ec" />
              <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.14em] text-[#6f93ec]">Telescopes</p>
            </div>
            <div className="relative h-64 overflow-hidden bg-[#0a0d18]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={REAL_MOON_IMAGE_URL} alt="The Moon — NASA" className="h-full w-full object-cover" />
              <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.14em] text-[#d4a94a]">The Moon</p>
            </div>
          </div>
        </section>

        {/* CATEGORY DISCOVERY */}
        <section className="border-t border-[#1c1712]/10 bg-white/50 py-24">
          <div className="mx-auto max-w-[1360px] px-6">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#d4a94a]">Collections</p>
            <h2 style={{ fontFamily: "'Italiana', serif" }} className="mb-14 max-w-lg text-4xl sm:text-5xl">
              Explore our collections.
            </h2>

            {loading && <p className="text-sm text-[#1c1712]/50">Loading…</p>}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {categories.map((cat, i) => {
                const isCandle = cat.name.toLowerCase().includes('candle')
                return (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
                    <div className="relative mb-5 h-64 overflow-hidden rounded-sm bg-[#eee3c8]">
                      {isCandle ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full p-10">
                          <Medallion tone={['#a3502b', '#3f5fc4', '#7a5a1e'][i % 3]} />
                        </div>
                      )}
                    </div>
                    <h3 style={{ fontFamily: "'Italiana', serif" }} className="mb-2 text-2xl">{cat.name}</h3>
                    <p className="mb-3 text-sm leading-6 text-[#1c1712]/60">
                      {cat.description ||
                        (cat.name.toLowerCase().includes('string')
                          ? 'Handcrafted patterns created thread by thread.'
                          : isCandle
                            ? 'Sculptural candles designed to bring art into everyday spaces.'
                            : 'Build, explore and discover the night sky.')}
                    </p>
                    <span className="text-xs uppercase tracking-[0.14em] text-[#d4a94a] group-hover:underline">Explore →</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="mx-auto max-w-[1360px] px-6 py-24">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#d4a94a]">Featured</p>
          <h2 style={{ fontFamily: "'Italiana', serif" }} className="mb-14 max-w-lg text-4xl sm:text-5xl">
            Extraordinary, by design.
          </h2>

          {!loading && showcase.length === 0 && <p className="text-sm text-[#1c1712]/50">No products available yet.</p>}

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((product) => {
              const primary = product.product_images?.find((im) => im.is_primary) || product.product_images?.[0]
              const hasDiscount = product.compare_at_price != null && product.compare_at_price > product.price
              return (
                <div key={product.id}>
                  <button
                    type="button"
                    onClick={() => primary && setLightbox({ src: primary.image_url, alt: primary.alt_text || product.name })}
                    className="group relative mb-5 block h-72 w-full overflow-hidden rounded-sm bg-[#eee3c8] text-left"
                  >
                    {primary ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={primary.image_url} alt={primary.alt_text || product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-10">
                        <Medallion />
                      </div>
                    )}
                    {product.is_featured && (
                      <span className="absolute left-3 top-3 bg-[#1c1712] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f7f2e7]">Featured</span>
                    )}
                  </button>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#d4a94a]">{product.categories?.name}</p>
                  <h3 style={{ fontFamily: "'Italiana', serif" }} className="mt-1 text-xl">{product.name}</h3>
                  <p className="mt-1 text-sm">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                    {hasDiscount && (
                      <span className="ml-2 text-[#1c1712]/40 line-through">
                        ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* BRAND + HANDMADE STORY */}
        <section className="bg-[#1c1712] py-24 text-[#f7f2e7]">
          <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-14 px-6 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d4a94a]">Our Story</p>
              <p style={{ fontFamily: "'Italiana', serif" }} className="text-3xl leading-snug sm:text-4xl">
                A brand built from a workbench, not a warehouse.
              </p>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d4a94a]">Made By Hand</p>
              <p className="text-sm leading-7 text-[#f7f2e7]/70">
                Every piece here is designed, made and finished by hand —
                string art strung nail by nail, candles poured and trimmed
                one at a time, telescopes assembled on the same bench as
                everything else. Nothing here comes off a line.
              </p>
            </div>
          </div>
        </section>

        {/* WHY SUDOWORLD */}
        <section className="mx-auto max-w-[1360px] px-6 py-24">
          <p className="mb-14 text-center text-xs uppercase tracking-[0.24em] text-[#d4a94a]">Why SudoWorld</p>
          <div className="grid grid-cols-1 divide-y divide-[#1c1712]/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              ['Handmade With Care', 'Every creation made with attention to detail.'],
              ['Unique Designs', 'Nothing here is mass-produced.'],
              ['Creative & Original', 'Made for people who love imagination.'],
              ['Made With Passion', "A piece of the maker, in every object."],
            ].map(([t, d]) => (
              <div key={t} className="px-0 py-6 sm:px-8 sm:py-0">
                <h3 style={{ fontFamily: "'Italiana', serif" }} className="mb-2 text-xl">{t}</h3>
                <p className="text-sm leading-6 text-[#1c1712]/60">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#1c1712]/10 py-24 text-center">
          <p style={{ fontFamily: "'Italiana', serif" }} className="mb-2 text-3xl sm:text-4xl">Create Something Beautiful.</p>
          <p style={{ fontFamily: "'Italiana', serif" }} className="mb-9 text-3xl text-[#d4a94a] sm:text-4xl">Discover Something Extraordinary.</p>
          <Link href="/shop" className="inline-block border border-[#1c1712] px-10 py-3.5 text-xs uppercase tracking-[0.16em] transition hover:bg-[#1c1712] hover:text-[#f7f2e7]">
            Shop All Products
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#1c1712]/10 bg-white/50 py-14 text-center">
          <p style={{ fontFamily: "'Italiana', serif" }} className="text-xl">SudoWorld</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#1c1712]/50">Handmade. Creative. Unique.</p>
          <p className="mt-8 text-[10px] text-[#1c1712]/35">© {new Date().getFullYear()} SudoWorld</p>
        </footer>
      </div>

      {lightbox && <ImageLightbox images={[lightbox]} onClose={() => setLightbox(null)} />}
    </>
  )
}
