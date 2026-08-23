'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  name: string
  slug: string
  sku: string | null
  price: number
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  category_id: number | null
  categories: { id: number; name: string } | null
}

type CategoryOption = {
  id: number
  name: string
}

type StockFilter = 'all' | 'in_stock' | 'out_of_stock'
type ActiveFilter = 'all' | 'active' | 'inactive'

function getSupabaseErrorMessage(err: unknown): string {
  if (!err) return 'Something went wrong.'
  if (typeof err === 'string') return err

  if (typeof err === 'object') {
    const { message, details, hint } = err as {
      message?: string
      details?: string
      hint?: string
    }
    if (message) return message
    if (details) return details
    if (hint) return hint

    try {
      const serialized = JSON.stringify(err)
      if (serialized && serialized !== '{}') return serialized
    } catch {
      // Ignore JSON serialization errors.
    }
  }

  return 'Something went wrong. Check the browser console for details.'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')

  const [archivingId, setArchivingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    async function loadData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select(
            `
            id,
            name,
            slug,
            sku,
            price,
            stock_quantity,
            is_active,
            is_featured,
            category_id,
            categories (
              id,
              name
            )
          `
          )
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
      ])

      if (productsRes.error) {
        console.error('========== SUPABASE PRODUCTS ERROR ==========')
        console.error('Code:', productsRes.error.code)
        console.error('Message:', productsRes.error.message)
        console.error('Details:', productsRes.error.details)
        console.error('Hint:', productsRes.error.hint)
        console.error('Full error JSON:', JSON.stringify(productsRes.error, null, 2))
        console.error('===============================================')
        setError(getSupabaseErrorMessage(productsRes.error))
        setLoading(false)
        return
      }

      if (categoriesRes.error) {
        console.error('========== SUPABASE CATEGORIES ERROR ==========')
        console.error('Code:', categoriesRes.error.code)
        console.error('Message:', categoriesRes.error.message)
        console.error('Details:', categoriesRes.error.details)
        console.error('Hint:', categoriesRes.error.hint)
        console.error('Full error JSON:', JSON.stringify(categoriesRes.error, null, 2))
        console.error('=================================================')
        setError(getSupabaseErrorMessage(categoriesRes.error))
        setLoading(false)
        return
      }

      setProducts((productsRes.data ?? []) as unknown as Product[])
      setCategories((categoriesRes.data ?? []) as CategoryOption[])
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search.trim() === '' ||
        product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (product.sku ?? '').toLowerCase().includes(search.trim().toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' ||
        String(product.category_id ?? '') === categoryFilter

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && product.stock_quantity > 0) ||
        (stockFilter === 'out_of_stock' && product.stock_quantity <= 0)

      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && product.is_active) ||
        (activeFilter === 'inactive' && !product.is_active)

      return matchesSearch && matchesCategory && matchesStock && matchesActive
    })
  }, [products, search, categoryFilter, stockFilter, activeFilter])

  async function handleArchive(product: Product) {
    if (!product.is_active) return

    const confirmed = window.confirm(
      `Archive "${product.name}"? It will be hidden from the storefront.`
    )
    if (!confirmed) return

    setActionError('')
    setArchivingId(product.id)

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', product.id)

    if (error) {
      console.error('========== SUPABASE ARCHIVE ERROR ==========')
      console.error('Code:', error.code)
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Full error JSON:', JSON.stringify(error, null, 2))
      console.error('==============================================')
      setActionError(getSupabaseErrorMessage(error))
      setArchivingId(null)
      return
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: false } : p
      )
    )
    setArchivingId(null)
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store&apos;s products.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="all">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center text-sm text-gray-500">
          Loading products...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Unable to load products</p>
          <p className="mt-2">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="py-20 text-center text-sm text-gray-500">
          No products match your filters.
        </div>
      )}

      {/* Table */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="align-middle">

                  <td className="px-4 py-3">
                    {/* products has no image column yet (image upload is a later phase) — placeholder for every row */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      ✦
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {product.categories?.name ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {product.sku ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-gray-900">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock_quantity > 0
                          ? 'text-gray-900'
                          : 'font-medium text-red-600'
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {product.is_featured ? (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        ★ Featured
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-gray-700 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleArchive(product)}
                        disabled={
                          !product.is_active || archivingId === product.id
                        }
                        className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        {archivingId === product.id
                          ? 'Archiving...'
                          : product.is_active
                            ? 'Archive'
                            : 'Archived'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
