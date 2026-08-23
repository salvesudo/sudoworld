'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { ImageLightbox } from '@/components/ImageLightbox'

export type ProductImage = {
  image_url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
}

export type Product = {
  id: number
  name: string
  slug: string
  short_description: string | null
  price: number
  compare_at_price?: number | null
  stock_quantity: number
  is_handmade: boolean
  is_customizable: boolean
  is_diy: boolean
  is_featured: boolean
  categories: {
    name: string
  } | null
  product_images: ProductImage[]
}

export function getPrimaryImage(product: Product): ProductImage | null {
  if (!product.product_images || product.product_images.length === 0) {
    return null
  }

  const primary = product.product_images.find((img) => img.is_primary)
  if (primary) return primary

  // No image explicitly marked primary — fall back to display order.
  return [...product.product_images].sort(
    (a, b) => a.display_order - b.display_order
  )[0]
}

// A branded fallback (gradient + SudoWorld mark) for products with no
// image yet, instead of a blank box — matches the storefront's warm
// palette so an unphotographed product still looks intentional.
function ProductImageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-beige to-cream-dark">
      <div className="text-center text-charcoal-soft">
        <div className="font-display text-3xl">✦</div>
        <p className="mt-2 text-xs uppercase tracking-widest">SudoWorld</p>
      </div>
    </div>
  )
}

export function ProductCard({
  product,
  showCategory = true,
}: {
  product: Product
  showCategory?: boolean
}) {
  const primaryImage = getPrimaryImage(product)
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasDiscount =
    product.compare_at_price != null &&
    Number(product.compare_at_price) > Number(product.price)

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        imageUrl: primaryImage?.image_url ?? null,
        stockQuantity: product.stock_quantity,
      },
      1
    )

    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-charcoal/10 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      {primaryImage ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View full image of ${product.name}`}
          className="relative block h-72 w-full overflow-hidden bg-cream-dark"
        >
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="rounded-full bg-charcoal px-3 py-1 text-xs font-medium text-cream">
                Featured
              </span>
            )}

            {hasDiscount && (
              <span className="rounded-full bg-terracotta px-3 py-1 text-xs font-medium text-cream">
                Sale
              </span>
            )}
          </div>

          {/* Zoom affordance, visible on hover */}
          <div className="absolute bottom-3 right-3 rounded-full bg-charcoal/70 p-2 text-cream opacity-0 backdrop-blur transition group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M10.5 8v5M8 10.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        </button>
      ) : (
        <Link
          href={`/product/${product.slug}`}
          className="relative block h-72 overflow-hidden bg-cream-dark"
        >
          <ProductImageFallback />
        </Link>
      )}

      {lightboxOpen && primaryImage && (
        <ImageLightbox
          src={primaryImage.image_url}
          alt={primaryImage.alt_text || product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Product information */}
      <div className="p-6">
        {showCategory && product.categories && (
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            {product.categories.name}
          </p>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-2 font-display text-xl font-medium text-charcoal hover:underline">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 min-h-12 text-sm leading-6 text-charcoal-soft">
          {product.short_description}
        </p>

        {/* Product badges */}
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
        </div>

        {/* Price */}
        <div className="mt-5 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-charcoal">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          {hasDiscount && (
            <p className="text-sm text-charcoal-soft line-through">
              ₹{Number(product.compare_at_price).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <p className="mt-1 text-xs text-charcoal-soft">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} available`
            : 'Out of stock'}
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 rounded-full border border-charcoal/20 px-4 py-2.5 text-center text-sm font-medium text-charcoal transition hover:border-charcoal/40 hover:bg-cream-dark"
          >
            View Product
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="flex-1 rounded-full bg-charcoal px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-terracotta disabled:cursor-not-allowed disabled:bg-charcoal/30"
          >
            {justAdded ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
