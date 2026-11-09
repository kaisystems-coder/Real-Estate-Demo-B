'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { useListingsStore } from '@/lib/store';
import {
  applyFilters,
  defaultFilters,
  PRICE_BOUNDS,
  REGIONS,
  type Filters,
} from '@/lib/filters';
import type { ListingType, SaleOrRent } from '@/types/listing';
import { PROPERTY_TYPES, typesForSector } from '@/types/listing';
import FilterBar from './FilterBar';
import ListingCard from './ListingCard';
import PageHeader from './PageHeader';
import ActiveFilters from './ActiveFilters';

/**
 * The full browsing surface, shared by /buy and /rent.
 *
 * The mode is fixed by the route rather than chosen in the bar: a visitor on
 * /rent is looking for rentals, and a Sale/Rent toggle there would silently
 * contradict the URL and the page they clicked. Switching modes is a
 * navigation, so the bar links across instead of setting state.
 */
export default function ListingsBrowser(props: {
  mode: SaleOrRent;
  title: string;
  intro: string;
}) {
  // useSearchParams opts the tree into client-side rendering, which Next
  // requires a Suspense boundary around. The fallback is the same header the
  // page settles on, so nothing jumps when the query resolves.
  return (
    <Suspense fallback={<BrowserFallback {...props} />}>
      <Browser {...props} />
    </Suspense>
  );
}

function BrowserFallback({
  mode,
  title,
  intro,
}: {
  mode: SaleOrRent;
  title: string;
  intro: string;
}) {
  return (
    <PageHeader
      eyebrow={mode === 'Sale' ? 'Properties for sale' : 'Properties to rent'}
      title={title}
      intro={intro}
    />
  );
}

/**
 * The filters a URL asks for, applied over the route's defaults.
 *
 * The hero search hands its choices across as query params rather than
 * pushing them into a store, so the resulting URL is a real, shareable search.
 * Every value is validated against the data's own vocabulary before it is
 * trusted: a hand-edited ?region=Atlantis must fall back to "anywhere" rather
 * than filter the grid down to nothing with no visible cause.
 *
 * This seeds state once. From here the browser owns its filters, so changing a
 * control does not rewrite the URL on every interaction.
 */
function seedFilters(
  mode: SaleOrRent,
  params: ReturnType<typeof useSearchParams>,
): Filters {
  const base = defaultFilters(mode);

  const region = params.get('region');
  if (region && (REGIONS as readonly string[]).includes(region)) {
    base.region = region;
  }

  // "use=commercial" is a sector, not a type. It must be read before the type
  // below, because the sector decides which types are legal.
  if (params.get('use') === 'commercial') base.sector = 'commercial';

  const type = params.get('type');
  if (type && (PROPERTY_TYPES as string[]).includes(type)) {
    const asType = type as ListingType;
    // Land is reachable only through /land, and a type from the other sector
    // would filter to nothing — so the sector follows the type it was given.
    if (asType !== 'Land') {
      if (!typesForSector(base.sector).includes(asType)) {
        base.sector = asType === 'Commercial' ? 'commercial' : 'residential';
      }
      base.propertyTypes = [asType];
    }
  }

  const max = Number(params.get('max'));
  const bounds = PRICE_BOUNDS[mode];
  if (Number.isFinite(max) && max > bounds.min && max <= bounds.max) {
    base.priceMax = max;
  }

  // Beds and baths filter as minimums. Both controls in the hero are capped at
  // what the catalogue holds, but a hand-edited URL is not, so clamp rather
  // than trust: ?beds=99 should show the largest homes, not an empty grid.
  const beds = Number(params.get('beds'));
  if (Number.isInteger(beds) && beds > 0) base.beds = Math.min(beds, 5);

  const baths = Number(params.get('baths'));
  if (Number.isInteger(baths) && baths > 0) base.baths = Math.min(baths, 4);

  return base;
}

function Browser({
  mode,
  title,
  intro,
}: {
  mode: SaleOrRent;
  title: string;
  intro: string;
}) {
  const searchParams = useSearchParams();
  const listings = useListingsStore((s) => s.listings);
  const [filters, setFilters] = useState<Filters>(() =>
    seedFilters(mode, searchParams),
  );
  // Seeded from ?q= so a search made on the landing page arrives intact, then
  // owned by this component — typing here must not rewrite the URL on every
  // keystroke.
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

  // Filtering ten listings through seven predicates is microseconds of work,
  // so it runs synchronously on every keystroke with no spinner or debounce.
  const results = useMemo(
    () => applyFilters(listings, { ...filters, listingType: mode }, query),
    [listings, filters, mode, query],
  );

  // Land has its own route and is excluded from /buy and /rent by the sector
  // predicate, so counting it here would advertise a property this page can
  // never show — the header said "6 for sale" above a grid that tops out at 5.
  const available = useMemo(
    () =>
      listings.filter(
        (l) => l.listingType === mode && l.propertyType !== 'Land',
      ).length,
    [listings, mode],
  );

  const clearAll = () => {
    setFilters(defaultFilters(mode));
    setQuery('');
  };

  return (
    <>
      <PageHeader
        eyebrow={mode === 'Sale' ? 'Properties for sale' : 'Properties to rent'}
        title={title}
        intro={intro}
        meta={
          available +
          (mode === 'Sale' ? ' for sale' : ' to rent') +
          ' across Trinidad & Tobago'
        }
        query={query}
        setQuery={setQuery}
        searchLabel={
          mode === 'Sale'
            ? 'Search properties for sale'
            : 'Search properties to rent'
        }
      />

      <div id="listings" className="scroll-mt-[9rem]">
        <FilterBar
          mode={mode}
          filters={filters}
          setFilters={setFilters}
          listings={listings}
          resultCount={results.length}
        />

        {/* Variant B: no side rail. The filters live in the pill bar above,
            so the grid takes the page's full width. */}
        <div className="mx-auto max-w-[82rem] px-5 py-10 sm:px-8">
          <section aria-label={mode === 'Sale' ? 'Properties for sale' : 'Properties to rent'}>
            <ActiveFilters
              filters={filters}
              setFilters={setFilters}
              resultCount={results.length}
            />

            {results.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {results.map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} priority={i < 3} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="rounded-sm border border-dashed border-bone-edge px-6 py-16 text-center">
                <h2 className="font-display text-[1.35rem] tracking-display text-ink">
                  Nothing matches that yet
                </h2>
                <p className="mx-auto mt-2 max-w-[28rem] text-[0.92rem] leading-relaxed text-ink-mute">
                  {query
                    ? 'No property matches "' + query + '" with these filters.'
                    : 'No property matches these filters.'}{' '}
                  Widen the price range or clear a filter to see more.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 rounded-sm bg-ink px-5 py-2.5 text-[0.85rem] text-bone transition-transform duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
