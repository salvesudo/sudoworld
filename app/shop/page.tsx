'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CosmicHeader } from '@/components/CosmicHeader'
import { CosmicFooter } from '@/components/CosmicFooter'
import { SectionHeading } from '@/components/SectionHeading'
import { ProductCard, type Product } from '@/components/ProductCard'

function ShopContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id, name, slug, short_description, price, compare_at_price,
          stock_quantity, is_handmade, is_customizable, is_diy, is_featured,
          categories ( name ),
          product_images ( image_url, alt_text, is_primary, display_order )
        `
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setProducts((data ?? []) as unknown as Product[])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return products

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.short_description ?? '').toLowerCase().includes(term) ||
        (product.categories?.name ?? '').toLowerCase().includes(term)
    )
  }, [products, query])

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <SectionHeading
        eyebrow="SudoWorld Collection"
        title={query ? `Results for "${query}"` : 'All Products'}
        subtitle="Every piece here is handmade and comes directly from the workshop."
      />

      {loading && (
        <div className="py-16 text-center text-charcoal-soft">
          Loading products...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-[#e14b2e]/30 bg-[#2a1015] p-6 text-[#f0a58c]">
          <p className="font-semibold">Unable to load products</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="py-16 text-center text-charcoal-soft">
          {query
            ? `No products match "${query}".`
            : 'No products available yet.'}
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-cream text-charcoal font-mono">
      <CosmicHeader />

      <Suspense
        fallback={
          <div className="py-24 text-center text-charcoal-soft">
            Loading...
          </div>
        }
      >
        <ShopContent />
      </Suspense>

      <CosmicFooter />
    </main>
  )
}
