'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      // Same public.categories table the admin portal manages —
      // is_active = true is the only filter, enforced by RLS.
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setCategories((data ?? []) as Category[])
      setLoading(false)
    }

    loadCategories()
  }, [])

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Welcome to SudoWorld
          </p>

          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Handmade ideas.
            <br />
            Made with imagination.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Discover handcrafted art, decorative creations and unique DIY
            projects made with creativity and curiosity.
          </p>

          <a
            href="#categories"
            className="mt-8 inline-block rounded-full bg-black px-7 py-3 font-medium text-white hover:bg-gray-800"
          >
            Explore Categories
          </a>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            SudoWorld Collection
          </p>

          <h2 className="mt-2 text-3xl font-bold">Shop by Category</h2>

          <p className="mt-2 text-gray-600">
            Explore our handmade and creative products by category.
          </p>
        </div>

        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading categories...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Unable to load categories</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No categories available yet.
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-72 bg-gray-100">
                  {category.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center text-center text-gray-400">
                      <div>
                        <div className="text-5xl">✦</div>
                        <p className="mt-3 text-sm">Category Image</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold group-hover:underline">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {category.description}
                    </p>
                  )}

                  <span className="mt-4 inline-block text-sm font-medium text-gray-900">
                    Shop {category.name} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
