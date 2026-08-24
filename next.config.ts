import type { NextConfig } from "next";

// Derived from NEXT_PUBLIC_SUPABASE_URL so next/image is allowed to
// optimize product photos served from Supabase Storage's public bucket.
function getSupabaseHostname(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Real NASA public-domain Moon photography (design previews) —
      // NASA material isn't copyrighted unless explicitly noted.
      {
        protocol: "https" as const,
        hostname: "images-assets.nasa.gov",
      },
      // Real, correctly-licensed candle photography (design previews) —
      // Unsplash License: free for commercial use, no attribution required.
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
