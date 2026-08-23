'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

type FormMode = 'closed' | 'create' | 'edit'

function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueCategorySlug(name: string) {
  const baseSlug = slugify(name) || 'category'
  let candidate = baseSlug
  let suffix = 2

  // Bounded search for a free slug before falling back to a timestamp
  // suffix, so heavy collisions can't loop forever.
  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', candidate)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data) return candidate

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return `${baseSlug}-${Date.now()}`
}

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [formMode, setFormMode] = useState<FormMode>('closed')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      setLoadError('')

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url, is_active')
        .order('name')

      if (error) {
        console.error('========== SUPABASE CATEGORIES ERROR ==========')
        console.error('Error:', error)
        console.error('==================================================')
        setLoadError(getSupabaseErrorMessage(error))
        setLoading(false)
        return
      }

      setCategories((data ?? []) as Category[])
      setLoading(false)
    }

    loadCategories()
  }, [])

  function openCreateForm() {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setImageUrl('')
    setIsActive(true)
    setErrors({})
    setFormError('')
    setSuccessMessage('')
    setFormMode('create')
  }

  function openEditForm(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description ?? '')
    setImageUrl(category.image_url ?? '')
    setIsActive(category.is_active)
    setErrors({})
    setFormError('')
    setSuccessMessage('')
    setFormMode('edit')
  }

  function closeForm() {
    setFormMode('closed')
    setEditingCategory(null)
    setErrors({})
    setFormError('')
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = 'Category name is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isSubmitting) return

    setFormError('')
    setSuccessMessage('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      if (formMode === 'create') {
        const slug = await generateUniqueCategorySlug(name)

        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            slug,
            description: description.trim() || null,
            image_url: imageUrl.trim() || null,
            is_active: isActive,
          })
          .select('id, name, slug, description, image_url, is_active')
          .single()

        if (error) {
          console.error('========== CATEGORY INSERT ERROR ==========')
          console.error('Error:', error)
          console.error('==============================================')
          throw error
        }

        if (data) {
          setCategories((prev) =>
            [...prev, data as Category].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          )
        }

        setSuccessMessage('Category created successfully.')
      } else if (formMode === 'edit' && editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            image_url: imageUrl.trim() || null,
            is_active: isActive,
          })
          .eq('id', editingCategory.id)

        if (error) {
          console.error('========== CATEGORY UPDATE ERROR ==========')
          console.error('Error:', error)
          console.error('==============================================')
          throw error
        }

        setCategories((prev) =>
          prev
            .map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: name.trim(),
                    description: description.trim() || null,
                    image_url: imageUrl.trim() || null,
                    is_active: isActive,
                  }
                : c
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        )

        setSuccessMessage('Category updated successfully.')
      }

      setFormMode('closed')
      setEditingCategory(null)
    } catch (err: unknown) {
      setFormError(getSupabaseErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleActive(category: Category) {
    const nextActive = !category.is_active

    const confirmed = window.confirm(
      nextActive
        ? `Activate "${category.name}"? It will become visible on the storefront again.`
        : `Deactivate "${category.name}"? It will be hidden from the storefront, and its products won't be browsable by category there.`
    )
    if (!confirmed) return

    setActionError('')
    setStatusUpdatingId(category.id)

    const { error } = await supabase
      .from('categories')
      .update({ is_active: nextActive })
      .eq('id', category.id)

    if (error) {
      console.error('========== CATEGORY STATUS UPDATE ERROR ==========')
      console.error('Error:', error)
      console.error('======================================================')
      setActionError(getSupabaseErrorMessage(error))
      setStatusUpdatingId(null)
      return
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, is_active: nextActive } : c
      )
    )
    setStatusUpdatingId(null)
  }

  const fieldClass =
    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

  const slugPreview =
    formMode === 'edit' && editingCategory
      ? editingCategory.slug
      : slugify(name)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store&apos;s product categories.
          </p>
        </div>

        {formMode === 'closed' && (
          <button
            onClick={openCreateForm}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Category
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {successMessage && formMode === 'closed' && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {formMode !== 'closed' && (
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            {formMode === 'create' ? 'Add category' : `Edit category`}
          </p>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Decorative Candles"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="slug" className={labelClass}>
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slugPreview}
                readOnly
                disabled
                className={`${fieldClass} cursor-not-allowed bg-gray-50 text-gray-500`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formMode === 'create'
                  ? 'Generated automatically from the name. Adjusted if it collides with an existing category.'
                  : "Slugs can't be changed after creation, to keep existing links working."}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={fieldClass}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="imageUrl" className={labelClass}>
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={fieldClass}
                placeholder="https://..."
              />
              {imageUrl.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-lg border object-cover"
                />
              )}
            </div>

            <label className="mb-6 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting
                  ? 'Saving...'
                  : formMode === 'create'
                    ? 'Create Category'
                    : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center text-sm text-gray-500">
          Loading categories...
        </div>
      )}

      {!loading && loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Unable to load categories</p>
          <p className="mt-2">{loadError}</p>
        </div>
      )}

      {!loading && !loadError && categories.length === 0 && (
        <div className="py-20 text-center text-sm text-gray-500">
          No categories yet.
        </div>
      )}

      {!loading && !loadError && categories.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {categories.map((category) => (
                <tr key={category.id} className="align-middle">
                  <td className="px-4 py-3">
                    {category.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        ✦
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">
                    {category.name}
                  </td>

                  <td className="px-4 py-3 text-gray-600">{category.slug}</td>

                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {category.description || '—'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditForm(category)}
                        className="font-medium text-gray-700 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleActive(category)}
                        disabled={statusUpdatingId === category.id}
                        className={
                          category.is_active
                            ? 'font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300'
                            : 'font-medium text-green-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300'
                        }
                      >
                        {statusUpdatingId === category.id
                          ? category.is_active
                            ? 'Deactivating...'
                            : 'Activating...'
                          : category.is_active
                            ? 'Deactivate'
                            : 'Activate'}
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
