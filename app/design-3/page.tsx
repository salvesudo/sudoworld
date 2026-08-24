'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DesignConceptBar } from '@/components/DesignConceptBar'
import { ImageLightbox } from '@/components/ImageLightbox'
import { fetchStorefrontData, REAL_CANDLE_IMAGE_URL, type StorefrontCategory } from '@/lib/storefront-data'
import type { Product } from '@/components/ProductCard'

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,450;0,9..144,600;1,9..144,500&family=Karla:wght@400;500;600;700&display=swap'

function Medallion({ tone = '#a15a30' }: { tone?: string }) {
  const n = 140
  const skip = 53
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
      <g stroke={tone} strokeWidth="0.16" opacity="0.6">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}

export default function Design3Page() {
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

      <div style={{ fontFamily: "'Karla', sans-serif" }} className="bg-[#f8f1e6] text-[#3a2e22]">
        <DesignConceptBar number="03" name="Warm Artisan Boutique" />

        {/* NAV */}
        <header className="border-b border-[#3a2e22]/10 bg-[#f8f1e6]">
          <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5">
            <span style={{ fontFamily: "'Fraunces', serif" }} className="text-xl font-semibold">SudoWorld</span>
            <nav className="hidden gap-8 text-sm font-medium md:flex">
              {['Shop', 'Categories', 'About', 'Contact'].map((l) => (
                <Link
                  key={l}
                  href={l === 'Shop' ? '/shop' : l === 'Categories' ? '/#craft' : `/${l.toLowerCase()}`}
                  className="border-b-2 border-transparent pb-1 transition hover:border-[#a15a30]"
                >
                  {l}
                </Link>
              ))}
            </nav>
            <Link href="/cart" className="rounded-full bg-[#3a2e22] px-4 py-2 text-xs font-semibold text-[#f8f1e6]">Cart</Link>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#c98b4a]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#7d8f5f]/20 blur-3xl" />
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#a15a30]">Handmade. Creative. Unique.</p>
              <h1 style={{ fontFamily: "'Fraunces', serif" }} className="mb-6 text-5xl font-medium leading-[1.05] lg:text-6xl">
                Made by hand, in a room that smells like wood and wax.
              </h1>
              <p className="mb-9 max-w-md text-base leading-7 text-[#3a2e22]/70">
                String art, candles and telescopes — every piece shaped by
                someone who cared how it turned out.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="rounded-full bg-[#a15a30] px-8 py-3.5 text-sm font-semibold text-[#f8f1e6] transition hover:bg-[#8a4a26]">
                  Shop the Collection
                </Link>
                <Link href="#made-by-hand" className="rounded-full border-2 border-[#3a2e22]/20 px-8 py-3.5 text-sm font-semibold transition hover:border-[#3a2e22]">
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-[2rem] bg-[#eaddc4] lg:h-[26rem]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(100deg, rgba(161,90,48,0.06) 0 3px, transparent 3px 22px)'
              }} />
              <div className="absolute inset-0 p-14">
                <Medallion />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY DISCOVERY */}
        <section id="craft" className="mx-auto max-w-[1320px] px-6 py-24">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a15a30]">The Workshop</p>
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-14 max-w-lg text-4xl font-medium">
            Three crafts, one workshop.
          </h2>

          {loading && <p className="text-sm text-[#3a2e22]/50">Loading collections…</p>}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {categories.map((cat, i) => {
              const isCandle = cat.name.toLowerCase().includes('candle')
              return (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="group overflow-hidden rounded-3xl bg-white/60 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-64 overflow-hidden bg-[#eaddc4]">
                    {isCandle ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={REAL_CANDLE_IMAGE_URL} alt="Lit pillar candles" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full p-10">
                        <Medallion tone={['#a15a30', '#7d8f5f', '#3a2e22'][i % 3]} />
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <h3 style={{ fontFamily: "'Fraunces', serif" }} className="mb-2 text-2xl font-medium">{cat.name}</h3>
                    <p className="mb-4 text-sm leading-6 text-[#3a2e22]/65">
                      {cat.description ||
                        (cat.name.toLowerCase().includes('string')
                          ? 'Handcrafted patterns created thread by thread.'
                          : isCandle
                            ? 'Sculptural candles designed to bring art into everyday spaces.'
                            : 'Build, explore and discover the night sky.')}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#a15a30]">
                      Explore <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* MADE BY HAND — storytelling */}
        <section id="made-by-hand" className="bg-[#3a2e22] py-24 text-[#f8f1e6]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#c98b4a]">Made By Hand</p>
              <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-6 text-4xl font-medium leading-tight">
                No factories. No shortcuts.
              </h2>
              <p className="mb-6 max-w-md text-sm leading-7 text-[#f8f1e6]/70">
                Every string art panel is strung nail by nail. Every candle
                is poured and trimmed by hand. Every telescope is finished
                on a workbench, not an assembly line — because that&apos;s
                the only way we know how to make things.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-2">
                {[
                  ['01', 'Design'],
                  ['02', 'Craft'],
                  ['03', 'Deliver'],
                ].map(([n, t]) => (
                  <div key={n}>
                    <p style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl text-[#c98b4a]">{n}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#f8f1e6]/60">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-[2rem] bg-[#4a3b2c] lg:h-96">
              <div className="absolute inset-0 p-14 opacity-80">
                <Medallion tone="#c98b4a" />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="mx-auto max-w-[1320px] px-6 py-24">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a15a30]">Featured</p>
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-14 max-w-lg text-4xl font-medium">
            Fresh off the workbench.
          </h2>

          {!loading && showcase.length === 0 && <p className="text-sm text-[#3a2e22]/50">No products available yet.</p>}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((product) => {
              const primary = product.product_images?.find((im) => im.is_primary) || product.product_images?.[0]
              const hasDiscount = product.compare_at_price != null && product.compare_at_price > product.price
              return (
                <div key={product.id} className="group overflow-hidden rounded-3xl bg-white/60 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <button
                    type="button"
                    onClick={() => primary && setLightbox({ src: primary.image_url, alt: primary.alt_text || product.name })}
                    className="relative block h-64 w-full overflow-hidden bg-[#eaddc4] text-left"
                  >
                    {primary ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={primary.image_url} alt={primary.alt_text || product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-10">
                        <Medallion />
                      </div>
                    )}
                    <span className="absolute inset-x-4 bottom-4 rounded-full bg-white/90 px-4 py-2 text-center text-xs font-semibold opacity-0 transition group-hover:opacity-100">
                      View Product
                    </span>
                  </button>
                  <div className="p-6">
                    {product.categories && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a15a30]">{product.categories.name}</p>
                    )}
                    <h3 style={{ fontFamily: "'Fraunces', serif" }} className="mb-2 text-xl font-medium">{product.name}</h3>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {product.is_handmade && <span className="rounded-full bg-[#eaddc4] px-2.5 py-0.5 text-[10px]">Handmade</span>}
                      {product.is_customizable && <span className="rounded-full bg-[#eaddc4] px-2.5 py-0.5 text-[10px]">Customizable</span>}
                      {product.is_diy && <span className="rounded-full bg-[#eaddc4] px-2.5 py-0.5 text-[10px]">DIY</span>}
                    </div>
                    <p className="text-lg font-bold">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                      {hasDiscount && (
                        <span className="ml-2 text-sm font-normal text-[#3a2e22]/40 line-through">
                          ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* TELESCOPE SECTION (warm-toned, not dark) */}
        <section className="bg-[#eaddc4] py-24">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <div className="relative h-72 overflow-hidden rounded-[2rem] bg-[#3a2e22] lg:h-96">
              <div className="absolute inset-0 p-14 opacity-70">
                <Medallion tone="#c98b4a" />
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#a15a30]">Built By Hand</p>
              <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-6 text-4xl font-medium leading-tight">
                Telescopes with a maker&apos;s touch.
              </h2>
              <p className="mb-8 max-w-md text-sm leading-7 text-[#3a2e22]/70">
                Even our telescopes are finished on the same bench as
                everything else — same care, same patience.
              </p>
              <Link href="/category/diy-telescope" className="inline-block rounded-full bg-[#3a2e22] px-8 py-3 text-sm font-semibold text-[#f8f1e6] transition hover:bg-[#2a2018]">
                View Telescopes
              </Link>
            </div>
          </div>
        </section>

        {/* WHY SUDOWORLD */}
        <section className="mx-auto max-w-[1320px] px-6 py-24">
          <p className="mb-14 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#a15a30]">Why SudoWorld</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Handmade With Care', 'Every creation made with attention to detail.'],
              ['Unique Designs', 'Nothing here is mass-produced.'],
              ['Creative & Original', 'Made for people who love imagination.'],
              ['Made With Passion', "A piece of the maker, in every object."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/60 p-6">
                <h3 style={{ fontFamily: "'Fraunces', serif" }} className="mb-2 text-lg font-medium">{t}</h3>
                <p className="text-sm leading-6 text-[#3a2e22]/65">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="mb-8 text-4xl font-medium">
            Come see what&apos;s on the bench.
          </h2>
          <Link href="/shop" className="inline-block rounded-full bg-[#a15a30] px-10 py-3.5 text-sm font-semibold text-[#f8f1e6] transition hover:bg-[#8a4a26]">
            Shop All Products
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#3a2e22]/10 bg-[#eaddc4] py-14 text-center">
          <p style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-medium">SudoWorld</p>
          <p className="mt-2 text-sm text-[#3a2e22]/60">Handmade. Creative. Unique.</p>
          <p className="mt-8 text-xs text-[#3a2e22]/40">© {new Date().getFullYear()} SudoWorld</p>
        </footer>
      </div>

      {lightbox && <ImageLightbox images={[lightbox]} onClose={() => setLightbox(null)} />}
    </>
  )
}
