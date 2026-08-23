'use client'

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

export function ProductCard({
  product,
  showCategory = true,
}: {
  product: Product
  showCategory?: boolean
}) {
  const primaryImage = getPrimaryImage(product)

  return (
    <article className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-72 bg-gray-100">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 items-center justify-center text-center text-gray-400">
            <div>
              <div className="text-5xl">✦</div>
              <p className="mt-3 text-sm">Product Image</p>
            </div>
          </div>
        )}

        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </div>

      {/* Product information */}
      <div className="p-6">
        {showCategory && product.categories && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {product.categories.name}
          </p>
        )}

        <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>

        <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">
          {product.short_description}
        </p>

        {/* Product badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {product.is_handmade && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
              Handmade
            </span>
          )}

          {product.is_customizable && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
              Customizable
            </span>
          )}

          {product.is_diy && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
              DIY
            </span>
          )}
        </div>

        {/* Price and button */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {product.stock_quantity > 0
                ? `${product.stock_quantity} available`
                : 'Out of stock'}
            </p>
          </div>

          <button
            disabled={product.stock_quantity <= 0}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}
