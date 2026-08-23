'use client'

import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-tight">SudoWorld</h1>
          <p className="text-sm text-gray-500">Handmade. Creative. Unique.</p>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-gray-600">
            Home
          </Link>

          <Link href="/#categories" className="hover:text-gray-600">
            Shop
          </Link>

          <button className="rounded-full border px-4 py-2 hover:bg-gray-50">
            Cart (0)
          </button>
        </div>
      </div>
    </header>
  )
}
