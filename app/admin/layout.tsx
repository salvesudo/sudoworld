'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Add Product', href: '/admin/products/new' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // The login page manages its own access — no sidebar, no session gate.
    if (isLoginPage) {
      setCheckingSession(false)
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return

      if (!data.session) {
        router.replace('/admin/login')
        return
      }

      setCheckingSession(false)
    })

    return () => {
      active = false
    }
  }, [isLoginPage, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // Login page renders full-bleed, with no admin chrome.
  if (isLoginPage) {
    return <>{children}</>
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Checking session...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r bg-white">

        <div>
          <div className="border-b px-6 py-5">
            <p className="text-lg font-bold tracking-tight text-gray-900">
              SudoWorld
            </p>

            <p className="text-xs text-gray-500">
              Admin
            </p>
          </div>

          <nav className="px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-1 block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t px-3 py-4">
          <Link
            href="/"
            className="mb-1 block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            View Store
          </Link>

          <button
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  )
}
