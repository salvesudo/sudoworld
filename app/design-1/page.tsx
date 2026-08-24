'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DesignConceptBar } from '@/components/DesignConceptBar'
import { ImageLightbox } from '@/components/ImageLightbox'
import { fetchStorefrontData, type StorefrontCategory } from '@/lib/storefront-data'
import type { Product } from '@/components/ProductCard'

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500&family=Work+Sans:wght@400;500;600&display=swap'

function GalleryMedallion({ tone = '#a8823d' }: { tone?: string }) {
  // Deterministic curve-stitched medallion — same real construction used
  // elsewhere: points around a circle, connected in a fixed skip pattern.
  const n = 160
  const skip = 63
  const paths: string[] = []
  for (let k = 0; k < n; k++) {
    const j = (k * skip) % n
    const a1 = (k / n) * Math.PI * 2 - Math.PI / 2
    const a2 = (j / n) * Math.PI * 2 - Math.PI / 2
    // Coordinates rounded before embedding: Math.cos/sin aren't required by
    // spec to be bit-identical across JS engines, and Node (SSR) vs Chromium
    // (client) can differ by 1 ULP — invisible to the eye but enough to fail
    // React's hydration string comparison. Rounding removes that noise.
    paths.push(
      `M ${(50 + 46 * Math.cos(a1)).toFixed(3)} ${(50 + 46 * Math.sin(a1)).toFixed(3)} L ${(50 + 46 * Math.cos(a2)).toFixed(3)} ${(50 + 46 * Math.sin(a2)).toFixed(3)}`
    )
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g stroke={tone} strokeWidth="0.12" opacity="0.55">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}

export default function Design1Page() {
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
  const exhibits = (featured.length > 0 ? featured : products).slice(0, 6)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONTS_HREF} rel="stylesheet" />

      <div style={{ fontFamily: "'Work Sans', sans-serif" }} className="bg-[#faf8f3] text-[#221f1a]">
        <DesignConceptBar number="01" name="Luxury Art Gallery" />

        {/* NAV */}
        <header className="border-b border-black/10">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-6">
            <span className="text-xs font-medium uppercase tracking-[0.28em]">SudoWorld</span>
            <nav className="hidden gap-10 text-xs font-medium uppercase tracking-[0.18em] text-[#221f1a]/70 md:flex">
              <Link href="/shop" className="hover:text-[#a8823d]">Shop</Link>
              <Link href="/#collections" className="hover:text-[#a8823d]">Collections</Link>
              <Link href="/about" className="hover:text-[#a8823d]">About</Link>
              <Link href="/contact" className="hover:text-[#a8823d]">Contact</Link>
            </nav>
            <Link href="/cart" className="text-xs font-medium uppercase tracking-[0.18em]">Cart</Link>
          </div>
        </header>

        {/* HERO — editorial split, not centered */}
        <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch lg:grid-cols-[1.15fr_1fr]">
          <div className="relative h-[380px] bg-[#efe9dc] lg:h-auto lg:min-h-[560px]">
            <div className="absolute inset-0 p-10 lg:p-16">
              <GalleryMedallion tone="#8a6a2e" />
            </div>
            <p className="absolute bottom-6 left-8 text-[10px] uppercase tracking-[0.2em] text-[#221f1a]/50">
              Fig. 01 — String Art, hand-strung
            </p>
          </div>
          <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">
              SudoWorld — Handmade. Creative. Unique.
            </p>
            <h1
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="mb-6 text-5xl font-medium italic leading-[1.05] tracking-tight lg:text-7xl"
            >
              Objects Made<br />With Imagination.
            </h1>
            <p className="mb-9 max-w-md text-base leading-7 text-[#221f1a]/70">
              Handmade creations, artistic objects and curious things worth
              discovering.
            </p>
            <Link
              href="/shop"
              className="inline-block w-fit border border-[#221f1a] px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] transition hover:bg-[#221f1a] hover:text-[#faf8f3]"
            >
              Enter the Collection
            </Link>
          </div>
        </section>

        {/* CATEGORY DISCOVERY */}
        <section id="collections" className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">The Collections</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-14 max-w-lg text-4xl italic leading-tight lg:text-5xl">
            Three crafts, each its own discipline.
          </h2>

          {loading && <p className="text-sm text-[#221f1a]/50">Loading collections…</p>}

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
                <div className="relative mb-6 h-72 overflow-hidden bg-[#efe9dc]">
                  <div className="h-full w-full p-8 transition duration-700 group-hover:scale-105">
                    <GalleryMedallion tone={['#8a6a2e', '#5a4530', '#3c3629'][i % 3]} />
                  </div>
                </div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#221f1a]/50">
                  Exhibit 0{i + 1}
                </p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-2 text-2xl italic">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mb-3 text-sm leading-6 text-[#221f1a]/60">{cat.description}</p>
                )}
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#a8823d] underline-offset-4 group-hover:underline">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS — "Exhibits" */}
        <section className="border-y border-black/10 bg-[#f3efe4]">
          <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">Current Exhibits</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-14 max-w-lg text-4xl italic leading-tight lg:text-5xl">
              Selected pieces, on view now.
            </h2>

            {!loading && exhibits.length === 0 && (
              <p className="text-sm text-[#221f1a]/50">No products available yet.</p>
            )}

            <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {exhibits.map((product) => {
                const primary =
                  product.product_images?.find((im) => im.is_primary) ||
                  product.product_images?.[0]
                return (
                  <div key={product.id}>
                    <button
                      type="button"
                      onClick={() =>
                        primary &&
                        setLightbox({ src: primary.image_url, alt: primary.alt_text || product.name })
                      }
                      className="group relative mb-5 block h-80 w-full overflow-hidden bg-[#e5deca] text-left"
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
                          <GalleryMedallion tone="#8a6a2e" />
                        </div>
                      )}
                      <span className="absolute bottom-4 left-4 rounded-none bg-[#faf8f3]/95 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] opacity-0 transition group-hover:opacity-100">
                        View Product
                      </span>
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#221f1a]/45">
                      {product.categories?.name}
                      {product.is_handmade ? ' · Handmade' : ''}
                    </p>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mt-1 text-xl italic">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#221f1a]/70">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="ml-2 text-[#221f1a]/35 line-through">
                          ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* BRAND STORY */}
        <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-8 py-24 lg:grid-cols-[1fr_1.3fr] lg:px-16">
          <div className="h-64 bg-[#efe9dc] p-10 lg:h-auto">
            <GalleryMedallion tone="#3c3629" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">A Study In Making</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl italic leading-snug lg:text-4xl">
              &ldquo;Every object here begins the same way — an idea, raw
              material, and the patience to see it through by hand, not by
              machine.&rdquo;
            </p>
          </div>
        </section>

        {/* THE PROCESS (handmade story) */}
        <section className="border-t border-black/10 bg-[#f3efe4]">
          <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16">
            <p className="mb-14 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">The Process</p>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
              {[
                ['01', 'Design', 'Every piece starts as a sketch worth chasing.'],
                ['02', 'Craft', 'Made by hand, one at a time, with real materials.'],
                ['03', 'Deliver', 'Carefully packed and sent from the workshop.'],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-3 text-3xl italic text-[#a8823d]">{n}</p>
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.15em]">{t}</h3>
                  <p className="text-sm leading-6 text-[#221f1a]/60">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COSMIC / TELESCOPE — the gallery's one dark room */}
        <section className="bg-[#141210] text-[#f3efe4]">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-8 py-24 lg:grid-cols-2 lg:px-16">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">A Room For Looking Up</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-6 text-4xl italic leading-tight lg:text-5xl">
                Telescopes, built for wonder.
              </h2>
              <p className="mb-8 max-w-md text-sm leading-7 text-[#f3efe4]/60">
                Precision instruments, assembled and finished by hand — for
                anyone who still looks up.
              </p>
              <Link
                href="/category/diy-telescope"
                className="inline-block w-fit border border-[#f3efe4]/40 px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] transition hover:bg-[#f3efe4] hover:text-[#141210]"
              >
                View Telescopes
              </Link>
            </div>
            <div className="relative h-72 overflow-hidden rounded-sm lg:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images-assets.nasa.gov/image/iss072e618284/iss072e618284~large.jpg"
                alt="The Moon — a real NASA photograph showing craters and maria in detail, public domain"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* WHY SUDOWORLD */}
        <section className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16">
          <p className="mb-14 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">Why Collect With Us</p>
          <div className="grid grid-cols-1 divide-y divide-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              ['Handmade With Care', 'Every piece made with attention to detail.'],
              ['Unique Designs', 'Nothing here is mass-produced.'],
              ['Creative & Original', 'Made for people who value imagination.'],
              ['Made With Passion', 'A little of the maker in every object.'],
            ].map(([t, d]) => (
              <div key={t} className="px-0 py-8 sm:px-8 sm:py-0">
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-2 text-xl italic">{t}</h3>
                <p className="text-sm leading-6 text-[#221f1a]/60">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/10 py-24 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[#a8823d]">Begin</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="mb-8 text-4xl italic lg:text-5xl">
            Begin your collection.
          </h2>
          <Link
            href="/shop"
            className="inline-block border border-[#221f1a] px-10 py-3.5 text-xs font-medium uppercase tracking-[0.18em] transition hover:bg-[#221f1a] hover:text-[#faf8f3]"
          >
            Shop All Products
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black/10 bg-[#f3efe4]">
          <div className="mx-auto max-w-[1400px] px-8 py-14 text-center lg:px-16">
            <p className="text-xs font-medium uppercase tracking-[0.22em]">SudoWorld</p>
            <p className="mt-2 text-xs text-[#221f1a]/50">Handmade. Creative. Unique.</p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.15em] text-[#221f1a]/35">
              © {new Date().getFullYear()} SudoWorld
            </p>
          </div>
        </footer>
      </div>

      {lightbox && (
        <ImageLightbox
          images={[lightbox]}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
