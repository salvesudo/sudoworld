'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Hero } from '@/components/Hero'
import { SectionHeading } from '@/components/SectionHeading'
import { CategoryCard, type Category } from '@/components/CategoryCard'
import { ProductCard, type Product } from '@/components/ProductCard'
import { FeatureCard } from '@/components/FeatureCard'

const WHY_SUDOWORLD = [
  {
    title: 'Handmade With Care',
    description: 'Every creation is made with attention to detail.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M4 13c0-1.5 1-3 3-3s3 1.5 3 3v6H4v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12c1-2 2.5-3 5-3 3 0 5 2 6 5-1 3-4 6-8 7l-3-2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Unique Designs',
    description: 'Products designed to stand out from ordinary.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4L12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Creative & Original',
    description: 'Made for people who love creativity and imagination.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M12 3c4.4 0 8 3.1 8 7 0 2.8-2 4-4 4h-1.2c-.7 0-1.3.6-1.3 1.3 0 .3.1.6.3.8.2.3.3.6.3.9 0 1.1-1 2-2.1 2C7.6 19 4 15.4 4 11c0-4.4 3.6-8 8-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="8.5" cy="10.5" r="0.8" fill="currentColor" />
        <circle cx="12" cy="7.5" r="0.8" fill="currentColor" />
        <circle cx="15.5" cy="10.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Made With Passion',
    description: "Every product carries a little piece of the maker's passion.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M12 20s-7-4.4-7-9.5C5 7 7.2 5 9.8 5c1.3 0 2.5.6 3.2 1.6C13.7 5.6 15 5 16.2 5 18.8 5 21 7 21 10.5 21 15.6 12 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const TRUST_ITEMS = [
  'Handmade Products',
  'Carefully Packed',
  'Responsive Support',
  'Small-Batch Quality',
]

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Supabase error:', error)
        setCategoriesError(error.message)
        setCategoriesLoading(false)
        return
      }

      setCategories((data ?? []) as Category[])
      setCategoriesLoading(false)
    }

    async function loadFeaturedProducts() {
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
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Supabase error:', error)
        setFeaturedError(error.message)
        setFeaturedLoading(false)
        return
      }

      setFeaturedProducts((data ?? []) as unknown as Product[])
      setFeaturedLoading(false)
    }

    loadCategories()
    loadFeaturedProducts()
  }, [])

  return (
    <main className="min-h-screen bg-cream text-charcoal">
      <SiteHeader />
      <Hero />

      {/* Trust strip */}
      <div className="border-y border-charcoal/10 bg-beige/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-xs font-medium uppercase tracking-wide text-charcoal-soft sm:justify-between">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="SudoWorld Collection"
          title="Explore Our Collections"
          subtitle="Every collection is a different corner of the workshop — pick the one that speaks to you."
        />

        {categoriesLoading && (
          <div className="py-16 text-center text-charcoal-soft">
            Loading categories...
          </div>
        )}

        {!categoriesLoading && categoriesError && (
          <div className="rounded-2xl border border-terracotta/30 bg-terracotta-light p-6 text-terracotta-dark">
            <p className="font-semibold">Unable to load categories</p>
            <p className="mt-2 text-sm">{categoriesError}</p>
          </div>
        )}

        {!categoriesLoading && !categoriesError && categories.length === 0 && (
          <div className="py-16 text-center text-charcoal-soft">
            No categories available yet.
          </div>
        )}

        {!categoriesLoading && !categoriesError && categories.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      {!featuredLoading && !featuredError && featuredProducts.length > 0 && (
        <section className="bg-beige/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="Hand-picked"
              title="Featured Creations"
              subtitle="A few of our favourite pieces, chosen for their craft and character."
            />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why SudoWorld */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Why Choose SudoWorld"
          title="Why Choose SudoWorld?"
          align="center"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_SUDOWORLD.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="bg-charcoal py-20 text-cream sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta/30 via-charcoal to-sage/20 lg:order-1 lg:h-[26rem]">
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 h-full w-full opacity-60"
              aria-hidden="true"
            >
              <g stroke="#EAD9BE" strokeWidth="0.75" opacity="0.5">
                <path d="M40 360 L200 40" />
                <path d="M80 360 L230 60" />
                <path d="M120 360 L260 80" />
                <path d="M160 360 L290 100" />
              </g>
              <g fill="#C1602E">
                <circle cx="200" cy="40" r="4" />
                <circle cx="120" cy="360" r="4" />
                <circle cx="290" cy="100" r="4" />
              </g>
              <circle cx="320" cy="300" r="50" stroke="#8C9B7B" strokeWidth="1" fill="none" opacity="0.5" />
            </svg>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Our Story"
              title="Made With Imagination"
              subtitle="SudoWorld is a place for handmade creations, creative experiments and unique ideas. From detailed string art and decorative candles to DIY projects, we bring together products made for people who appreciate creativity."
              light
            />

            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cream transition hover:gap-2.5"
            >
              Read more about us
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Discovery CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
          Keep exploring
        </p>

        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-charcoal sm:text-4xl">
          Something Special Is Waiting For You
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-charcoal-soft">
          Explore our growing collection of handmade creations and creative
          DIY products.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-charcoal px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-terracotta"
        >
          Shop All Products
        </Link>
      </section>

      <SiteFooter />
    </main>
  )
}
