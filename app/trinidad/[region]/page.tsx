import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getAgents } from '@/lib/agents';
import { allRegionSlugs, regionFromSlug, regionSlug, regionStats } from '@/lib/regions';
import { formatTTD } from '@/lib/format';
import { REGIONS } from '@/lib/filters';
import {
  abs,
  breadcrumbSchema,
  itemListSchema,
  jsonLd,
  ogImage,
  shareImage,
  SITE_NAME,
} from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import ListingCard from '@/components/ListingCard';
import AgentCard from '@/components/AgentCard';

/**
 * A region landing page — the piece that makes the catalogue findable.
 *
 * Seven of these are generated from the regions already present in the listing
 * data. They exist because search happens by place: "houses for sale in
 * Chaguanas", not "property portal". A query string on /buy cannot rank for
 * that, because Google indexes URLs, not filter state.
 *
 * A server component, so the whole page is in the HTML a crawler receives.
 * /buy and /rent are client-rendered (they own filter state), which is right
 * for browsing and wrong for indexing — this is the crawlable counterpart.
 *
 * Everything on the page is derived from real listings. No invented area copy:
 * the neighbourhood list, the counts, the price range and the agents are all
 * facts about the catalogue, which is what separates this from the thin
 * doorway pages that get sites penalised.
 */

