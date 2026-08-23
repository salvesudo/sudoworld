'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Stats = {
  totalProducts: number
  activeProducts: number
  outOfStock: number
  totalCategories: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      const [productsRes, activeRes, outOfStockRes, categoriesRes] =
        await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .lte('stock_quantity', 0),
          supabase
            .from('categories')
            .select('*', { count: 'exact', head: true }),
        ])

      const firstError =
        productsRes.error ||
        activeRes.error ||
        outOfStockRes.error ||
        categoriesRes.error

      if (firstError) {
        console.error('Supabase error:', firstError)
        setError(firstError.message)
        setLoading(false)
        return
      }

      setStats({
        totalProducts: productsRes.count ?? 0,
        activeProducts: activeRes.count ?? 0,
        outOfStock: outOfStockRes.count ?? 0,
        totalCategories: categoriesRes.count ?? 0,
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  const cards = stats
    ? [
        { label: 'Products', value: stats.totalProducts },
        { label: 'Active Products', value: stats.activeProducts },
        { label: 'Out of Stock', value: stats.outOfStock },
        { label: 'Categories', value: stats.totalCategories },
      ]
    : []

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your store.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-10 text-sm text-gray-500">
          Loading dashboard...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">
            Unable to load dashboard data
          </p>

          <p className="mt-2">
            {error}
          </p>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
