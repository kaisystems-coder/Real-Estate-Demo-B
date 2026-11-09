import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ValuationForm from '@/components/ValuationForm';
import { BRAND } from '@/components/Logo';
import { getAgentBySlug } from '@/lib/agents';

export const metadata: Metadata = {
  title: 'Sell or rent out your property',
  description:
    'Free property valuations across Trinidad & Tobago, plus full management for landlords. Request a no-obligation valuation from a licensed agent.',
  alternates: { canonical: abs('/sell') },
  openGraph: {
    title: 'Sell or rent out your property · ' + SITE_NAME,
    description:
      'Free property valuations across Trinidad & Tobago, plus full management for landlords. Request a no-obligation valuation from a licensed agent.',
    url: abs('/sell'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

/**
 * The seller and landlord side of the business.
 *
 * The rest of the site helps a buyer find stock the agency already holds. This
 * page is where the stock comes from, and it is the half an Instagram page
 * cannot do: a qualified valuation request with an address, a price
 * expectation and a timeframe attached, arriving at the office instead of
 * being lost in a DM at 11pm.
 *
 * Services live here as sections rather than on their own route. An owner
 * deciding whether to instruct an agency is asking one question — "what do you
 * do for me, and what does it cost" — and splitting the answer across two
 * pages makes them navigate to finish reading it.
 */

/**
 * The sale process, in the order it happens.
 *
 * Numbered because this genuinely is a sequence — the valuation has to precede
 * the listing, which has to precede the offer — and an owner is trying to work
 * out how long the whole thing takes.
 */
const STEPS = [
  {
    n: '01',
    title: 'Valuation',
    timing: 'Within 3 working days',
    body: 'An agent visits, measures, photographs and compares against what has actually closed nearby in the last twelve months. You get a written figure and the evidence behind it, free, whether or not you go on to list with us.',
  },
  {
    n: '02',
    title: 'On the market',
    timing: 'Listed within a week',
    body: 'Professional photography, a floor plan and a written description, then the listing goes live here and out to our buyer register before it reaches the portals. Viewings are accompanied — an agent is present at every one.',
  },
  {
    n: '03',
    title: 'Offer to closing',
    timing: 'Typically 8 to 12 weeks',
    body: 'We qualify every offer against the buyer’s pre-approval before bringing it to you, then hold the chain together through valuation, searches and the deed of conveyance until the keys change hands.',
  },
];

/** What the agency does beyond selling. The recurring-revenue half. */
const SERVICES = [
  {
    title: 'Property management',
    lede: 'For landlords who would rather not take the 6am call about a burst tank.',
    points: [
      'Tenant sourcing, referencing and employment verification',
      'Rent collection, arrears chasing and monthly statements',
      'Repairs coordinated through vetted contractors',
      'Quarterly inspections with a photographic report',
    ],
    rate: '8%',
    rateLabel: 'of monthly rent',
  },
  {
    title: 'Valuations & advisory',
    lede: 'A defensible written figure, for far more than a sale.',
    points: [
      'Bank-ready valuation reports for mortgage applications',
      'Probate, matrimonial and partnership settlements',
      'Property tax and Valuation Division return support',
      'Portfolio and development-site appraisal',
    ],
    rate: 'From $2,500',
    rateLabel: 'per report',
  },
];

export default function SellPage() {
  const valuer = getAgentBySlug('marcus-alleyne');

  return (
    <>
      <PageHeader
        eyebrow="Sell or rent out"
        title="Find out what your property is worth"
        intro="A free, written valuation from a licensed agent who has actually walked the street it sits on. No obligation to list with us, and no charge if you decide not to."
      />

      {/* The form leads. An owner arriving here has one job in mind, and making
          them scroll past a pitch to reach it loses the ones who were ready. */}
      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <ValuationForm />

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div>
              <h2 className="font-display text-[1.5rem] tracking-display text-ink">
                Why owners instruct us
              </h2>

              {/* The ledger, carrying the agency's record. Same hairline system
                  as the spec row on a listing card — this is the agency's own
                  spec sheet. */}
              <dl className="ledger mt-5 border-b border-bone-edge text-center">
                <div className="flex flex-1 flex-col justify-between px-2 py-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                    First viewing in
                  </dt>
                  <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                    9 days
                  </dd>
                </div>
                <div className="flex flex-1 flex-col justify-between px-2 py-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                    Sold near asking
                  </dt>
                  <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                    9 in 10
                  </dd>
                </div>
                <div className="flex flex-1 flex-col justify-between px-2 py-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                    Buyers on our list
                  </dt>
                  <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                    600+
                  </dd>
                </div>
              </dl>

              {/* TODO: replace with the agency's own figures before any pitch.
                  These are plausible placeholders, not claims. Deliberately
                  plain-language: "of asking achieved" is UK agency jargon that
                  a Trinidadian owner has no reason to parse, and the numbers
                  are scaled to a single-island agency rather than a national
                  chain. */}
              <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-faint">
                Across homes we sold in Trinidad and Tobago over the last two
                years.
              </p>
            </div>

            <div className="rounded-sm border border-bone-edge bg-bone-deep/60 p-6">
              <h3 className="font-display text-[1.2rem] tracking-display text-ink">
                Rather talk first?
              </h3>
              <p className="mt-2 text-[0.9rem] leading-[1.7] text-ink-mute">
                Plenty of owners want a number before they want a visit. Send a
                message and an agent will give you a range over the phone.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href={
                    'https://wa.me/' +
                    BRAND.whatsapp +
                    '?text=' +
                    encodeURIComponent(
                      "Hello " +
                        BRAND.name +
                        ' ' +
                        BRAND.suffix +
                        ", I'd like a rough idea of what my property is worth.",
                    )
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-4 text-[0.85rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23z" />
                  </svg>
                  WhatsApp us
                </a>
                <a
                  href={'tel:' + BRAND.phone.replace(/[^+\d]/g, '')}
                  className="inline-flex min-h-11 items-center rounded-sm border border-bone-edge px-4 text-[0.85rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/25 hover:bg-bone active:translate-y-px"
                >
                  {BRAND.phone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* How it runs. */}
      <section className="border-y border-bone-edge bg-bone-deep/40">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-[36rem]">
            <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
              From valuation to keys
            </h2>
            <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-mute">
              Three stages, and an agent who stays on the file through all of
              them rather than handing you to an administrator after the
              listing goes live.
            </p>
          </div>

          <ol className="mt-9 grid gap-px overflow-hidden rounded-sm border border-bone-edge bg-bone-edge md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="flex flex-col bg-bone p-6 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    aria-hidden
                    className="tnum font-display text-[0.95rem] text-gold-deep"
                  >
                    {step.n}
                  </span>
                  <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
                    {step.timing}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[1.3rem] tracking-display text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.9rem] leading-[1.7] text-ink-mute">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services. Sections on this page rather than a route of their own.
          scroll-mt clears the fixed header when arriving via #manage. */}
      <section
        id="manage"
        className="mx-auto max-w-[82rem] scroll-mt-24 px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="max-w-[36rem]">
          <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
            Beyond the sale
          </h2>
          <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-mute">
            Two services owners come back for once the transaction is done.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col rounded-sm border border-bone-edge bg-bone p-6 shadow-raise sm:p-8"
            >
              <h3 className="font-display text-[1.35rem] tracking-display text-ink">
                {service.title}
              </h3>
              <p className="mt-2 text-[0.92rem] leading-[1.7] text-ink-mute">
                {service.lede}
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-[0.9rem] leading-relaxed text-ink-mute"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold"
                    />
                    {point}
                  </li>
                ))}
              </ul>

              {/* The rate, set on the ledger rule — the same printed-sheet
                  language the settlement statement uses for a total. */}
              <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-4">
                <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
                  {service.rateLabel}
                </span>
                <span className="tnum font-display text-[1.4rem] leading-none text-ink">
                  {service.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commission, stated plainly. The question every owner asks third and
          almost no agency site answers. */}
      <section className="border-t border-bone-edge bg-bone-deep/40">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
                What it costs to sell
              </h2>
              <p className="mt-3 max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink-mute">
                Commission is charged on the achieved sale price and is payable
                only on completion. If the property does not sell, you owe
                nothing — the valuation, the photography and the marketing are
                ours to carry.
              </p>

              <dl className="mt-7 border-t border-ink/15">
                <div className="flex items-start justify-between gap-4 border-b border-bone-edge py-4">
                  <dt className="text-[0.9rem] text-ink-soft">
                    Sale commission
                    <span className="block text-[0.78rem] text-ink-faint">
                      Plus VAT, on completion
                    </span>
                  </dt>
                  <dd className="tnum shrink-0 font-display text-[1.5rem] leading-none text-ink">
                    3%
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-bone-edge py-4">
                  <dt className="text-[0.9rem] text-ink-soft">
                    Letting, tenant-find only
                    <span className="block text-[0.78rem] text-ink-faint">
                      One-off, on signature
                    </span>
                  </dt>
                  <dd className="tnum shrink-0 font-display text-[1.5rem] leading-none text-ink">
                    1 month
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-bone-edge py-4">
                  <dt className="text-[0.9rem] text-ink-soft">
                    Valuation
                    <span className="block text-[0.78rem] text-ink-faint">
                      Pre-listing, no obligation
                    </span>
                  </dt>
                  <dd className="shrink-0 font-display text-[1.5rem] leading-none text-sage-deep">
                    Free
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-[0.78rem] leading-relaxed text-ink-faint">
                Indicative rates for this demonstration. Commission is agreed in
                writing before a property goes on the market.
              </p>
            </div>

            {valuer && (
              <div className="self-start rounded-sm border border-ink/12 bg-ink p-6 text-bone sm:p-8">
                <h3 className="font-display text-[1.35rem] tracking-display">
                  Who values your property
                </h3>
                <p className="mt-2.5 text-[0.92rem] leading-[1.7] text-bone/65">
                  {valuer.name} still walks every listing above four million
                  personally, and spent a decade valuing commercial property for
                  a regional bank before opening the office.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link
                    href={'/our-agents/' + valuer.slug}
                    className="inline-flex min-h-11 items-center rounded-sm bg-gold px-4 text-[0.85rem] text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-bone active:translate-y-px"
                  >
                    Meet {valuer.name.split(' ')[0]}
                  </Link>
                  <Link
                    href="/our-agents"
                    className="inline-flex min-h-11 items-center rounded-sm border border-bone/25 px-4 text-[0.85rem] text-bone transition-[background-color,border-color,transform] duration-200 ease-out hover:border-bone hover:bg-bone/10 active:translate-y-px"
                  >
                    The whole team
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
