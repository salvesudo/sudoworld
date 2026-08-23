'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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

type ExistingImage = {
  kind: 'existing'
  key: string
  dbId: number
  imageUrl: string
  altText: string
}

type NewImage = {
  kind: 'new'
  key: string
  file: File
  previewUrl: string
  altText: string
}

type EditableImage = ExistingImage | NewImage

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

function extractStoragePath(publicUrl: string): string | null {
  const marker = '/object/public/product-images/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length))
  } catch {
    return publicUrl.slice(idx + marker.length)
  }
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

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const productId = Number(params.id)
  const router = useRouter()

  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [notFound, setNotFound] = useState(false)

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

  // Images
  const [images, setImages] = useState<EditableImage[]>([])
  const [explicitPrimaryKey, setExplicitPrimaryKey] = useState<string | null>(
    null
  )
  const [imageError, setImageError] = useState('')
  const [pendingDeletions, setPendingDeletions] = useState<
    { dbId: number; imageUrl: string }[]
  >([])
  const newImagesRef = useRef<NewImage[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!Number.isFinite(productId)) {
        setNotFound(true)
        setPageLoading(false)
        return
      }

      setPageLoading(true)
      setPageError('')
      setNotFound(false)

      const [productRes, categoriesRes, imagesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle(),
        supabase.from('categories').select('id, name').order('name'),
        supabase
          .from('product_images')
          .select('id, image_url, alt_text, display_order, is_primary')
          .eq('product_id', productId)
          .order('display_order'),
      ])

      if (categoriesRes.error) {
        console.error('Categories Supabase error:', categoriesRes.error)
        setCategoriesError(getSupabaseErrorMessage(categoriesRes.error))
      } else {
        setCategories((categoriesRes.data ?? []) as CategoryOption[])
      }

      if (productRes.error) {
        console.error('========== SUPABASE PRODUCT FETCH ERROR ==========')
        console.error('Error:', productRes.error)
        console.error('=====================================================')
        setPageError(getSupabaseErrorMessage(productRes.error))
        setPageLoading(false)
        return
      }

      if (!productRes.data) {
        setNotFound(true)
        setPageLoading(false)
        return
      }

      const p = productRes.data as Record<string, unknown>

      setCategoryId(p.category_id != null ? String(p.category_id) : '')
      setName(typeof p.name === 'string' ? p.name : '')
      setSku(typeof p.sku === 'string' ? p.sku : '')
      setShortDescription(
        typeof p.short_description === 'string' ? p.short_description : ''
      )
      setDescription(typeof p.description === 'string' ? p.description : '')
      setPrice(p.price != null ? String(p.price) : '')
      setCompareAtPrice(
        p.compare_at_price != null ? String(p.compare_at_price) : ''
      )
      setStockQuantity(
        p.stock_quantity != null ? String(p.stock_quantity) : ''
      )

      const dbType =
        typeof p.product_type === 'string'
          ? p.product_type.toLowerCase()
          : ''
      setProductType(
        dbType === 'physical' || dbType === 'digital' || dbType === 'service'
          ? dbType
          : ''
      )

      setIsHandmade(!!p.is_handmade)
      setIsCustomizable(!!p.is_customizable)
      setIsDiy(!!p.is_diy)
      setIsFeatured(!!p.is_featured)
      setIsActive(!!p.is_active)

      setWeight(p.weight_grams != null ? String(p.weight_grams) : '')
      setLength(p.length_cm != null ? String(p.length_cm) : '')
      setWidth(p.width_cm != null ? String(p.width_cm) : '')
      setHeight(p.height_cm != null ? String(p.height_cm) : '')

      const specEntries =
        p.specifications && typeof p.specifications === 'object'
          ? Object.entries(p.specifications as Record<string, unknown>)
          : []
      setSpecs(
        specEntries.length > 0
          ? specEntries.map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : [{ key: '', value: '' }]
      )

      if (imagesRes.error) {
        console.error('========== SUPABASE IMAGES FETCH ERROR ==========')
        console.error('Error:', imagesRes.error)
        console.error('====================================================')
        setImageError(getSupabaseErrorMessage(imagesRes.error))
      } else {
        const rows = imagesRes.data ?? []
        const existing: ExistingImage[] = rows.map((row) => ({
          kind: 'existing',
          key: `existing-${row.id}`,
          dbId: row.id,
          imageUrl: row.image_url,
          altText: row.alt_text ?? '',
        }))
        setImages(existing)

        const primaryRow = rows.find((row) => row.is_primary)
        if (primaryRow) {
          setExplicitPrimaryKey(`existing-${primaryRow.id}`)
        }
      }

      setPageLoading(false)
    }

    loadData()
  }, [productId])

  // Keep a ref of currently-staged *new* images so the unmount cleanup
  // below can revoke every preview URL, not just whatever existed earlier.
  useEffect(() => {
    newImagesRef.current = images.filter(
      (img): img is NewImage => img.kind === 'new'
    )
  }, [images])

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  // The effective primary image is derived every render: the user's
  // explicit choice if it still exists in the list, otherwise the first
  // image. No effect needed to keep it in sync.
  const primaryKey =
    explicitPrimaryKey && images.some((img) => img.key === explicitPrimaryKey)
      ? explicitPrimaryKey
      : (images[0]?.key ?? null)

  function handleImageFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    const rejected: string[] = []
    const accepted: NewImage[] = []

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
        kind: 'new',
        key: `new-${crypto.randomUUID()}`,
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

  function removeImage(key: string) {
    const target = images.find((img) => img.key === key)
    if (!target) return

    if (target.kind === 'new') {
      URL.revokeObjectURL(target.previewUrl)
    } else {
      setPendingDeletions((prev) => [
        ...prev,
        { dbId: target.dbId, imageUrl: target.imageUrl },
      ])
    }

    setImages((prev) => prev.filter((img) => img.key !== key))
  }

  function setPrimaryImage(key: string) {
    setExplicitPrimaryKey(key)
  }

  function moveImage(key: string, direction: 'up' | 'down') {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.key === key)
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

  function updateImageAltText(key: string, altText: string) {
    setImages((prev) =>
      prev.map((img) => (img.key === key ? { ...img, altText } : img))
    )
  }

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

    if (!categoryId) {
      nextErrors.categoryId = 'Please select a category.'
    } else if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
      nextErrors.categoryId = 'Please select a valid category.'
    }

    if (!productType) nextErrors.productType = 'Please select a product type.'

    if (!price.trim()) {
      nextErrors.price = 'Price is required.'
    } else if (Number.isNaN(Number(price)) || Number(price) < 0) {
      nextErrors.price = 'Price must be a valid positive number.'
    }

    if (compareAtPrice.trim()) {
      if (Number.isNaN(Number(compareAtPrice)) || Number(compareAtPrice) < 0) {
        nextErrors.compareAtPrice = 'Compare-at price must be a valid number.'
      }
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

    if (isSubmitting) return

    setFormError('')
    setSuccessMessage('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const specifications = specs.reduce<Record<string, string>>(
        (acc, row) => {
          const key = row.key.trim()
          const value = row.value.trim()
          if (key) acc[key] = value
          return acc
        },
        {}
      )

      const productData = {
        category_id: Number(categoryId),
        name: name.trim(),
        sku: sku.trim() || null,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        price: Number(price),
        compare_at_price: compareAtPrice.trim() ? Number(compareAtPrice) : null,
        stock_quantity: Number(stockQuantity),
        product_type: productType.toUpperCase(),
        is_handmade: isHandmade,
        is_customizable: isCustomizable,
        is_diy: isDiy,
        is_featured: isFeatured,
        is_active: isActive,
        weight_grams: weight.trim() ? Number(weight) : null,
        length_cm: length.trim() ? Number(length) : null,
        width_cm: width.trim() ? Number(width) : null,
        height_cm: height.trim() ? Number(height) : null,
        specifications,
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)

      if (updateError) {
        console.error('========== SUPABASE PRODUCT UPDATE ERROR ==========')
        console.error('Error:', updateError)
        console.error('======================================================')
        throw updateError
      }

      // Delete storage files for images the user removed in this session.
      if (pendingDeletions.length > 0) {
        const paths = pendingDeletions
          .map((d) => extractStoragePath(d.imageUrl))
          .filter((p): p is string => !!p)

        if (paths.length > 0) {
          const { error: removeError } = await supabase.storage
            .from('product-images')
            .remove(paths)

          if (removeError) {
            console.error('========== IMAGE DELETE ERROR ==========')
            console.error('Error:', removeError)
            console.error('===========================================')
            throw new Error(
              `Product details were saved, but a removed image file failed to delete: ${getSupabaseErrorMessage(removeError)}`
            )
          }
        }
      }

      // Upload any newly added images and build the final row list
      // (kept existing images + newly uploaded ones) in display order.
      const finalRows: {
        product_id: number
        image_url: string
        alt_text: string | null
        display_order: number
        is_primary: boolean
      }[] = []

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const isPrimary = img.key === primaryKey

        if (img.kind === 'existing') {
          finalRows.push({
            product_id: productId,
            image_url: img.imageUrl,
            alt_text: img.altText.trim() || name.trim(),
            display_order: i,
            is_primary: isPrimary,
          })
          continue
        }

        const extension = img.file.name.split('.').pop()?.toLowerCase() || 'jpg'
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
            `Product details were saved, but image "${img.file.name}" failed to upload: ${getSupabaseErrorMessage(uploadError)}`
          )
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath)

        finalRows.push({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          alt_text: img.altText.trim() || name.trim(),
          display_order: i,
          is_primary: isPrimary,
        })
      }

      // Replace this product's image rows with the final list, so
      // display_order/is_primary always reflect the current arrangement.
      const { error: deleteRowsError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

      if (deleteRowsError) {
        console.error('========== PRODUCT IMAGES DELETE ERROR ==========')
        console.error('Error:', deleteRowsError)
        console.error('====================================================')
        throw new Error(
          `Product details were saved, but updating image records failed: ${getSupabaseErrorMessage(deleteRowsError)}`
        )
      }

      if (finalRows.length > 0) {
        const { error: insertRowsError } = await supabase
          .from('product_images')
          .insert(finalRows)

        if (insertRowsError) {
          console.error('========== PRODUCT IMAGES INSERT ERROR ==========')
          console.error('Error:', insertRowsError)
          console.error('=====================================================')
          throw new Error(
            `Product details were saved, but saving the image records failed: ${getSupabaseErrorMessage(insertRowsError)}`
          )
        }
      }

      setPendingDeletions([])
      setSuccessMessage('Product updated successfully. Redirecting...')

      setTimeout(() => {
        router.push('/admin/products')
      }, 1200)
    } catch (err: unknown) {
      console.error('========== PRODUCT UPDATE FAILED ==========')
      console.error('Raw error:', err)
      const message = getSupabaseErrorMessage(err)
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
  const sectionClass = 'rounded-2xl border bg-white p-6 shadow-sm'
  const sectionTitleClass =
    'mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500'

  if (pageLoading) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Loading product...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-900">Product not found</p>
          <p className="mt-2 text-sm text-gray-500">
            No product with id &quot;{params.id}&quot; exists.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Unable to load product</p>
          <p className="mt-2">{pageError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">{name}</p>
      </div>

      {formError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="font-semibold">Could not save product</div>
          <div className="mt-1 whitespace-pre-wrap">{formError}</div>
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
            />
          </div>
        </div>

        {/* IMAGES */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Images</p>

          <label htmlFor="images" className={labelClass}>
            Add images
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

          {images.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              No images yet. Add one above.
            </p>
          )}

          {images.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, index) => (
                <div key={img.key} className="rounded-xl border p-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        img.kind === 'existing' ? img.imageUrl : img.previewUrl
                      }
                      alt={img.altText || 'Product image'}
                      className="h-36 w-full rounded-lg object-cover"
                    />

                    {primaryKey === img.key && (
                      <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
                        Primary
                      </span>
                    )}

                    {img.kind === 'new' && (
                      <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={img.altText}
                    onChange={(e) => updateImageAltText(img.key, e.target.value)}
                    placeholder="Alt text"
                    className="mt-3 w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-black"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(img.key)}
                      disabled={primaryKey === img.key}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      Set primary
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(img.key, 'up')}
                      disabled={index === 0}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      ↑ Up
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(img.key, 'down')}
                      disabled={index === images.length - 1}
                      className="rounded-full border px-3 py-1 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      ↓ Down
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(img.key)}
                      className="rounded-full border border-red-200 px-3 py-1 font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          />

          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
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
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="rounded-full border px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting
              ? successMessage
                ? 'Saved'
                : 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
