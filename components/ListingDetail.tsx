'use client';

import Link from 'next/link';
import { useListingsStore, useStoreHydrated } from '@/lib/store';
import { getRelatedListings } from '@/lib/listings';
import { formatDate, formatPrice, specLedger } from '@/lib/format';
import Gallery from './Gallery';
import ContactAgent from './ContactAgent';
import ListingCard from './ListingCard';
import StatusPill from './StatusPill';
import SaveButton from './SaveButton';
import LocationMap from './LocationMap';

export default function ListingDetail({ slug }: { slug: string }) {
  const listings = useListingsStore((s) => s.listings);
  const hydrated = useStoreHydrated();
  const listing = listings.find((l) => l.slug === slug);

  // On a hard reload of a listing created in /admin, the slug is not in the
  // seed data until sessionStorage is read back. Waiting avoids flashing the
  // "no longer on the books" notice at a property that does exist.
  if (!listing && !hydrated) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  // Reachable when a listing is deleted in /admin while its page is open.
  if (!listing) {
    return (
      <div className="mx-auto max-w-[40rem] px-5 pb-24 pt-40 text-center sm:px-8">
        <h1 className="font-display text-[2rem] tracking-display text-ink">
          This listing is no longer on the books
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-mute">
          It was removed from the catalogue. The rest of the portfolio is still
          available.
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-sm bg-ink px-5 py-3 text-[0.88rem] text-bone transition-transform duration-200 ease-out active:translate-y-px"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  const specs = specLedger(listing);
  const related = getRelatedListings(listing, listings, 3);

  return (
    <article className="mx-auto max-w-[82rem] px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
      <nav aria-label="Breadcrumb" className="mb-6 text-[0.78rem] text-ink-mute">
        <Link
          href="/"
          className="transition-colors duration-200 ease-out hover:text-ink"
        >
          Listings
        </Link>
        <span aria-hidden className="px-2 text-ink-faint">
          /
        </span>
        <span className="text-ink-soft">{listing.region}</span>
      </nav>

      <header className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={listing.status} className="ring-1 ring-bone-edge" />
            <span className="text-[0.75rem] uppercase tracking-[0.18em] text-gold-deep sm:text-[0.7rem]">
              {listing.propertyType} for {listing.listingType}
            </span>
          </div>
          <h1 className="mt-3 max-w-[28ch] font-display text-[2.1rem] leading-[1.08] tracking-display text-ink sm:text-[2.7rem]">
            {listing.title}
          </h1>
          <p className="mt-2 text-[0.95rem] text-ink-mute">
            {listing.location}, {listing.region}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="tnum font-display text-[1.9rem] tracking-display text-ink sm:text-[2.2rem]">
            {formatPrice(listing)}
          </p>
          <SaveButton id={listing.id} title={listing.title} variant="inline" />
        </div>
      </header>

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_21rem] lg:gap-16">
        <div className="min-w-0">
          {/* The spec ledger at full width — the printed-sheet stat row that
              recurs on every card and in the admin table. */}
          <dl className="ledger border-b border-bone-edge">
            {specs.map((spec) => (
              <div key={spec.label} className="flex-1 px-4 py-4 first:pl-0">
                <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.62rem]">
                  {spec.label}
                </dt>
                <dd className="tnum mt-1 font-display text-[1.25rem] text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="font-display text-[1.3rem] tracking-display text-ink">
              About this property
            </h2>
            <p className="mt-3 max-w-[68ch] text-[1rem] leading-[1.75] text-ink-soft">
              {listing.description}
            </p>
            <p className="mt-4 text-[0.82rem] text-ink-faint">
              Listed {formatDate(listing.dateListed)}
              {listing.yearBuilt ? ' · Built ' + listing.yearBuilt : ''}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-[1.3rem] tracking-display text-ink">
              Amenities
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-0 sm:grid-cols-2">
              {listing.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-2.5 border-b border-bone-edge py-3 text-[0.92rem] text-ink-soft"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    aria-hidden
                    className="shrink-0 text-gold-deep"
                  >
                    <path
                      d="M2.5 7l2.8 2.8L10.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-[1.3rem] tracking-display text-ink">
              Location
            </h2>
            <div className="mt-4">
              {listing.coords ? (
                <LocationMap
                  lat={listing.coords.lat}
                  lng={listing.coords.lng}
                  location={listing.location}
                  region={listing.region}
                />
              ) : (
                <MapPlate location={listing.location} region={listing.region} />
              )}
            </div>
          </section>
        </div>

        {/* Sticky summary — price, specs and the enquiry form travel with the
            reader down a long page. */}
        <aside className="lg:sticky lg:top-[6.5rem] lg:h-fit">
          <div className="rounded-sm border border-bone-edge bg-bone-deep/60 p-6 shadow-raise">
            <ContactAgent listing={listing} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-bone-edge pt-10">
          <h2 className="font-display text-[1.5rem] tracking-display text-ink">
            Also in {listing.region}
          </h2>
          <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/**
 * Map placeholder. A styled plate with a plausible survey grid rather than a
 * live map API — the demo needs to show where a map goes, not geocode T&T.
 */
function MapPlate({ location, region }: { location: string; region: string }) {
  return (
    <div className="relative mt-4 aspect-[16/7] overflow-hidden rounded-sm border border-bone-edge bg-sage-wash">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-sage/45"
        preserveAspectRatio="none"
        viewBox="0 0 320 140"
      >
        <defs>
          <pattern id="survey" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0v20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="140" fill="url(#survey)" />
        <path
          d="M0 96 C64 84 96 62 148 58 C206 54 250 34 320 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M118 140 L132 70 L188 44 L214 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span
          aria-hidden
          className="mx-auto block h-3 w-3 rounded-full bg-gold ring-4 ring-gold/25"
        />
        <p className="mt-3 font-display text-[1.05rem] tracking-display text-ink">
          {location}
        </p>
        <p className="text-[0.76rem] uppercase tracking-[0.16em] text-ink-mute">
          {region}
        </p>
      </div>
    </div>
  );
}
