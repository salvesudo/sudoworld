'use client'

import { useEffect, useRef, useState } from 'react'
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

type StagedImage = {
  id: string
  file: File
  previewUrl: string
  altText: string
}

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function isAllowedImageFile(file: File) {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) return true

  // Some browsers/OSes report an empty or non-standard MIME type,
  // so fall back to checking the file extension.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext)
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

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', candidate)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Slug lookup failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      throw error
    }

    if (!data) {
      return candidate
    }

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
  const [specs, setSpecs] = useState<SpecRow[]>([
    { key: '', value: '' },
  ])

  // Images
  const [images, setImages] = useState<StagedImage[]>([])
  const [explicitPrimaryImageId, setExplicitPrimaryImageId] = useState<
    string | null
  >(null)
  const [imageError, setImageError] = useState('')
  const imagesRef = useRef<StagedImage[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      setCategoriesError('')

      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Categories Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })

        setCategoriesError(
          error.message || 'Unable to load categories.'
        )
        return
      }

      setCategories((data ?? []) as CategoryOption[])
    }

    loadCategories()
  }, [])

  // Keep a ref of the latest images so the unmount cleanup below can
  // revoke every preview URL, not just whatever existed at mount time.
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // Revoke all preview object URLs when the page unmounts.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  // primaryImageId is only an explicit user override (or null). The image
  // that's actually treated as primary is derived below on every render,
  // so it always falls back to the first image without needing an effect.
  const primaryImageId =
    explicitPrimaryImageId &&
    images.some((img) => img.id === explicitPrimaryImageId)
      ? explicitPrimaryImageId
      : (images[0]?.id ?? null)

  function handleImageFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    const rejected: string[] = []
    const accepted: StagedImage[] = []

    for (const file of files) {
      if (!isAllowedImageFile(file)) {
        rejected.push(`${file.name} (unsupported file type)`)
        continue
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        rejected.push(`${file.name} (larger than 10 MB)`)
        continue
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: file.name.replace(/\.[^./\\]+$/, ''),
      })
    }

    setImageError(
      rejected.length > 0 ? `Skipped: ${rejected.join(', ')}` : ''
    )

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted])
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
  }

  function setPrimaryImage(id: string) {
    setExplicitPrimaryImageId(id)
  }

  function moveImage(id: string, direction: 'up' | 'down') {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id)
      if (index === -1) return prev

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev

      const next = [...prev]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
  }

  function updateImageAltText(id: string, altText: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, altText } : img))
    )
  }

  function updateSpecRow(
    index: number,
    field: 'key' | 'value',
    value: string
  ) {
    setSpecs((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    )
  }

  function addSpecRow() {
    setSpecs((prev) => [
      ...prev,
      {
        key: '',
        value: '',
      },
    ])
  }

  function removeSpecRow(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}

    if (!name.trim()) {
      nextErrors.name = 'Product name is required.'
    }

    if (!categoryId) {
      nextErrors.categoryId = 'Please select a category.'
    } else if (
      !Number.isInteger(Number(categoryId)) ||
      Number(categoryId) <= 0
    ) {
      nextErrors.categoryId = 'Please select a valid category.'
    }

    if (!productType) {
      nextErrors.productType = 'Please select a product type.'
    }

    if (!price.trim()) {
      nextErrors.price = 'Price is required.'
    } else if (
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      nextErrors.price = 'Price must be a valid positive number.'
    }

    if (compareAtPrice.trim()) {
      if (
        Number.isNaN(Number(compareAtPrice)) ||
        Number(compareAtPrice) < 0
      ) {
        nextErrors.compareAtPrice =
          'Compare-at price must be a valid number.'
      }
    }

    if (!stockQuantity.trim()) {
      nextErrors.stockQuantity = 'Stock quantity is required.'
    } else if (
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      nextErrors.stockQuantity =
        'Stock quantity must be a whole number, 0 or more.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function getSupabaseErrorMessage(err: unknown): string {
    if (!err) {
      return 'Something went wrong while creating the product.'
    }

    if (typeof err === 'string') {
      return err
    }

    if (typeof err === 'object') {
      const { code, message, details, hint } = err as {
        code?: string
        message?: string
        details?: string
        hint?: string
      }

      // 23505 = unique_violation — surface a plain-language message for
      // the specific constraints admins are likely to hit here, instead
      // of raw Postgres text.
      if (code === '23505') {
        if (message?.includes('products_sku_key')) {
          return 'This SKU is already used by another product. Please choose a different SKU.'
        }
        if (message?.includes('products_slug_key')) {
          return 'A product with a matching slug already exists. Try a slightly different product name.'
        }
      }

      if (message) return message
      if (details) return details
      if (hint) return hint

      try {
        const serialized = JSON.stringify(err)

        if (serialized && serialized !== '{}') {
          return serialized
        }
      } catch {
        // Ignore JSON serialization errors.
      }
    }

    return 'Something went wrong while creating the product. Check the browser console for details.'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      /*
       * Generate a unique slug before inserting the product.
       */
      const slug = await generateUniqueSlug(name)

      /*
       * Convert specification rows into a JSON object.
       */
      const specifications = specs.reduce<Record<string, string>>(
        (acc, row) => {
          const key = row.key.trim()
          const value = row.value.trim()

          if (key) {
            acc[key] = value
          }

          return acc
        },
        {}
      )

      /*
       * Build the product object separately.
       * This makes it much easier to inspect the exact payload
       * being sent to Supabase.
       */
      const productData = {
        name: name.trim(),
        slug,
        sku: sku.trim() || null,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,

        price: Number(price),

        compare_at_price: compareAtPrice.trim()
          ? Number(compareAtPrice)
          : null,

        stock_quantity: Number(stockQuantity),

        category_id: Number(categoryId),

        product_type: productType.toUpperCase(),

        is_handmade: isHandmade,
        is_customizable: isCustomizable,
        is_diy: isDiy,
        is_featured: isFeatured,
        is_active: isActive,

        weight_grams: weight.trim()
          ? Number(weight)
          : null,

        length_cm: length.trim()
          ? Number(length)
          : null,

        width_cm: width.trim()
          ? Number(width)
          : null,

        height_cm: height.trim()
          ? Number(height)
          : null,

        specifications,
      }

      /*
       * IMPORTANT:
       * Do not hide the Supabase error.
       */
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) {
        console.error('========== SUPABASE PRODUCT ERROR ==========')
        console.error('Code:', error.code)
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        console.error('Hint:', error.hint)
        console.error('Full error:', error)
        console.error(
          'Error JSON:',
          JSON.stringify(error, null, 2)
        )
        console.error('============================================')

        throw error
      }

      console.log('Product created successfully:', data)

      if (!data) {
        throw new Error(
          'Product was created, but no product data was returned.'
        )
      }

      const productId = data.id

      /*
       * Upload staged images (if any) now that we have a product ID,
       * then record them in public.product_images. Images are uploaded
       * to Storage first — the binary never touches Postgres.
       */
      if (images.length > 0) {
        const primaryId = primaryImageId
        const imageRows: {
          product_id: number
          image_url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
        }[] = []

        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          const extension =
            img.file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const storagePath = `${productId}/${i}-${Date.now()}.${extension}`

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(storagePath, img.file, {
              contentType: img.file.type || undefined,
            })

          if (uploadError) {
            console.error('========== IMAGE UPLOAD ERROR ==========')
            console.error('File:', img.file.name)
            console.error('Error:', uploadError)
            console.error('===========================================')

            throw new Error(
              `Product was created, but image "${img.file.name}" failed to upload: ${getSupabaseErrorMessage(uploadError)}`
            )
          }

          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(storagePath)

          imageRows.push({
            product_id: productId,
            image_url: publicUrlData.publicUrl,
            alt_text: img.altText.trim() || name.trim(),
            display_order: i,
            is_primary: img.id === primaryId,
          })
        }

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRows)

        if (imagesError) {
          console.error('========== PRODUCT IMAGES INSERT ERROR ==========')
          console.error('Error:', imagesError)
          console.error('=====================================================')

          throw new Error(
            `Product was created and images uploaded, but saving the image records failed: ${getSupabaseErrorMessage(imagesError)}`
          )
        }
      }

      setSuccessMessage(
        'Product created successfully. Redirecting...'
      )

      setTimeout(() => {
        router.push('/admin/products')
      }, 1200)
    } catch (err: unknown) {
      console.error('========== PRODUCT CREATION FAILED ==========')
      console.error('Raw error:', err)
      console.error('Error type:', typeof err)

      try {
        console.error(
          'Error JSON:',
          JSON.stringify(err, null, 2)
        )
      } catch {
        console.error('Could not serialize error.')
      }

      const errObj =
        typeof err === 'object' && err
          ? (err as { code?: string; message?: string; details?: string; hint?: string })
          : undefined

      console.error('Error code:', errObj?.code)
      console.error('Error message:', errObj?.message)
      console.error('Error details:', errObj?.details)
      console.error('Error hint:', errObj?.hint)
      console.error('============================================')

      const message = getSupabaseErrorMessage(err)

      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black'

  const labelClass =
    'mb-1 block text-sm font-medium text-gray-700'

  const sectionClass =
    'rounded-2xl border bg-white p-6 shadow-sm'

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
          <div className="font-semibold">
            Could not create product
          </div>

          <div className="mt-1 whitespace-pre-wrap">
            {formError}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* CATEGORY */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Category
          </p>

          <label
            htmlFor="categoryId"
            className={labelClass}
          >
            Product category
          </label>

          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={fieldClass}
          >
            <option value="">
              Select a category...
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={String(category.id)}
              >
                {category.name}
              </option>
            ))}
          </select>

          {categoriesError && (
            <p className="mt-1 text-sm text-red-600">
              Could not load categories:{' '}
              {categoriesError}
            </p>
          )}

          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Basic information
          </p>

          <div className="mb-4">
            <label
              htmlFor="name"
              className={labelClass}
            >
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
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="sku"
              className={labelClass}
            >
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
            <label
              htmlFor="shortDescription"
              className={labelClass}
            >
              Short description
            </label>

            <input
              id="shortDescription"
              type="text"
              value={shortDescription}
              onChange={(e) =>
                setShortDescription(e.target.value)
              }
              className={fieldClass}
              placeholder="A quick one-line summary shown on product cards."
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className={labelClass}
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={5}
              className={fieldClass}
              placeholder="Full product description..."
            />
          </div>
        </div>

        {/* IMAGES */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Images
          </p>

          <label htmlFor="images" className={labelClass}>
            Product images
          </label>

          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => {
              handleImageFilesSelected(e.target.files)
              e.target.value = ''
            }}
            className={fieldClass}
          />

          <p className="mt-1 text-xs text-gray-500">
            JPG, JPEG, PNG or WEBP. Max 10 MB per image. You can select
            multiple files at once.
          </p>

          {imageError && (
            <p className="mt-2 text-sm text-red-600">{imageError}</p>
          )}

          {images.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, index) => (
                <div key={img.id} className="rounded-xl border p-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.altText || img.file.name}
                      className="h-36 w-full rounded-lg object-cover"
                    />

                    {primaryImageId === img.id && (
                      <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={img.altText}
                    onChange={(e) =>
                      updateImageAltText(img.id, e.target.value)
                    }
                    placeholder="Alt text"
                    className="mt-3 w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-black"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(img.id)}
                      disabled={primaryImageId === img.id}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      Set primary
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(img.id, 'up')}
                      disabled={index === 0}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      ↑ Up
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(img.id, 'down')}
                      disabled={index === images.length - 1}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      ↓ Down
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="rounded-full border border-red-200 px-3 py-1 font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRICING */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Pricing
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className={labelClass}
              >
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="compareAtPrice"
                className={labelClass}
              >
                Compare-at price
              </label>

              <input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) =>
                  setCompareAtPrice(e.target.value)
                }
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
          <p className={sectionTitleClass}>
            Inventory
          </p>

          <label
            htmlFor="stockQuantity"
            className={labelClass}
          >
            Stock quantity
          </label>

          <input
            id="stockQuantity"
            type="number"
            step="1"
            min="0"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(e.target.value)
            }
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
          <p className={sectionTitleClass}>
            Product type
          </p>

          <div className="flex flex-wrap gap-6">
            {(
              ['physical', 'digital', 'service'] as ProductType[]
            ).map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="productType"
                  value={type}
                  checked={productType === type}
                  onChange={() =>
                    setProductType(type)
                  }
                />

                <span className="capitalize">
                  {type}
                </span>
              </label>
            ))}
          </div>

          {errors.productType && (
            <p className="mt-2 text-sm text-red-600">
              {errors.productType}
            </p>
          )}
        </div>

        {/* ATTRIBUTES */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Attributes
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isHandmade}
                onChange={(e) =>
                  setIsHandmade(e.target.checked)
                }
              />
              Handmade
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) =>
                  setIsCustomizable(e.target.checked)
                }
              />
              Customizable
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDiy}
                onChange={(e) =>
                  setIsDiy(e.target.checked)
                }
              />
              DIY
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) =>
                  setIsFeatured(e.target.checked)
                }
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(e.target.checked)
                }
              />
              Active
            </label>
          </div>
        </div>

        {/* DIMENSIONS */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Dimensions
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="weight"
                className={labelClass}
              >
                Weight
              </label>

              <input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="length"
                className={labelClass}
              >
                Length
              </label>

              <input
                id="length"
                type="number"
                step="0.01"
                min="0"
                value={length}
                onChange={(e) =>
                  setLength(e.target.value)
                }
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="width"
                className={labelClass}
              >
                Width
              </label>

              <input
                id="width"
                type="number"
                step="0.01"
                min="0"
                value={width}
                onChange={(e) =>
                  setWidth(e.target.value)
                }
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="height"
                className={labelClass}
              >
                Height
              </label>

              <input
                id="height"
                type="number"
                step="0.01"
                min="0"
                value={height}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            Specifications
          </p>

          <div className="space-y-3">
            {specs.map((row, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) =>
                    updateSpecRow(
                      index,
                      'key',
                      e.target.value
                    )
                  }
                  placeholder="Material"
                  className={fieldClass}
                />

                <input
                  type="text"
                  value={row.value}
                  onChange={(e) =>
                    updateSpecRow(
                      index,
                      'value',
                      e.target.value
                    )
                  }
                  placeholder="Wood"
                  className={fieldClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSpecRow(index)
                  }
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