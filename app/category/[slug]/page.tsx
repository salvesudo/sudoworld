'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
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
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {loading && (
        <div className="py-24 text-center text-gray-500">Loading...</div>
      )}

      {!loading && notFound && (
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="text-xl font-semibold">Category not found</p>
          <p className="mt-2 text-gray-500">
            We couldn&apos;t find that category.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Categories
          </Link>
        </div>
      )}

      {!loading && !notFound && error && (
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Unable to load this category</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !notFound && !error && category && (
        <>
          {/* Category header */}
          <section className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 py-16 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Categories
              </Link>

              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {category.name}
              </h1>

              {category.description && (
                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                  {category.description}
                </p>
              )}
            </div>
          </section>

          {/* Products in this category */}
          <section className="mx-auto max-w-7xl px-6 py-16">
            {products.length === 0 && (
              <div className="py-20 text-center text-gray-500">
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

      <SiteFooter />
    </main>
  )
}
