import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import CalculatorTabs from '@/components/finance/CalculatorTabs';
import { getAgentBySlug } from '@/lib/agents';

export const metadata: Metadata = {
  title: 'Mortgages & closing costs',
  description:
    'Work out a monthly mortgage instalment and estimate stamp duty, legal fees and closing costs on a Trinidad & Tobago property purchase.',
  alternates: { canonical: abs('/mortgages') },
  openGraph: {
    title: 'Mortgages & closing costs · ' + SITE_NAME,
    description:
      'Work out a monthly mortgage instalment and estimate stamp duty, legal fees and closing costs on a Trinidad & Tobago property purchase.',
    url: abs('/mortgages'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

/**
 * The stamp duty schedule, printed in full.
 *
 * A calculator that returns a figure without showing its workings asks to be
 * trusted. The table is the workings, and it is the reference buyers come back
 * for after the calculator has answered their first question.
 */
const DUTY_TABLE: { band: string; dwelling: string; land: string }[] = [
  { band: 'Up to $450,000', dwelling: 'Nil', land: 'Nil' },
  { band: '$450,001 to $650,000', dwelling: 'Nil', land: '2%' },
  { band: '$650,001 to $850,000', dwelling: 'Nil', land: '5%' },
  { band: '$850,001 to $1,250,000', dwelling: '3%', land: '7%' },
  { band: '$1,250,001 to $1,750,000', dwelling: '5%', land: '7%' },
  { band: 'Above $1,750,000', dwelling: '7.5%', land: '7%' },
];

export default function MortgagesPage() {
  const adviser = getAgentBySlug('kieron-baptiste');

  return (
    <>
      <PageHeader
        eyebrow="Mortgages & closing costs"
        title="Work out what the purchase actually costs"
        intro="Two calculators for the two questions every buyer asks. What the bank will want each month, and what has to be in hand on closing day. Figures in TTD, using the stamp duty bands in force in Trinidad and Tobago."
      />

      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-16">
        <CalculatorTabs />
      </section>

      <section className="border-t border-bone-edge bg-bone-deep/40">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* min-w-0 is load-bearing: the rates table below sets a 30rem
                min-width so its columns stay readable, and a grid child
                defaults to min-width:auto — so without this the 480px table
                stretched this whole column to 500px on a 320px phone and
                dragged the headings and copy off the right edge with it.
                The table still scrolls on its own inside its wrapper. */}
            <div className="min-w-0">
              <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
                Stamp duty, band by band
              </h2>
              <p className="mt-3 max-w-[36rem] text-[0.95rem] leading-[1.7] text-ink-mute">
                Duty is charged in slices. A rate applies only to the portion of
                the price inside its own band, so a $2,000,000 house does not
                attract 7.5% on the whole amount. These are the residential
                rates in force since October 2008.
              </p>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-left">
                  <caption className="sr-only">
                    Trinidad and Tobago residential stamp duty rates by price band
                  </caption>
                  <thead>
                    <tr className="border-b border-ink/15">
                      <th
                        scope="col"
                        className="py-2.5 pr-4 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint"
                      >
                        Portion of price
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 pr-4 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint"
                      >
                        House &amp; land
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint"
                      >
                        Land only
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUTY_TABLE.map((row) => (
                      <tr key={row.band} className="border-b border-bone-edge">
                        <th
                          scope="row"
                          className="tnum py-3 pr-4 text-[0.88rem] font-normal text-ink-soft"
                        >
                          {row.band}
                        </th>
                        <td className="tnum py-3 pr-4 text-[0.88rem] text-ink">
                          {row.dwelling}
                        </td>
                        <td className="tnum py-3 text-[0.88rem] text-ink">{row.land}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-5 text-[0.82rem] leading-relaxed text-ink-faint">
                Commercial and agricultural property is charged from the first
                dollar at 2%, 5% and 7%, with no exemption. Rates published by
                the Board of Inland Revenue.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-sm border border-bone-edge bg-bone p-6 shadow-raise">
                <h3 className="font-display text-[1.3rem] tracking-display text-ink">
                  First-time buyers
                </h3>
                <p className="mt-2.5 text-[0.92rem] leading-[1.7] text-ink-mute">
                  A first-time buyer pays no stamp duty on a residential house
                  and land valued up to $2,000,000. The threshold rose from
                  $1,500,000 under the Finance Act 2020 and has applied since
                  January 2021. Above the cap the ordinary bands apply to the
                  whole price, so a purchase just over it is worth structuring
                  carefully.
                </p>
              </div>

              <div className="rounded-sm border border-bone-edge bg-bone p-6 shadow-raise">
                <h3 className="font-display text-[1.3rem] tracking-display text-ink">
                  What else to budget for
                </h3>
                <ul className="mt-3 flex flex-col gap-2.5 text-[0.92rem] leading-relaxed text-ink-mute">
                  <li className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Conveyancing, usually 1.5% to 2.5% of the price.
                  </li>
                  <li className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    A valuation report the lender will insist on, typically
                    $1,500 to $4,000.
                  </li>
                  <li className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Stamp duty on the mortgage deed itself, above $450,000.
                  </li>
                  <li className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Life and property insurance, which most lenders require
                    before they disburse.
                  </li>
                </ul>
              </div>

              {adviser && (
                <div className="rounded-sm border border-ink/12 bg-ink p-6 text-bone">
                  <h3 className="font-display text-[1.3rem] tracking-display">
                    Rather have someone run the numbers?
                  </h3>
                  <p className="mt-2.5 text-[0.92rem] leading-[1.7] text-bone/65">
                    {adviser.name} came from the lending side and builds the
                    affordability case before an offer goes in.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <Link
                      href={'/our-agents/' + adviser.slug}
                      className="inline-flex min-h-11 items-center rounded-sm bg-gold px-4 text-[0.85rem] text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-bone active:translate-y-px"
                    >
                      Talk to {adviser.name.split(' ')[0]}
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-11 items-center rounded-sm border border-bone/25 px-4 text-[0.85rem] text-bone transition-[background-color,border-color,transform] duration-200 ease-out hover:border-bone hover:bg-bone/10 active:translate-y-px"
                    >
                      Contact the office
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
