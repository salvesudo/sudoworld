'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DesignConceptBar } from '@/components/DesignConceptBar'
import { ImageLightbox } from '@/components/ImageLightbox'
import { fetchStorefrontData, REAL_CANDLE_IMAGE_URL, type StorefrontCategory } from '@/lib/storefront-data'
import type { Product } from '@/components/ProductCard'

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap'

function Medallion({ tone = '#111' }: { tone?: string }) {
  const n = 200
  const skip = 67
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
      <g stroke={tone} strokeWidth="0.13" opacity="0.85">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}

export default function Design4Page() {
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

  const featured = products.filter((p) => p.is_featured).slice(0, 5)
  const showcase = (featured.length > 0 ? featured : products).slice(0, 5)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONTS_HREF} rel="stylesheet" />

      <div style={{ fontFamily: "'Archivo', sans-serif" }} className="bg-[#f2f2ee] text-[#0d0d0d]">
        <DesignConceptBar number="04" name="Modern Creative Studio" />

        {/* NAV — unconventional, asymmetric */}
        <header className="flex items-start justify-between px-6 pt-8 sm:px-10">
          <span style={{ fontFamily: "'Archivo Black', sans-serif" }} className="text-2xl">SW</span>
          <nav className="flex flex-col items-end gap-1 text-right text-xs font-bold uppercase tracking-[0.1em]">
            <Link href="/shop" className="hover:text-[#e14b2e]">Shop</Link>
            <Link href="/#studio" className="hover:text-[#e14b2e]">Categories</Link>
            <Link href="/about" className="hover:text-[#e14b2e]">Studio</Link>
            <Link href="/cart" className="hover:text-[#e14b2e]">Cart</Link>
          </nav>
        </header>

        {/* HERO — huge stacked type, overlapping image tiles */}
        <section className="relative overflow-hidden px-6 pb-28 pt-10 sm:px-10">
          <h1
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
            className="select-none leading-[0.82] tracking-tight text-[16vw] sm:text-[13vw] lg:text-[11vw]"
          >
            MAKE.
            <br />
            <span className="text-[#e14b2e]">CREATE.</span>
            <br />
            EXPLORE.
          </h1>

          {/* Overlapping tiles: desktop-only composition. At mobile widths
              the same tiles sit right on top of the (much narrower) text
              column and hide letters instead of decorating an edge — an
              intentional mobile treatment removes them here rather than
              just shrinking the desktop version, and shows them plainly
              below the CTA instead. */}
          <div className="pointer-events-none absolute right-16 top-24 hidden h-48 w-48 rotate-6 overflow-hidden rounded-sm bg-white shadow-xl sm:block">
            <div className="h-full w-full p-6">
              <Medallion tone="#e14b2e" />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-10 hidden h-40 w-40 -rotate-3 overflow-hidden rounded-sm shadow-xl sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover" />
          </div>

          <p className="relative z-10 mt-10 max-w-sm text-sm font-medium leading-6 text-[#0d0d0d]/70">
            SudoWorld — handmade. creative. unique. String art, candles and
            telescopes, made and finished by hand.
          </p>
          <Link
            href="/shop"
            className="relative z-10 mt-6 inline-block bg-[#0d0d0d] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#e14b2e]"
          >
            See the work →
          </Link>

          <div className="relative z-10 mt-8 flex gap-3 sm:hidden">
            <div className="h-20 w-20 overflow-hidden rounded-sm bg-white p-3 shadow-md">
              <Medallion tone="#e14b2e" />
            </div>
            <div className="h-20 w-20 overflow-hidden rounded-sm shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        {/* CATEGORY DISCOVERY — staggered, unequal grid */}
        <section id="studio" className="border-t-4 border-[#0d0d0d] px-6 py-20 sm:px-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#e14b2e]">The Categories</p>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-12 text-4xl sm:text-5xl">
            Three disciplines.
          </h2>

          {loading && <p className="text-sm text-[#0d0d0d]/50">Loading…</p>}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            {categories.map((cat, i) => {
              const isCandle = cat.name.toLowerCase().includes('candle')
              const span = i === 0 ? 'sm:col-span-4' : 'sm:col-span-2'
              const height = i === 0 ? 'h-80' : 'h-64'
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`group relative overflow-hidden bg-[#0d0d0d] text-white ${span} ${height} ${i % 2 === 1 ? 'sm:mt-10' : ''}`}
                >
                  {isCandle ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                  ) : (
                    <div className="h-full w-full p-10 opacity-80 transition duration-500 group-hover:scale-105">
                      <Medallion tone="#f2f2ee" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="text-2xl">{cat.name}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#e14b2e]">Explore →</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* FEATURED PRODUCTS — presented as artwork */}
        <section className="border-t-4 border-[#0d0d0d] bg-white px-6 py-20 sm:px-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#e14b2e]">Selected Work</p>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-12 text-4xl sm:text-5xl">
            Objects, not products.
          </h2>

          {!loading && showcase.length === 0 && <p className="text-sm text-[#0d0d0d]/50">No products available yet.</p>}

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((product, i) => {
              const primary = product.product_images?.find((im) => im.is_primary) || product.product_images?.[0]
              const hasDiscount = product.compare_at_price != null && product.compare_at_price > product.price
              return (
                <div key={product.id} className={i % 3 === 1 ? 'sm:mt-12' : ''}>
                  <button
                    type="button"
                    onClick={() => primary && setLightbox({ src: primary.image_url, alt: primary.alt_text || product.name })}
                    className="group relative mb-4 block h-80 w-full overflow-hidden bg-[#f2f2ee] text-left"
                  >
                    {primary ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={primary.image_url} alt={primary.alt_text || product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-12">
                        <Medallion />
                      </div>
                    )}
                    <span className="absolute bottom-4 left-4 bg-[#0d0d0d] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white opacity-0 transition group-hover:opacity-100">
                      View Product
                    </span>
                  </button>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#e14b2e]">
                    {product.categories?.name}
                  </p>
                  <h3 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mt-1 text-xl">{product.name}</h3>
                  <p className="mt-1 text-sm font-semibold">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                    {hasDiscount && (
                      <span className="ml-2 text-xs font-normal text-[#0d0d0d]/40 line-through">
                        ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* BRAND / HANDMADE STORY */}
        <section className="border-t-4 border-[#0d0d0d] bg-[#0d0d0d] px-6 py-24 text-white sm:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr]">
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="text-4xl leading-[1.05] sm:text-5xl">
              This is a studio.<br />It just also sells things.
            </h2>
            <p className="self-end text-sm leading-7 text-white/60">
              No factory line, no template. Every piece here starts as an
              idea on a workbench and ends up in your hands the same way —
              made, not manufactured.
            </p>
          </div>
        </section>

        {/* TELESCOPE — precision instrument framing */}
        <section className="border-t-4 border-[#0d0d0d] bg-white px-6 py-20 sm:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#e14b2e]">Precision Instrument</p>
              <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-6 text-4xl sm:text-5xl">
                Built to look up.
              </h2>
              <p className="mb-8 max-w-md text-sm leading-7 text-[#0d0d0d]/70">
                Our telescopes aren&apos;t toys — precision instruments,
                finished by hand for anyone who wants to look further.
              </p>
              <Link href="/category/diy-telescope" className="inline-block bg-[#0d0d0d] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#e14b2e]">
                View Telescopes
              </Link>
            </div>
            <div className="order-1 h-72 bg-[#0d0d0d] p-14 lg:order-2 lg:h-96">
              <Medallion tone="#f2f2ee" />
            </div>
          </div>
        </section>

        {/* WHY SUDOWORLD */}
        <section className="border-t-4 border-[#0d0d0d] px-6 py-20 sm:px-10">
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-12 text-4xl sm:text-5xl">Why SudoWorld.</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Handmade', 'Made with real attention to detail.'],
              ['Unique', 'Nothing here is mass-produced.'],
              ['Original', 'Made for people who love imagination.'],
              ['Passionate', "A piece of the maker in every object."],
            ].map(([t, d]) => (
              <div key={t} className="border-t-4 border-[#0d0d0d] pt-4">
                <h3 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-2 text-lg">{t}</h3>
                <p className="text-sm leading-6 text-[#0d0d0d]/60">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t-4 border-[#0d0d0d] bg-[#e14b2e] px-6 py-24 text-white sm:px-10">
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif" }} className="mb-8 max-w-lg text-4xl leading-tight sm:text-5xl">
            Go see what&apos;s being made.
          </h2>
          <Link href="/shop" className="inline-block bg-[#0d0d0d] px-10 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-[#0d0d0d]">
            Shop All Products
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#0d0d0d] px-6 py-14 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <span style={{ fontFamily: "'Archivo Black', sans-serif" }} className="text-2xl">SudoWorld</span>
            <p className="text-xs text-white/50">© {new Date().getFullYear()} — Handmade. Creative. Unique.</p>
          </div>
        </footer>
      </div>

      {lightbox && <ImageLightbox images={[lightbox]} onClose={() => setLightbox(null)} />}
    </>
  )
}
