'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  name: string
  slug: string
  short_description: string | null
  price: number
  stock_quantity: number
  is_handmade: boolean
  is_customizable: boolean
  is_diy: boolean
  categories: {
    name: string
  } []
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          short_description,
          price,
          stock_quantity,
          is_handmade,
          is_customizable,
          is_diy,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setProducts((data ?? []) as Product[])
      setLoading(false)
    }

    loadProducts()
  }, [])

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SudoWorld
            </h1>

            <p className="text-sm text-gray-500">
              Handmade. Creative. Unique.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-gray-600">
              Home
            </a>

            <a href="#products" className="hover:text-gray-600">
              Shop
            </a>

            <button className="rounded-full border px-4 py-2 hover:bg-gray-50">
              Cart (0)
            </button>
          </div>
        </div>
      </header>


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
            Discover handcrafted art, decorative creations and
            unique DIY projects made with creativity and curiosity.
          </p>

          <a
            href="#products"
            className="mt-8 inline-block rounded-full bg-black px-7 py-3 font-medium text-white hover:bg-gray-800"
          >
            Explore Products
          </a>

        </div>
      </section>


      {/* Products */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-16"
      >

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            SudoWorld Collection
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Our Products
          </h2>

          <p className="mt-2 text-gray-600">
            Explore our handmade and creative products.
          </p>
        </div>


        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading products...
          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">
              Unable to load products
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}


        {/* Products */}
        {!loading && !error && products.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No products available yet.
          </div>
        )}


        {!loading && !error && products.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Image placeholder */}
                <div className="flex h-72 items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-400">
                    <div className="text-5xl">✦</div>

                    <p className="mt-3 text-sm">
                      Product Image
                    </p>
                  </div>
                </div>


                {/* Product information */}
                <div className="p-6">

                  {product.categories && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {product.categories.name}
                    </p>
                  )}

                  <h3 className="mt-2 text-xl font-semibold">
                    {product.name}
                  </h3>

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
            ))}

          </div>
        )}

      </section>


      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">

          <h3 className="font-semibold">
            SudoWorld
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Handmade. Creative. Unique.
          </p>

          <p className="mt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} SudoWorld. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  )
}