import { supabase } from '@/lib/supabase'
import type { Product } from '@/components/ProductCard'

// Real, correctly-licensed photography used across the design previews
// where a category has no uploaded product photo yet. Both verified
// directly (not guessed): NASA material is public domain unless noted;
// the Unsplash photo is under the Unsplash License (free commercial use,
// no attribution required). No string-art equivalent exists here — free
// stock libraries don't carry real nail-and-thread art, so that category
// uses the procedural curve-stitched medallion technique instead of a
// mismatched stock photo.
// A genuine full-disk lunar photo with sharp, clearly visible craters and
// maria — swapped in for the earlier ISS Earth-horizon shot, which was a
// hazier, wide-angle framing not well suited to a "craters clearly
// visible" hero image. Verified by downloading and viewing it directly,
// not just trusting the search result.
export const REAL_MOON_IMAGE_URL =
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001515/GSFC_20171208_Archive_e001515~orig.jpg'
export const REAL_CANDLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1613068431228-8cb6a1e92573'

export type StorefrontCategory = {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

// One shared query shape for the five design previews (and anything
// else that needs the full public catalog) — avoids five slightly
// different copies of the same Supabase select string.
const PRODUCT_SELECT = `
  id, name, slug, short_description, price, compare_at_price,
  stock_quantity, is_handmade, is_customizable, is_diy, is_featured,
  categories ( name ),
  product_images ( image_url, alt_text, is_primary, display_order )
`

export async function fetchStorefrontData() {
  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  return {
    categories: (categoriesRes.data ?? []) as StorefrontCategory[],
    categoriesError: categoriesRes.error?.message ?? null,
    products: (productsRes.data ?? []) as unknown as Product[],
    productsError: productsRes.error?.message ?? null,
  }
}
