'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { useCart } from '@/components/CartProvider'
import { ImageLightbox } from '@/components/ImageLightbox'
import type { ProductImage } from '@/components/ProductCard'

type ProductDetail = {
  id: number
  name: string
  slug: string
  short_description: string | null
  description: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  is_handmade: boolean
  is_customizable: boolean
  is_diy: boolean
  is_featured: boolean
  specifications: Record<string, string> | null
  categories: { name: string; slug: string } | null
  product_images: ProductImage[]
}

function sortImages(images: ProductImage[]) {
  return [...images].sort((a, b) => a.display_order - b.display_order)
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const { addItem } = useCart()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError('')
      setNotFound(false)

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id, name, slug, short_description, description, price,
          compare_at_price, stock_quantity, is_handmade, is_customizable,
          is_diy, is_featured, specifications,
          categories ( name, slug ),
          product_images ( image_url, alt_text, is_primary, display_order )
        `
        )
        .eq('slug', params.slug)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProduct(data as unknown as ProductDetail)
      setLoading(false)
    }

    if (params.slug) loadProduct()
  }, [params.slug])

  const images = product ? sortImages(product.product_images ?? []) : []
  const activeImage = images[activeImageIndex]
  const hasDiscount =
    product?.compare_at_price != null &&
    Number(product.compare_at_price) > Number(product.price)

  function handleAddToCart() {
    if (!product) return

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        imageUrl: images[0]?.image_url ?? null,
        stockQuantity: product.stock_quantity,
      },
      1
    )

    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  const specEntries = product?.specifications
    ? Object.entries(product.specifications)
    : []

  return (
    <main className="min-h-screen bg-cream text-charcoal">
      <SiteHeader />

      {loading && (
        <div className="py-24 text-center text-charcoal-soft">
          Loading...
        </div>
      )}

      {!loading && notFound && (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-display text-2xl font-medium">
            Product not found
          </p>
          <p className="mt-2 text-charcoal-soft">
            We couldn&apos;t find that product.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream hover:bg-terracotta"
          >
            Back to Shop
          </Link>
        </div>
      )}

      {!loading && !notFound && error && (
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="rounded-2xl border border-terracotta/30 bg-terracotta-light p-6 text-terracotta-dark">
            <p className="font-semibold">Unable to load this product</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !notFound && !error && product && (
        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <nav className="mb-8 text-sm text-charcoal-soft">
            <Link href="/shop" className="hover:text-terracotta">
              Shop
            </Link>
            {product.categories && (
              <>
                {' / '}
                <Link
                  href={`/category/${product.categories.slug}`}
                  className="hover:text-terracotta"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            {' / '}
            <span className="text-charcoal">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Gallery */}
            <div>
              {activeImage ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={`View full image of ${product.name}`}
                  className="group relative block h-96 w-full overflow-hidden rounded-3xl bg-cream-dark sm:h-[28rem]"
                >
                  <Image
                    src={activeImage.image_url}
                    alt={activeImage.alt_text || product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={90}
                    className="object-contain"
                    priority
                  />

                  <div className="absolute bottom-4 right-4 rounded-full bg-charcoal/70 p-2.5 text-cream opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M10.5 8v5M8 10.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>
              ) : (
                <div className="relative h-96 overflow-hidden rounded-3xl bg-cream-dark sm:h-[28rem]">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-beige to-cream-dark text-charcoal-soft">
                    <div className="text-center">
                      <div className="font-display text-4xl">✦</div>
                      <p className="mt-2 text-xs uppercase tracking-widest">
                        SudoWorld
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {lightboxOpen && activeImage && (
                <ImageLightbox
                  src={activeImage.image_url}
                  alt={activeImage.alt_text || product.name}
                  onClose={() => setLightboxOpen(false)}
                />
              )}

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.image_url + index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        index === activeImageIndex
                          ? 'border-terracotta'
                          : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={img.alt_text || product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {product.categories && (
                <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                  {product.categories.name}
                </p>
              )}

              <h1 className="mt-2 font-display text-3xl font-medium text-charcoal sm:text-4xl">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="mt-3 text-base leading-7 text-charcoal-soft">
                  {product.short_description}
                </p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-3xl font-bold text-charcoal">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>
                {hasDiscount && (
                  <p className="text-lg text-charcoal-soft line-through">
                    ₹
                    {Number(product.compare_at_price).toLocaleString(
                      'en-IN'
                    )}
                  </p>
                )}
              </div>

              <p className="mt-1 text-sm text-charcoal-soft">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} available`
                  : 'Out of stock'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.is_handmade && (
                  <span className="rounded-full bg-beige px-3 py-1 text-xs text-charcoal-soft">
                    Handmade
                  </span>
                )}
                {product.is_customizable && (
                  <span className="rounded-full bg-beige px-3 py-1 text-xs text-charcoal-soft">
                    Customizable
                  </span>
                )}
                {product.is_diy && (
                  <span className="rounded-full bg-beige px-3 py-1 text-xs text-charcoal-soft">
                    DIY
                  </span>
                )}
                {product.is_featured && (
                  <span className="rounded-full bg-charcoal px-3 py-1 text-xs text-cream">
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="mt-8 w-full rounded-full bg-charcoal px-6 py-3.5 text-sm font-medium text-cream transition hover:bg-terracotta disabled:cursor-not-allowed disabled:bg-charcoal/30 sm:w-auto sm:px-10"
              >
                {justAdded ? 'Added ✓' : 'Add to Cart'}
              </button>

              {product.description && (
                <div className="mt-10 border-t border-charcoal/10 pt-8">
                  <h2 className="font-display text-lg font-medium text-charcoal">
                    Description
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-charcoal-soft">
                    {product.description}
                  </p>
                </div>
              )}

              {specEntries.length > 0 && (
                <div className="mt-8 border-t border-charcoal/10 pt-8">
                  <h2 className="font-display text-lg font-medium text-charcoal">
                    Specifications
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    {specEntries.map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <dt className="text-charcoal-soft">{key}</dt>
                        <dd className="text-right font-medium text-charcoal">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  )
}
