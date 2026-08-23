'use client'

import { useState } from 'react'
import Link from 'next/link'

// Fill in real URLs when these exist — kept as placeholders (not fake
// links) per the "no fabricated social links" requirement.
const SOCIAL_LINKS: { label: string; url: string | null }[] = [
  { label: 'Instagram', url: null },
  { label: 'Facebook', url: null },
  { label: 'Pinterest', url: null },
]

export function SiteFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-medium">SudoWorld</p>
            <p className="mt-2 text-sm text-cream/70">
              Handmade. Creative. Unique.
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map((social) =>
                social.url ? (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cream/20 px-3 py-1.5 text-xs transition hover:border-cream/50"
                  >
                    {social.label}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    title="Coming soon"
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-full border border-cream/10 px-3 py-1.5 text-xs text-cream/40"
                  >
                    {social.label}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">
              Quick Links
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li><Link href="/" className="hover:text-cream">Home</Link></li>
              <li><Link href="/shop" className="hover:text-cream">Shop</Link></li>
              <li><Link href="/about" className="hover:text-cream">About</Link></li>
              <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">
              Customer
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li><Link href="/contact" className="hover:text-cream">Shipping</Link></li>
              <li><Link href="/contact" className="hover:text-cream">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-cream">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">
              Newsletter
            </p>
            <p className="mt-4 text-sm text-cream/80">
              Get updates on new creations.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex overflow-hidden rounded-full border border-cream/20"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none"
              />
              <button
                type="submit"
                disabled
                title="Newsletter signup is coming soon"
                className="cursor-not-allowed whitespace-nowrap bg-cream/15 px-4 text-sm font-medium text-cream/60"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} SudoWorld. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
