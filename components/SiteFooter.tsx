'use client'

export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        <h3 className="font-semibold">SudoWorld</h3>

        <p className="mt-2 text-sm text-gray-500">
          Handmade. Creative. Unique.
        </p>

        <p className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} SudoWorld. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
