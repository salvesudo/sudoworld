'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CosmicHeader } from '@/components/CosmicHeader'
import { CosmicFooter } from '@/components/CosmicFooter'
import { useCart } from '@/components/CartProvider'

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart()

  return (
    <main className="min-h-screen bg-cream text-charcoal font-mono">
      <CosmicHeader />

      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl italic font-medium">Your Cart</h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-medium text-terracotta hover:underline"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 && (
          <div className="rounded-3xl border border-cream/10 bg-cream-dark/60 py-20 text-center">
            <p className="text-charcoal-soft">Your cart is empty.</p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-cream hover:bg-terracotta-dark"
            >
              Browse Products
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="divide-y divide-cream/10 rounded-3xl border border-cream/10 bg-cream-dark/60">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 sm:p-6"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center text-2xl text-charcoal-soft">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-charcoal">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-charcoal-soft">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 hover:bg-cream-dark"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stockQuantity}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 hover:bg-cream-dark disabled:cursor-not-allowed disabled:text-charcoal/30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-24 shrink-0 text-right font-semibold text-charcoal">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-sm text-terracotta hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-sm text-charcoal-soft">Subtotal</p>
                <p className="text-2xl font-bold text-charcoal">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                disabled
                title="Checkout isn't built yet — this cart only adds/manages items so far."
                className="cursor-not-allowed rounded-full bg-cream-dark px-8 py-3 text-sm font-medium text-charcoal-soft"
              >
                Checkout (coming soon)
              </button>
            </div>
          </>
        )}
      </section>

      <CosmicFooter />
    </main>
  )
}