export function generateStaticParams() {
  return allRegionSlugs().map((region) => ({ region }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region: slug } = await params;
  const region = regionFromSlug(slug);
  if (!region) return {};

  const stats = regionStats(MOCK_LISTINGS, region);
  const where = stats.localities.slice(0, 4).join(', ');

  const title = 'Property for sale & rent in ' + region;
  const description =
    stats.total > 0
      ? `${stats.total} ${stats.total === 1 ? 'property' : 'properties'} in ${region}` +
        (where ? ` — ${where}.` : '.') +
        ` ${stats.forSale} for sale, ${stats.forRent} to rent, priced in TTD. Licensed agents, accompanied viewings.`
      : `Houses, apartments and land in ${region}, Trinidad & Tobago. Speak to a licensed agent about what is coming to market.`;

  const path = '/trinidad/' + slug;

  // A photograph from this region, so a shared area link shows the place
  // rather than a blank card. Falls back to nothing when the region is empty,
  // which is honest — better no image than one from the wrong end of the
  // island.
  const hero = MOCK_LISTINGS.find((l) => l.region === region)?.images[0];

  return {
    title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: {
      title: title + ' · ' + SITE_NAME,
      description,
      url: abs(path),
      siteName: SITE_NAME,
      locale: 'en_TT',
      type: 'website',
      ...(hero
        ? { images: [ogImage(shareImage(hero), 'Property in ' + region)] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title + ' · ' + SITE_NAME,
      description,
      ...(hero ? { images: [shareImage(hero)] } : {}),
    },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const region = regionFromSlug(slug);
  if (!region) notFound();

  const listings = MOCK_LISTINGS.filter((l) => l.region === region);
  const stats = regionStats(MOCK_LISTINGS, region);

  // Agents whose territory names this region. Territories are free text, so
  // the match is loose on purpose — "North-West Trinidad" should also catch an
  // agent who lists "Port of Spain".
  const agents = getAgents().filter((a) =>
    a.territories.some(
      (t) =>
        t.toLowerCase().includes(region.toLowerCase()) ||
        region.toLowerCase().includes(t.toLowerCase()),
    ),
  );

  const sale = listings.filter((l) => l.listingType === 'Sale');
  const rent = listings.filter((l) => l.listingType === 'Rent');

  const intro =
    stats.total > 0
      ? `${stats.total} ${stats.total === 1 ? 'property' : 'properties'} on the books in ${region}` +
        (stats.localities.length
          ? ', across ' + formatList(stats.localities) + '.'
          : '.') +
        ' Every listing is measured, photographed and priced in TTD.'
      : `We are not holding stock in ${region} today. Tell an agent what you are looking for and you will hear first when something comes to market.`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Trinidad & Tobago', path: '/buy' },
          { name: region, path: '/trinidad/' + slug },
        ]),
      )} />
      {listings.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(
          itemListSchema(listings, '/trinidad/' + slug),
        )} />
      )}

      <PageHeader
        eyebrow={region}
        title={'Property in ' + region}
        intro={intro}
        meta={
          stats.minPrice !== null && stats.maxPrice !== null
            ? (sale.length ? 'Sale prices' : 'Rents') +
              ' from ' +
              formatTTD(stats.minPrice) +
              ' to ' +
              formatTTD(stats.maxPrice)
            : undefined
        }
      />

      {/* The facts about this region, as a ledger. Derived, not written. */}
      {stats.total > 0 && (
        <section className="border-b border-bone-edge bg-bone-deep/40">
          <div className="mx-auto max-w-[82rem] px-5 py-8 sm:px-8">
            <dl className="ledger border-b border-bone-edge">
              {/* A zero cell is a weak first impression and tells the reader
                  nothing. A region with no sales stock simply does not show a
                  For sale column. */}
              {stats.forSale > 0 && (
                <div className="flex-1 px-2 py-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                    For sale
                  </dt>
                  <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                    {stats.forSale}
                  </dd>
                </div>
              )}
              {stats.forRent > 0 && (
                <div className="flex-1 px-2 py-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                    To rent
                  </dt>
                  <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                    {stats.forRent}
                  </dd>
                </div>
              )}
              <div className="flex-1 px-2 py-4">
                <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                  {stats.localities.length === 1 ? 'Area' : 'Areas'}
                </dt>
                <dd className="tnum mt-1.5 font-display text-[1.5rem] leading-none text-ink">
                  {stats.localities.length}
                </dd>
              </div>
            </dl>

            {stats.propertyTypes.length > 0 && (
              <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-mute">
                Currently listed here:{' '}
                <span className="text-ink">{formatList(stats.propertyTypes)}</span>.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-14">
        {listings.length > 0 ? (
          <>
            {sale.length > 0 && (
              <>
                <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
                  For sale in {region}
                </h2>
                <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {sale.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={i < 3} />
                  ))}
                </div>
              </>
            )}

            {rent.length > 0 && (
              <>
                <h2
                  className={
                    'font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem] ' +
                    (sale.length > 0 ? 'mt-16' : '')
                  }
                >
                  To rent in {region}
                </h2>
                <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {rent.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={sale.length === 0 && i < 3} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="rounded-sm border border-dashed border-bone-edge px-6 py-16 text-center">
            <h2 className="font-display text-[1.5rem] tracking-display text-ink">
              Nothing on the books in {region} today
            </h2>
            <p className="mx-auto mt-2.5 max-w-[34rem] text-[0.94rem] leading-[1.7] text-ink-mute">
              Stock here moves before it reaches the portals. Tell an agent what
              you are after and you will hear first.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center rounded-sm bg-ink px-5 text-[0.88rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
              >
                Register what you want
              </Link>
              <Link
                href="/buy"
                className="inline-flex min-h-11 items-center rounded-sm border border-bone-edge px-5 text-[0.88rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/25 hover:bg-bone-deep active:translate-y-px"
              >
                Everything for sale
              </Link>
            </div>
          </div>
        )}
      </section>

      {agents.length > 0 && (
        <section className="border-t border-bone-edge bg-bone-deep/40">
          <div className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-14">
            <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
              {agents.length === 1 ? 'Your agent' : 'Agents'} for {region}
            </h2>
            <p className="mt-2.5 max-w-[38rem] text-[0.95rem] leading-[1.7] text-ink-mute">
              {agents.length === 1
                ? 'This is who holds the files here.'
                : 'These are the agents who work this area and hold the files here.'}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 lg:grid-cols-4">
              {agents.slice(0, 4).map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal links to the sibling regions. This is what turns seven
          isolated pages into a crawlable cluster, and it gives a visitor the
          obvious next move when their area has no stock. */}
      <section className="border-t border-bone-edge">
        <div className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-14">
          <h2 className="font-display text-[1.35rem] tracking-display text-ink">
            Other areas
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {REGIONS.filter((r) => r !== region).map((r) => (
              <li key={r}>
                <Link
                  href={'/trinidad/' + regionSlug(r)}
                  className="inline-flex min-h-11 items-center rounded-sm border border-bone-edge bg-bone px-4 text-[0.85rem] text-ink-mute transition-[background-color,border-color,color] duration-200 ease-out hover:border-ink/25 hover:text-ink desk:min-h-0 sm:py-2"
                >
                  {r}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/** "A, B and C" — an Oxford-comma-free list for prose. */
function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
