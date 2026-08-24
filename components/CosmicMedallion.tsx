// Shared curve-stitched "string art" motifs and starfield backdrop for the
// dark-cosmic visual identity — extracted from the /design-2 preview so the
// real site and the preview render the exact same, already-verified art
// instead of two copies drifting apart.
'use client'

import { useEffect, useRef } from 'react'

export function Starfield({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const layers = [
        { count: 70, r: [0.4, 0.8], a: [0.15, 0.3] },
        { count: 34, r: [0.7, 1.3], a: [0.3, 0.55] },
      ]
      layers.forEach((layer) => {
        for (let i = 0; i < layer.count; i++) {
          const x = Math.random() * rect.width
          const y = Math.random() * rect.height
          const r = layer.r[0] + Math.random() * (layer.r[1] - layer.r[0])
          const a = layer.a[0] + Math.random() * (layer.a[1] - layer.a[0])
          ctx.globalAlpha = a
          ctx.fillStyle = '#eef0f6'
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}

// Category-card / small-medallion curve-stitch pattern — single thread color.
export function Medallion({ tone = '#c9a24b' }: { tone?: string }) {
  const n = 160
  const skip = 63
  const paths: string[] = []
  for (let k = 0; k < n; k++) {
    const j = (k * skip) % n
    const a1 = (k / n) * Math.PI * 2 - Math.PI / 2
    const a2 = (j / n) * Math.PI * 2 - Math.PI / 2
    // Coordinates rounded before embedding: Math.cos/sin aren't required by
    // spec to be bit-identical across JS engines, and Node (SSR) vs Chromium
    // (client) can differ by 1 ULP — enough to fail React's hydration check.
    paths.push(
      `M ${(50 + 46 * Math.cos(a1)).toFixed(3)} ${(50 + 46 * Math.sin(a1)).toFixed(3)} L ${(50 + 46 * Math.cos(a2)).toFixed(3)} ${(50 + 46 * Math.sin(a2)).toFixed(3)}`
    )
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g stroke={tone} strokeWidth="0.14" opacity="0.7">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}

// The hero medallion: curve-stitch geometry shared with the category-card
// pattern above but a different point/skip count (n=200, every 67th nail —
// the same curve as Design 4's medallion), rendered in two interleaved
// thread colors (gold, ember) instead of one flat color, so it reads as a
// genuine multi-thread piece. Every band sits on a dark halo stroke first
// (not a CSS blend mode — mix-blend-screen washes a bright color out
// against a mostly-bright photo), which is what keeps both colors legible
// over both bright and dark parts of a background photo.
const HERO_THREADS: { color: string; width: number }[] = [
  { color: '#f0b23e', width: 0.2 }, // gold
  { color: '#e14b2e', width: 0.18 }, // ember
]

export function HeroMedallion() {
  const n = 200
  const skip = 67
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    points.push([
      Number((50 + 46 * Math.cos(a)).toFixed(3)),
      Number((50 + 46 * Math.sin(a)).toFixed(3)),
    ])
  }
  // Assign each thread to a color band by index (not randomly) so the
  // two colors interleave evenly around the circle instead of clumping.
  const bands: string[][] = HERO_THREADS.map(() => [])
  for (let k = 0; k < n; k++) {
    const j = (k * skip) % n
    const d = `M ${points[k][0]} ${points[k][1]} L ${points[j][0]} ${points[j][1]}`
    bands[k % HERO_THREADS.length].push(d)
  }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {/* dark halo beneath every thread — keeps both colors legible over bright photo areas */}
      <g stroke="#070912" strokeWidth="0.42" opacity="0.55" strokeLinecap="round">
        {bands.flat().map((d, i) => (
          <path key={'halo' + i} d={d} />
        ))}
      </g>
      {/* bright pass on top — one <g> per thread color */}
      {HERO_THREADS.map((t, ti) => (
        <g key={'band' + ti} stroke={t.color} strokeWidth={t.width} opacity="0.95" strokeLinecap="round">
          {bands[ti].map((d, i) => (
            <path key={'line' + ti + '-' + i} d={d} />
          ))}
        </g>
      ))}
      {points.map(([x, y], i) => (
        <circle key={'nail' + i} cx={x} cy={y} r="0.45" fill="#fff3d6" opacity="0.9" />
      ))}
    </svg>
  )
}
