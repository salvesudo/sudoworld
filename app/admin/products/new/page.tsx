'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type CategoryOption = {
  id: number
  name: string
}

type ProductType = 'physical' | 'digital' | 'service'

type SpecRow = {
  key: string
  value: string
}

function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name) || 'product'
  let candidate = baseSlug
  let suffix = 2

  // Bounded search for a free slug before falling back to a timestamp
  // suffix, so heavy collisions can't loop forever.
  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await supabase
      .from('products')
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

export default function AddProductPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoriesError, setCategoriesError] = useState('')

  // Category
  const [categoryId, setCategoryId] = useState('')

  // Basic information
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')

  // Pricing
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')

  // Inventory
  const [stockQuantity, setStockQuantity] = useState('')

  // Product type
  const [productType, setProductType] = useState<ProductType | ''>('')

  // Attributes
  const [isHandmade, setIsHandmade] = useState(false)
  const [isCustomizable, setIsCustomizable] = useState(false)
  const [isDiy, setIsDiy] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // Dimensions
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  // Specifications
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Supabase error:', error)
        setCategoriesError(error.message)
        return
      }

      setCategories((data ?? []) as CategoryOption[])
    }

    loadCategories()
  }, [])

  function updateSpecRow(index: number, field: 'key' | 'value', value: string) {
    setSpecs((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function addSpecRow() {
    setSpecs((prev) => [...prev, { key: '', value: '' }])
  }

  function removeSpecRow(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}

    if (!name.trim()) nextErrors.name = 'Product name is required.'
    if (!categoryId) nextErrors.categoryId = 'Please select a category.'
    if (!productType) nextErrors.productType = 'Please select a product type.'

    if (!price.trim()) {
      nextErrors.price = 'Price is required.'
    } else if (Number.isNaN(Number(price)) || Number(price) < 0) {
      nextErrors.price = 'Price must be a valid positive number.'
    }

    if (compareAtPrice.trim() && Number.isNaN(Number(compareAtPrice))) {
      nextErrors.compareAtPrice = 'Compare-at price must be a valid number.'
    }

    if (!stockQuantity.trim()) {
      nextErrors.stockQuantity = 'Stock quantity is required.'
    } else if (
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      nextErrors.stockQuantity = 'Stock quantity must be a whole number, 0 or more.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Guards against double-submit (double click, double Enter).
    if (isSubmitting) return

    setFormError('')
    setSuccessMessage('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const slug = await generateUniqueSlug(name)

      const specifications = specs.reduce<Record<string, string>>(
        (acc, row) => {
          const key = row.key.trim()
          const value = row.value.trim()
          if (key) acc[key] = value
          return acc
        },
        {}
      )

      const { error } = await supabase.from('products').insert({
        name: name.trim(),
        slug,
        sku: sku.trim() || null,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        price: Number(price),
        compare_at_price: compareAtPrice.trim() ? Number(compareAtPrice) : null,
        stock_quantity: Number(stockQuantity),
        category_id: Number(categoryId),
        product_type: productType,
        is_handmade: isHandmade,
        is_customizable: isCustomizable,
        is_diy: isDiy,
        is_featured: isFeatured,
        is_active: isActive,
        weight: weight.trim() ? Number(weight) : null,
        length: length.trim() ? Number(length) : null,
        width: width.trim() ? Number(width) : null,
        height: height.trim() ? Number(height) : null,
        specifications,
      })

      if (error) throw error

      setSuccessMessage('Product created successfully. Redirecting...')
      setTimeout(() => {
        router.push('/admin/products')
      }, 1200)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      console.error('Supabase error:', err)
      setFormError(message)
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
  const sectionClass = 'rounded-2xl border bg-white p-6 shadow-sm'
  const sectionTitleClass =
    'mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500'

  return (
    <div className="mx-auto max-w-3xl">

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Add Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new product in your store.
        </p>
      </div>

      {formError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CATEGORY */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Category</p>

          <label htmlFor="categoryId" className={labelClass}>
            Product category
          </label>

          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select a category...</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>

          {categoriesError && (
            <p className="mt-1 text-sm text-red-600">
              Could not load categories: {categoriesError}
            </p>
          )}
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Basic information</p>

          <div className="mb-4">
            <label htmlFor="name" className={labelClass}>
              Product name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Handwoven Bamboo Basket"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="sku" className={labelClass}>
              SKU
            </label>

            <input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={fieldClass}
              placeholder="SW-BASKET-001"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="shortDescription" className={labelClass}>
              Short description
            </label>

            <input
              id="shortDescription"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={fieldClass}
              placeholder="A quick one-line summary shown on product cards."
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={fieldClass}
              placeholder="Full product description..."
            />
          </div>
        </div>

        {/* PRICING */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Pricing</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price
              </label>

              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={fieldClass}
                placeholder="0.00"
              />

              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="compareAtPrice" className={labelClass}>
                Compare-at price
              </label>

              <input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className={fieldClass}
                placeholder="0.00"
              />

              {errors.compareAtPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.compareAtPrice}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* INVENTORY */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Inventory</p>

          <label htmlFor="stockQuantity" className={labelClass}>
            Stock quantity
          </label>

          <input
            id="stockQuantity"
            type="number"
            step="1"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            className={fieldClass}
            placeholder="0"
          />

          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.stockQuantity}
            </p>
          )}
        </div>

        {/* PRODUCT TYPE */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Product type</p>

          <div className="flex flex-wrap gap-6">
            {(['physical', 'digital', 'service'] as ProductType[]).map(
              (type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="productType"
                    value={type}
                    checked={productType === type}
                    onChange={() => setProductType(type)}
                  />
                  <span className="capitalize">{type}</span>
                </label>
              )
            )}
          </div>

          {errors.productType && (
            <p className="mt-2 text-sm text-red-600">{errors.productType}</p>
          )}
        </div>

        {/* ATTRIBUTES */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Attributes</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isHandmade}
                onChange={(e) => setIsHandmade(e.target.checked)}
              />
              Handmade
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
              />
              Customizable
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDiy}
                onChange={(e) => setIsDiy(e.target.checked)}
              />
              DIY
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>

        {/* DIMENSIONS */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Dimensions</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="weight" className={labelClass}>
                Weight
              </label>
              <input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="length" className={labelClass}>
                Length
              </label>
              <input
                id="length"
                type="number"
                step="0.01"
                min="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="width" className={labelClass}>
                Width
              </label>
              <input
                id="width"
                type="number"
                step="0.01"
                min="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="height" className={labelClass}>
                Height
              </label>
              <input
                id="height"
                type="number"
                step="0.01"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Specifications</p>

          <div className="space-y-3">
            {specs.map((row, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) => updateSpecRow(index, 'key', e.target.value)}
                  placeholder="Material"
                  className={fieldClass}
                />

                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                  placeholder="Wood"
                  className={fieldClass}
                />

                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  disabled={specs.length === 1}
                  className="shrink-0 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSpecRow}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Add specification
          </button>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting
              ? successMessage
                ? 'Saved'
                : 'Saving...'
              : 'Save Product'}
          </button>
        </div>

      </form>

    </div>
  )
}
