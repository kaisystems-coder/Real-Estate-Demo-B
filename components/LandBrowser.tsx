'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useListingsStore } from '@/lib/store';
import { allRegions, type SortKey } from '@/lib/filters';
import type { SaleOrRent } from '@/types/listing';
import ListingCard from './ListingCard';
import PageHeader from './PageHeader';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
];

/**
 * Land gets its own browser rather than a filter inside /buy.
 *
 * A parcel has no bedrooms, no bathrooms and no floor area, so most of the
 * standard filter rail would sit there greyed out or, worse, silently return
 * nothing. What a land buyer actually filters on is where it is, whether it is
 * for sale or lease, and how much of it there is — so that is the whole
 * control set.
 */
export default function LandBrowser() {
  const listings = useListingsStore((s) => s.listings);
  const [region, setRegion] = useState('');
  const [tenure, setTenure] = useState<SaleOrRent | ''>('');
  const [sort, setSort] = useState<SortKey>('newest');

  const parcels = useMemo(
    () => listings.filter((l) => l.propertyType === 'Land'),
    [listings],
  );

  const regions = useMemo(() => {
    const present = new Set(parcels.map((p) => p.region));
    return allRegions(listings).filter((r) => present.has(r));
  }, [parcels, listings]);

  const results = useMemo(() => {
    const out = parcels.filter((l) => {
      if (region && l.region !== region) return false;
      if (tenure && l.listingType !== tenure) return false;
      return true;
    });
    const sorted = [...out];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime(),
        );
    }
    return sorted;
  }, [parcels, region, tenure, sort]);

  const clearAll = () => {
    setRegion('');
    setTenure('');
  };

  const filtered = region !== '' || tenure !== '';

  return (
    <>
      <PageHeader
        eyebrow="Land"
        title="Parcels, plots and acreage"
        intro="Land is bought on different terms to a house. No floor area, no fixtures, and its own stamp duty schedule that exempts the first $450,000. Everything here is surveyed, with the plan on file."
        meta={
          parcels.length +
          (parcels.length === 1 ? ' parcel' : ' parcels') +
          ' on the books'
        }
      />

      <div className="sticky top-[4.5rem] z-sticky border-b border-bone-edge bg-bone/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[82rem] flex-wrap items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-8 sm:py-3">
          <label htmlFor="land-region" className="sr-only">
            Filter parcels by area
          </label>
          <select
            id="land-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="min-h-11 rounded-sm border border-bone-edge bg-bone px-3 text-[16px] text-ink transition-colors duration-200 ease-out hover:border-ink/25 desk:min-h-0 sm:py-2 desk:text-[0.8rem]"
          >
            <option value="">Anywhere in T&amp;T</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label htmlFor="land-tenure" className="sr-only">
            Filter parcels by sale or lease
          </label>
          <select
            id="land-tenure"
            value={tenure}
            onChange={(e) => setTenure(e.target.value as SaleOrRent | '')}
            className="min-h-11 rounded-sm border border-bone-edge bg-bone px-3 text-[16px] text-ink transition-colors duration-200 ease-out hover:border-ink/25 desk:min-h-0 sm:py-2 desk:text-[0.8rem]"
          >
            <option value="">Sale or lease</option>
            <option value="Sale">For sale</option>
            <option value="Rent">For lease</option>
          </select>

          <p className="tnum hidden shrink-0 text-[0.8rem] text-ink-mute sm:block">
            {results.length} {results.length === 1 ? 'parcel' : 'parcels'}
          </p>

          <div className="ml-auto flex items-center gap-2">
            {filtered && (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-11 text-[0.8rem] text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
              >
                Clear
              </button>
            )}
            <label htmlFor="land-sort" className="sr-only">
              Sort parcels
            </label>
            <select
              id="land-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 rounded-sm border border-bone-edge bg-bone px-3 text-[16px] text-ink-soft transition-colors duration-200 ease-out hover:border-ink/25 desk:min-h-0 sm:py-2 desk:text-[0.8rem]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section
        aria-label="Land listings"
        className="mx-auto max-w-[82rem] px-5 py-10 sm:px-8"
      >
        {results.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3"
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
              No parcels match that
            </h2>
            <p className="mx-auto mt-2 max-w-[28rem] text-[0.92rem] leading-relaxed text-ink-mute">
              {parcels.length === 0
                ? 'There is no land on the books at the moment. An agent can tell you what is coming up before it is listed.'
                : 'Nothing in that area on those terms. Widen the search, or ask an agent what is coming up.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filtered && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-sm bg-ink px-5 py-2.5 text-[0.85rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
                >
                  Clear filters
                </button>
              )}
              <Link
                href="/contact"
                className="rounded-sm border border-ink/15 px-5 py-2.5 text-[0.85rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/30 hover:bg-bone-deep active:translate-y-px"
              >
                Ask an agent
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Land carries its own duty schedule, and the difference is large enough
          that a buyer who assumes the residential bands will be wrong by
          thousands. */}
      <section className="border-t border-bone-edge bg-bone-deep/40">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
                Buying land is not buying a house
              </h2>
              <div aria-hidden className="mt-5 h-px w-16 bg-gold" />
              <div className="mt-6 flex max-w-[38rem] flex-col gap-4 text-[0.96rem] leading-[1.75] text-ink-mute">
                <p>
                  A parcel with no dwelling on it is exempt from stamp duty up to
                  $450,000, then charged at 2%, 5% and 7% as the price rises.
                  That is a different schedule to a house and land, where the
                  exemption runs to $850,000.
                </p>
                <p>
                  The first-time buyer relief that wipes out duty on a home up to
                  $2,000,000 does not extend to a bare parcel, so budget for the
                  duty from the start.
                </p>
                <p>
                  Before an offer, check the approvals. Town and Country planning
                  permission, a current cadastral survey, and whether services
                  reach the boundary decide what the land is actually worth.
                </p>
              </div>
              <Link
                href="/mortgages"
                className="mt-7 inline-flex min-h-11 items-center rounded-sm bg-ink px-5 text-[0.88rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
              >
                Work out the duty on a parcel
              </Link>
            </div>

            <div className="rounded-sm border border-bone-edge bg-bone p-6 shadow-raise">
              <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-mute">
                Stamp duty, land only
              </h3>
              <dl className="mt-4">
                {[
                  { band: 'Up to $450,000', rate: 'Nil' },
                  { band: '$450,001 to $650,000', rate: '2%' },
                  { band: '$650,001 to $850,000', rate: '5%' },
                  { band: 'Above $850,000', rate: '7%' },
                ].map((row) => (
                  <div
                    key={row.band}
                    className="flex items-baseline justify-between gap-4 border-b border-bone-edge py-3 last:border-b-0"
                  >
                    <dt className="tnum text-[0.9rem] text-ink-soft">{row.band}</dt>
                    <dd className="tnum text-[0.95rem] text-ink">{row.rate}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-faint">
                Charged in slices: each rate applies only to the portion of the
                price inside its band. Rates published by the Board of Inland
                Revenue.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
