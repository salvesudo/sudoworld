'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CosmicHeader } from '@/components/CosmicHeader'
import { CosmicFooter } from '@/components/CosmicFooter'
import { SectionHeading } from '@/components/SectionHeading'
import { ProductCard, type Product } from '@/components/ProductCard'

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>()

  const [category, setCategory] = useState<Category | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategoryAndProducts() {
      setLoading(true)
      setError('')
      setNotFound(false)

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .maybeSingle()

      if (categoryError) {
        console.error('Supabase error:', categoryError)
        setError(categoryError.message)
        setLoading(false)
        return
      }

      if (!categoryData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCategory(categoryData as Category)

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          short_description,
          price,
          compare_at_price,
          stock_quantity,
          is_handmade,
          is_customizable,
          is_diy,
          is_featured,
          categories (
            name
          ),
          product_images (
            image_url,
            alt_text,
            is_primary,
            display_order
          )
        `
        )
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Supabase error:', productsError)
        setError(productsError.message)
        setLoading(false)
        return
      }

      setProducts((productsData ?? []) as unknown as Product[])
      setLoading(false)
    }

    if (params.slug) {
      loadCategoryAndProducts()
    }
  }, [params.slug])

  return (
    <main className="min-h-screen bg-cream text-charcoal font-mono">
      <CosmicHeader />

      {loading && (
        <div className="py-24 text-center text-charcoal-soft">
          Loading...
        </div>
      )}

      {!loading && notFound && (
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="font-display text-2xl font-medium">
            Category not found
          </p>
          <p className="mt-2 text-charcoal-soft">
            We couldn&apos;t find that category.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-cream hover:bg-terracotta-dark"
          >
            Back to Categories
          </Link>
        </div>
      )}

      {!loading && !notFound && error && (
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-[#e14b2e]/30 bg-[#2a1015] p-6 text-[#f0a58c]">
            <p className="font-semibold">Unable to load this category</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !notFound && !error && category && (
        <>
          {/* Category header */}
          <section className="bg-beige/40">
            <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:py-20">
              <Link
                href="/"
                className="text-sm text-charcoal-soft hover:text-terracotta"
              >
                ← Back to Categories
              </Link>

              <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-charcoal sm:text-5xl">
                {category.name}
              </h1>

              {category.description && (
                <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-soft">
                  {category.description}
                </p>
              )}
            </div>
          </section>

          {/* Products in this category */}
          <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
            <SectionHeading
              eyebrow="In this collection"
              title={`${category.name} Products`}
            />

            {products.length === 0 && (
              <div className="py-20 text-center text-charcoal-soft">
                No products in this category yet.
              </div>
            )}

            {products.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showCategory={false}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <CosmicFooter />
    </main>
  )
}
