import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ContactForm from '@/components/ContactForm';
import { BRAND } from '@/components/Logo';
import { getAgents } from '@/lib/agents';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach the Woodbrook office, or the agent who covers your area. Valuations, viewings and listings across Trinidad & Tobago.',
  alternates: { canonical: abs('/contact') },
  openGraph: {
    title: 'Contact · ' + SITE_NAME,
    description:
      'Reach the Woodbrook office, or the agent who covers your area. Valuations, viewings and listings across Trinidad & Tobago.',
    url: abs('/contact'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

const HOURS = [
  { day: 'Monday to Friday', time: '8:30am – 4:30pm' },
  { day: 'Saturday', time: 'By appointment' },
  { day: 'Sunday', time: 'Closed' },
];

export default function ContactPage() {
  const agents = getAgents();

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to someone who knows the area"
        intro="Send the office a message and it reaches the agent who covers your area, usually the same day. If you already know who you need, call them directly."
      />

      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="rounded-sm border border-bone-edge bg-bone p-6 shadow-raise sm:p-8">
            <ContactForm />
          </div>

          <div className="flex flex-col gap-10">
            <div>
              <h2 className="font-display text-[1.35rem] tracking-display text-ink">
                The office
              </h2>
              <div aria-hidden className="mt-3.5 h-px w-12 bg-gold" />
              <address className="mt-4 not-italic text-[0.95rem] leading-[1.75] text-ink-mute">
                {BRAND.address}
                <br />
                Trinidad &amp; Tobago
              </address>
              <div className="mt-2 flex flex-col text-[0.95rem] sm:mt-4 sm:gap-1.5">
                <a
                  href={'tel:' + BRAND.phone.replace(/[^+\d]/g, '')}
                  className="flex min-h-11 items-center text-ink transition-colors duration-200 ease-out hover:text-gold-deep desk:min-h-0"
                >
                  {BRAND.phone}
                </a>
                <a
                  href={'mailto:' + BRAND.email}
                  className="flex min-h-11 items-center break-all text-ink transition-colors duration-200 ease-out hover:text-gold-deep desk:min-h-0"
                >
                  {BRAND.email}
                </a>
              </div>
            </div>

            <div>
              <h2 className="font-display text-[1.35rem] tracking-display text-ink">
                Opening hours
              </h2>
              <div aria-hidden className="mt-3.5 h-px w-12 bg-gold" />
              <dl className="mt-4">
                {HOURS.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-baseline justify-between gap-4 border-b border-bone-edge py-2.5 last:border-b-0"
                  >
                    <dt className="text-[0.92rem] text-ink-mute">{row.day}</dt>
                    <dd className="tnum text-[0.92rem] text-ink-soft">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2 className="font-display text-[1.35rem] tracking-display text-ink">
                Straight to an agent
              </h2>
              <div aria-hidden className="mt-3.5 h-px w-12 bg-gold" />
              <ul className="mt-4 flex flex-col">
                {agents.map((agent) => (
                  <li key={agent.id} className="border-b border-bone-edge last:border-b-0">
                    <Link
                      href={'/our-agents/' + agent.slug}
                      className="group flex items-baseline justify-between gap-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-[0.92rem] text-ink transition-colors duration-200 ease-out group-hover:text-gold-deep">
                          {agent.name}
                        </span>
                        <span className="mt-0.5 block text-[0.78rem] text-ink-faint">
                          {agent.territories.join(' · ')}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-[0.82rem] text-ink-mute">
                        {agent.phone.replace('+1 (868) ', '')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
