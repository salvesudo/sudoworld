'use client'

import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { useCart } from '@/components/CartProvider'

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart()

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Cart</h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border bg-white py-20 text-center">
            <p className="text-gray-500">Your cart is empty.</p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse Categories
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="divide-y rounded-2xl border bg-white">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 sm:p-6"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center text-2xl text-gray-400">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-50"
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-24 shrink-0 text-right font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-2xl font-bold">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                disabled
                title="Checkout isn't built yet — this cart only adds/manages items so far."
                className="cursor-not-allowed rounded-full bg-gray-300 px-8 py-3 text-sm font-medium text-white"
              >
                Checkout (coming soon)
              </button>
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
