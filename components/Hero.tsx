import Link from 'next/link'

// A hand-built, license-safe artistic backdrop (gradients + inline SVG),
// standing in for photography — see chat for why. It layers a warm
// terracotta glow, a scattered "night sky" for the telescopes line, and
// a string-art thread motif for the String Art line, kept subtle so the
// hero text stays the clear focal point.
function HeroArt() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-24 -top-24 h-[36rem] w-[36rem] rounded-full bg-terracotta/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-[28rem] w-[28rem] rounded-full bg-sage/20 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 1200 700"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* String-art threads */}
        <g stroke="#2A2420" strokeWidth="0.75" opacity="0.5">
          <path d="M120 560 L340 120" />
          <path d="M160 560 L360 140" />
          <path d="M200 560 L380 160" />
          <path d="M240 560 L400 180" />
          <path d="M280 560 L420 200" />
          <path d="M320 560 L440 220" />
        </g>
        <g fill="#C1602E">
          <circle cx="120" cy="560" r="3" />
          <circle cx="340" cy="120" r="3" />
          <circle cx="200" cy="560" r="3" />
          <circle cx="380" cy="160" r="3" />
          <circle cx="280" cy="560" r="3" />
          <circle cx="420" cy="200" r="3" />
        </g>

        {/* Night sky / telescope motif */}
        <g fill="#2A2420" opacity="0.55">
          <circle cx="920" cy="90" r="2" />
          <circle cx="980" cy="140" r="1.5" />
          <circle cx="1040" cy="80" r="2.5" />
          <circle cx="1090" cy="160" r="1.5" />
          <circle cx="860" cy="150" r="1.5" />
          <circle cx="1000" cy="220" r="2" />
          <circle cx="950" cy="260" r="1.5" />
        </g>
        <circle
          cx="980"
          cy="150"
          r="70"
          stroke="#8C9B7B"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-cream to-beige">
      <HeroArt />

      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
        <p className="animate-fade-in-up mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
          Welcome to SudoWorld
        </p>

        <h1
          className="animate-fade-in-up font-display text-5xl font-medium leading-[1.05] tracking-tight text-charcoal sm:text-7xl"
          style={{ animationDelay: '80ms' }}
        >
          Handmade. Creative.
          <br />
          Unique.
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-lg leading-7 text-charcoal-soft"
          style={{ animationDelay: '160ms' }}
        >
          Discover beautiful handmade creations and unique DIY products
          crafted with imagination.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: '240ms' }}
        >
          <Link
            href="/shop"
            className="rounded-full bg-charcoal px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-terracotta"
          >
            Explore Products
          </Link>

          <Link
            href="/about"
            className="rounded-full border border-charcoal/20 bg-cream/60 px-8 py-3.5 text-sm font-medium text-charcoal backdrop-blur transition hover:border-charcoal/40 hover:bg-cream"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}
