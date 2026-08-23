'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/#categories' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.6-3.4 4.4-5 7.5-5s5.9 1.6 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function SiteHeader() {
  const { totalItems } = useCart()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const term = searchTerm.trim()
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop')
    setSearchOpen(false)
    setSearchTerm('')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="shrink-0">
          <p className="font-display text-2xl font-medium tracking-tight text-charcoal">
            SudoWorld
          </p>
          <p className="text-xs text-charcoal-soft">
            Handmade. Creative. Unique.
          </p>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-charcoal-soft lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-terracotta"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="rounded-full p-2.5 text-charcoal transition hover:bg-beige"
            >
              <SearchIcon />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-full mt-2 flex w-64 overflow-hidden rounded-full border border-charcoal/15 bg-white shadow-lg"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full bg-transparent px-4 py-2 text-sm text-charcoal outline-none"
                />
                <button
                  type="submit"
                  className="px-3 text-sm font-medium text-terracotta"
                >
                  Go
                </button>
              </form>
            )}
          </div>

          <button
            type="button"
            title="Customer accounts are coming soon"
            aria-disabled="true"
            className="hidden rounded-full p-2.5 text-charcoal/40 sm:block"
          >
            <UserIcon />
          </button>

          <Link
            href="/cart"
            aria-label={`Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}
            className="relative rounded-full p-2.5 text-charcoal transition hover:bg-beige"
          >
            <BagIcon />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-semibold text-cream">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="ml-1 rounded-full p-2.5 text-charcoal transition hover:bg-beige lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t border-charcoal/10 bg-cream px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-charcoal-soft transition hover:bg-beige hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
