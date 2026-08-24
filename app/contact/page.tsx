import { CosmicHeader } from '@/components/CosmicHeader'
import { CosmicFooter } from '@/components/CosmicFooter'
import { SectionHeading } from '@/components/SectionHeading'

export const metadata = {
  title: 'Contact — SudoWorld',
  description: 'Get in touch with SudoWorld.',
}

const CONTACT_EMAIL = 'hello@sudoworld.in'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-cream text-charcoal font-mono">
      <CosmicHeader />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact SudoWorld"
          subtitle="Questions about an order, shipping, returns, or a custom piece? Reach out — we'd love to hear from you."
        />

        <div className="rounded-3xl border border-cream/10 bg-cream-dark/60 p-8">
          <h2 className="font-display text-lg italic font-medium text-charcoal">
            Email
          </h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-2 inline-block text-terracotta hover:underline"
          >
            {CONTACT_EMAIL}
          </a>

          <div className="mt-8 border-t border-cream/10 pt-8">
            <h2 className="font-display text-lg italic font-medium text-charcoal">
              Shipping &amp; Returns
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Every piece is made and packed by hand, so please reach out by
              email for shipping timelines and return questions on a
              specific order.
            </p>
          </div>
        </div>
      </section>

      <CosmicFooter />
    </main>
  )
}
