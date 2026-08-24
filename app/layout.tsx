import type { Metadata } from "next";
import { Geist, Cormorant, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

// Geist stays loaded (and stays the sitewide --font-sans default) purely
// so the admin dashboard — which sets no font of its own and was never
// part of the Dark Cosmic redesign — keeps rendering exactly as it did
// before. The storefront opts into the new type system explicitly (see
// below) instead of changing the global default every unstyled element
// on the site would otherwise inherit.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Dark Cosmic type system — an italic serif display face paired with a
// monospace body face, matching the /design-2 preview the storefront now
// uses. Applied via the `font-display` / `font-mono` utilities on the
// storefront's own pages, not as the sitewide default.
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SudoWorld — Handmade. Creative. Unique.",
  description:
    "SudoWorld is a boutique of handmade string art, decorative candles, telescopes and other creative, one-of-a-kind pieces made with imagination and craftsmanship.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${cormorant.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
