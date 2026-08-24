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

// Dark Cosmic footer — same functional content as the retired SiteFooter
// (quick links, customer links, newsletter placeholder) restyled to sit on
// the near-black page rather than as an isolated dark band on a light one.
export function CosmicFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer className="border-t border-cream/10 bg-cream text-charcoal">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl italic font-medium">SudoWorld</p>
            <p className="mt-2 text-sm text-charcoal-soft">Handmade. Creative. Unique.</p>

            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map((social) =>
                social.url ? (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cream/20 px-3 py-1.5 text-xs transition hover:border-terracotta/60 hover:text-terracotta"
                  >
                    {social.label}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    title="Coming soon"
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-full border border-cream/10 px-3 py-1.5 text-xs text-charcoal-soft/60"
                  >
                    {social.label}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-soft">
              Quick Links
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-soft">
              <li><Link href="/" className="hover:text-terracotta">Home</Link></li>
              <li><Link href="/shop" className="hover:text-terracotta">Shop</Link></li>
              <li><Link href="/about" className="hover:text-terracotta">About</Link></li>
              <li><Link href="/contact" className="hover:text-terracotta">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-soft">
              Customer
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-soft">
              <li><Link href="/contact" className="hover:text-terracotta">Shipping</Link></li>
              <li><Link href="/contact" className="hover:text-terracotta">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-terracotta">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-soft">
              Newsletter
            </p>
            <p className="mt-4 text-sm text-charcoal-soft">Get updates on new creations.</p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex overflow-hidden rounded-full border border-cream/20"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 outline-none"
              />
              <button
                type="submit"
                disabled
                title="Newsletter signup is coming soon"
                className="cursor-not-allowed whitespace-nowrap bg-cream-dark px-4 text-sm font-medium text-charcoal-soft"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8 text-center text-xs text-charcoal-soft">
          © {new Date().getFullYear()} SudoWorld. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
