'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type CartItem = {
  productId: number
  name: string
  slug: string
  price: number
  imageUrl: string | null
  stockQuantity: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'sudoworld-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load any previously saved cart once, on mount — localStorage only
  // exists in the browser, so this can't run during server rendering.
  useEffect(() => {
    function loadCart() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setItems(parsed)
        }
      } catch {
        // Ignore malformed/inaccessible storage — cart just starts empty.
      }
      setHydrated(true)
    }

    loadCart()
  }, [])

  // Persist on every change, but only after the initial load above has
  // run — otherwise this would overwrite a saved cart with [] on mount.
  useEffect(() => {
    if (!hydrated) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [items, hydrated])

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId)

        if (existing) {
          const nextQuantity = Math.min(
            existing.quantity + quantity,
            item.stockQuantity
          )
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: nextQuantity }
              : i
          )
        }

        return [
          ...prev,
          { ...item, quantity: Math.min(quantity, item.stockQuantity) },
        ]
      })
    },
    []
  )

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity: Math.max(0, Math.min(quantity, i.stockQuantity)),
              }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
