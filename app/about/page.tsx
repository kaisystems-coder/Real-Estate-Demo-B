import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/components/Logo';
import { BLUR_DATA_URL } from '@/lib/format';
import { getAgents } from '@/lib/agents';

export const metadata: Metadata = {
  title: 'About',
  description:
    'A Woodbrook-based agency selling and letting property across Trinidad and Tobago since 2009.',
  alternates: { canonical: abs('/about') },
  openGraph: {
    title: 'About · ' + SITE_NAME,
    description:
      'A Woodbrook-based agency selling and letting property across Trinidad and Tobago since 2009.',
    url: abs('/about'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

/**
 * How the agency actually works, in order. This is a genuine sequence — each
 * step depends on the one before it — which is what earns the numbering.
 */
const PROCESS = [
  {
    title: 'We walk the property',
    body: 'Before anything is listed, an agent visits, measures the floor area and photographs it properly. No listing goes up from a phone snap and an owner’s estimate.',
  },
  {
    title: 'We price it against real sales',
    body: 'Asking prices are public; closing prices are not. We price against what comparable property in the same area actually sold for, which is usually the uncomfortable conversation.',
  },
  {
    title: 'We qualify the buyer',
    body: 'Viewings are arranged for people who can complete. That means checking a pre-approval before a seller rearranges their Saturday.',
  },
  {
    title: 'We stay on the file to closing',
    body: 'Between offer and keys sit the valuation, the bank and the attorney. The agent who listed the property is the one chasing all three.',
  },
];

const FACTS = [
  { figure: '2009', label: 'Trading since' },
  { figure: '6', label: 'Licensed agents' },
  { figure: '7', label: 'Areas covered' },
  { figure: 'TTD', label: 'Everything priced in' },
];

export default function AboutPage() {
  const agents = getAgents();

  return (
    <>
      <section className="on-ink relative isolate overflow-hidden bg-ink">
        <div className="grain absolute inset-0">
          <Image
            src="/photos/photo-1449844908441-8829872d2607.jpg"
            alt=""
            aria-hidden
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/35"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/50"
          />
          <div aria-hidden className="absolute inset-0 bg-ink/20 mix-blend-multiply" />
        </div>

        <div className="relative mx-auto max-w-[82rem] px-5 pb-14 pt-[9rem] sm:px-8 sm:pb-16 sm:pt-[10.5rem]">
          <div className="max-w-[42rem]">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">
              About the agency
            </p>
            <h1 className="mt-4 font-display text-[2.4rem] leading-[1.05] tracking-display text-bone sm:text-[3.2rem]">
              A small agency that knows
              <span className="block text-gold">its own island.</span>
            </h1>
            <p className="mt-5 max-w-[36rem] text-[1rem] leading-[1.7] text-bone/65">
              {BRAND.name} {BRAND.suffix} has sold and let property from the
              Woodbrook office since 2009. Six agents, seven areas, and a rule
              that nobody lists a property they have not stood inside.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-bone-edge">
        <div className="mx-auto max-w-[82rem] px-5 py-10 sm:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
                  {fact.label}
                </dt>
                <dd className="tnum mt-2 font-display text-[1.9rem] leading-none tracking-display text-ink">
                  {fact.figure}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <h2 className="font-display text-[1.8rem] leading-tight tracking-display text-ink sm:text-[2.1rem]">
              Why we are careful about what goes on the books
            </h2>
            <div aria-hidden className="mt-5 h-px w-16 bg-gold" />
            <div className="mt-6 flex flex-col gap-4 text-[0.98rem] leading-[1.75] text-ink-mute">
              <p>
                Most property in Trinidad and Tobago is still sold through a
                photograph on social media and a number in a caption. It works
                until a buyer asks what the floor area is, whether the tank is
                connected, or what the neighbours paid last year.
              </p>
              <p>
                We built the agency around answering those questions before they
                are asked. Every listing here carries measured floor area,
                photographs taken on a real camera, and a price an agent is
                prepared to defend against comparable sales.
              </p>
              <p>
                That makes the list shorter than it could be. It also means a
                viewing is rarely a wasted afternoon.
              </p>
            </div>
          </div>

          {/* A genuine sequence — each step depends on the one before — which
              is what earns the numbering. */}
          <ol className="flex flex-col">
            {PROCESS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-5 border-b border-bone-edge py-6 first:pt-0 last:border-b-0"
              >
                <span
                  aria-hidden
                  className="tnum shrink-0 font-display text-[1.1rem] leading-none text-gold-deep"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.2rem] leading-snug tracking-display text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.94rem] leading-[1.7] text-ink-mute">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-bone-edge bg-bone-deep/40">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="max-w-[36rem]">
              <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
                Who you would be dealing with
              </h2>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-mute">
                Six agents, each responsible for their own files from listing
                through to closing.
              </p>
            </div>
            <Link
              href="/our-agents"
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-[0.85rem] text-gold-deep transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
            >
              Meet the team
              <span
                aria-hidden
                className="transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                <svg width="16" height="12" viewBox="0 0 16 12">
                  <path
                    d="M1 6h13M9.5 1l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
            </Link>
          </div>

          <ul className="mt-8 grid gap-x-6 gap-y-6 xs:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={'/our-agents/' + agent.slug}
                  className="group flex items-center gap-4"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-bone-edge">
                    <Image
                      src={agent.image}
                      alt=""
                      fill
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      sizes="56px"
                      className="object-cover [object-position:50%_18%]"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[1rem] tracking-display text-ink transition-colors duration-300 ease-out group-hover:text-gold-deep">
                      {agent.name}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] text-ink-mute">
                      {agent.role}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[82rem] px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-6 rounded-sm border border-bone-edge bg-bone p-7 shadow-raise sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[36rem]">
            <h2 className="font-display text-[1.6rem] leading-tight tracking-display text-ink sm:text-[1.9rem]">
              Come and see us in Woodbrook
            </h2>
            <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-mute">
              {BRAND.address}. Open weekdays, and Saturday mornings by
              appointment.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-sm bg-ink px-5 py-3 text-[0.9rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
            >
              Contact the office
            </Link>
            <a
              href={'tel:' + BRAND.phone.replace(/[^+\d]/g, '')}
              className="rounded-sm border border-ink/15 px-5 py-3 text-[0.9rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/30 hover:bg-bone-deep active:translate-y-px"
            >
              {BRAND.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
