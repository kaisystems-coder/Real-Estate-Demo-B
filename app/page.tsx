'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useListingsStore } from '@/lib/store';
import { getAgents } from '@/lib/agents';
import { REGIONS } from '@/lib/filters';
import { regionSlug, regionStats } from '@/lib/regions';
import { BLUR_DATA_URL, formatPrice, specLedger } from '@/lib/format';
import type { Listing } from '@/types/listing';
import Hero from '@/components/Hero';
import CalculatorTeaser from '@/components/CalculatorTeaser';
import SaveButton from '@/components/SaveButton';
import { useReveal, revealUp, staggerChildren } from '@/lib/use-reveal';

/**
 * The landing page, variant B.
 *
 * Browsing lives on /buy, /rent and /land. This page answers three questions
 * in the order a buyer asks them: what has just come on, where in the country
 * the stock is, and who to talk to. Everything on it is derived from the
 * listings and the roster, so it stays true as the catalogue changes.
 */
export default function HomePage() {
  const listings = useListingsStore((s) => s.listings);
  const agents = getAgents();

  const featured = useMemo(() => listings.filter((l) => l.featured).slice(0, 2), [listings]);

  // The newest instructions, skipping the two already pinned in the hero.
  const fresh = useMemo(() => {
    const shown = new Set(featured.map((l) => l.id));
    return [...listings]
      .filter((l) => !shown.has(l.id) && l.status !== 'Sold')
      .sort((a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime())
      .slice(0, 4);
  }, [listings, featured]);

  const forSale = listings.filter((l) => l.listingType === 'Sale' && l.propertyType !== 'Land').length;
  const forRent = listings.filter((l) => l.listingType === 'Rent' && l.propertyType !== 'Land').length;
  const parcels = listings.filter((l) => l.propertyType === 'Land').length;

  return (
    <>
      <Hero featured={featured} />
      <JustListed listings={fresh} counts={{ forSale, forRent, parcels }} />
      <AreaIndex listings={listings} />
      <CalculatorTeaser />
      <AgentStrip agents={agents.slice(0, 4)} />
      <SellerClose />
    </>
  );
}

/* ------------------------------------------------------------------ */

function JustListed({
  listings,
  counts,
}: {
  listings: Listing[];
  counts: { forSale: number; forRent: number; parcels: number };
}) {
  const reveal = useReveal();
  const [lead, ...rest] = listings;
  if (!lead) return null;

  const routes = [
    { href: '/buy', label: 'For sale', n: counts.forSale },
    { href: '/rent', label: 'To rent', n: counts.forRent },
    { href: '/land', label: 'Land', n: counts.parcels },
  ];

  return (
    <section className="mx-auto max-w-[82rem] px-5 pt-6 sm:px-8 sm:pt-8">
      <motion.div
        {...reveal}
        variants={revealUp}
        className="flex flex-col gap-5 border-b border-bone-edge pb-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h2 className="font-display text-[1.8rem] tracking-display text-ink sm:text-[2.2rem]">
            Just listed
          </h2>
          <p className="mt-1.5 max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink-mute">
            The newest properties on the books, most recent first.
          </p>
        </div>

        {/* The three browsing routes, as a ruled row with live counts. */}
        <nav aria-label="Browse the catalogue" className="ledger !border-t-0 shrink-0">
          {routes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex min-h-11 flex-1 flex-col justify-center px-4 first:pl-0 md:flex-none md:px-5 md:last:pr-0"
            >
              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint sm:text-[0.6rem]">
                {r.label}
              </span>
              <span className="tnum flex items-center gap-1.5 text-[1rem] text-ink transition-colors duration-200 ease-out group-hover:text-gold-deep">
                {r.n}
                <svg
                  aria-hidden
                  width="13"
                  height="9"
                  viewBox="0 0 20 14"
                  fill="none"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                >
                  <path
                    d="M1 7h17M12.5 1.5L18.5 7l-6 5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </nav>
      </motion.div>

      <motion.div
        {...reveal}
        variants={staggerChildren(0.08)}
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12"
      >
        <LeadArrival listing={lead} />
        {/* A motion list, not a plain <ul>: variants must pass from the
            stagger parent through every layer to reach the rows. */}
        <motion.ul
          variants={staggerChildren(0.08)}
          className="flex flex-col divide-y divide-bone-edge border-y border-bone-edge lg:border-t-0"
        >
          {rest.map((l) => (
            <ArrivalRow key={l.id} listing={l} />
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}

/** The newest listing, given the room of a plate. */
function LeadArrival({ listing }: { listing: Listing }) {
  const specs = specLedger(listing).slice(0, 3);
  return (
    <motion.article variants={revealUp} className="group relative">
      <div className="relative aspect-[16/11] overflow-hidden rounded-sm bg-bone-deep">
        <Image
          src={listing.images[0]}
          alt={listing.title + ', ' + listing.location}
          fill
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 1024px) 100vw, 44rem"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 via-50% to-transparent"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply" />
        <div className="absolute right-3 top-3 z-20">
          <SaveButton id={listing.id} title={listing.title} />
        </div>
        <span className="absolute left-3 top-3 rounded-sm bg-bone px-2 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-ink sm:text-[0.6rem]">
          Newest
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">
            {listing.location} &middot; {listing.listingType === 'Sale' ? 'For sale' : 'To rent'}
          </p>
          <h3 className="mt-1.5 font-display text-[1.5rem] leading-[1.15] tracking-display text-bone sm:text-[1.9rem]">
            <Link
              href={'/listings/' + listing.slug}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold"
            >
              {listing.title}
            </Link>
          </h3>
          <p className="tnum mt-2 text-[1.05rem] text-bone/90">{formatPrice(listing)}</p>
        </div>
      </div>
      <dl className="ledger mt-3">
        {specs.map((s) => (
          <div key={s.label} className="flex-1 py-2.5 pl-3 first:pl-0">
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">{s.label}</dt>
            <dd className="tnum mt-0.5 text-[0.95rem] text-ink-soft">{s.value}</dd>
          </div>
        ))}
      </dl>
    </motion.article>
  );
}

/** A newer listing as one ruled row: thumbnail, place, title, price, specs. */
function ArrivalRow({ listing }: { listing: Listing }) {
  const specs = specLedger(listing).slice(0, 3);
  return (
    <motion.li
      variants={revealUp}
      className="group relative flex gap-4 py-4 transition-colors duration-200 ease-out first:pt-4 hover:bg-bone-deep/60 sm:gap-5 sm:py-5 lg:first:pt-0"
    >
      <div className="relative aspect-[4/3] w-[7.5rem] shrink-0 overflow-hidden rounded-sm bg-bone-deep sm:w-[10rem]">
        <Image
          src={listing.images[0]}
          alt=""
          fill
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="10rem"
          className="object-cover"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-[0.68rem] uppercase tracking-[0.18em] text-gold-deep">
          {listing.location} &middot; {listing.listingType === 'Sale' ? 'For sale' : 'To rent'}
        </p>
        <h3 className="mt-1 font-display text-[1.08rem] leading-snug tracking-display text-ink transition-colors duration-200 ease-out group-hover:text-gold-deep sm:text-[1.2rem]">
          <Link
            href={'/listings/' + listing.slug}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold"
          >
            {listing.title}
          </Link>
        </h3>
        <p className="tnum mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-[0.98rem] text-ink">{formatPrice(listing)}</span>
          <span className="text-[0.8rem] text-ink-faint">
            {specs.map((s) => s.value + ' ' + s.label.toLowerCase()).join(' · ')}
          </span>
        </p>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Where the stock is, as an index rather than a map: one ruled row per region
 * with live counts and the opening price, each leading to that region's page.
 */
function AreaIndex({ listings }: { listings: Listing[] }) {
  const reveal = useReveal();
  const rows = REGIONS.map((region) => ({ region, ...regionStats(listings, region) })).filter(
    (r) => r.total > 0,
  );

  const from = (r: (typeof rows)[number]) => {
    if (r.minPrice === null) return null;
    const rent = r.forSale === 0;
    const v = r.minPrice;
    const label =
      v >= 1_000_000
        ? '$' + (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 2).replace(/0$/, '') + 'M'
        : '$' + Math.round(v / 1000) + 'k';
    return label + (rent ? '/mo' : '');
  };

  return (
    <section className="mx-auto max-w-[82rem] px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-16">
        <motion.div {...reveal} variants={revealUp} className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[1.8rem] tracking-display text-ink sm:text-[2.2rem]">
            Browse by area
          </h2>
          <p className="mt-2 max-w-[24rem] text-[0.95rem] leading-[1.7] text-ink-mute">
            Every region we have stock in today, with what is available and where prices start.
          </p>
        </motion.div>

        <motion.ol
          {...reveal}
          variants={staggerChildren(0.05)}
          className="border-t border-ink/80"
        >
          {rows.map((r) => (
            <motion.li key={r.region} variants={revealUp} className="border-b border-bone-edge">
              <Link
                href={'/trinidad/' + regionSlug(r.region)}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1 py-4 transition-colors duration-200 ease-out hover:bg-bone-deep/70 active:bg-bone-deep sm:grid-cols-[minmax(0,1fr)_9rem_6rem_auto] sm:py-5"
              >
                <span className="min-w-0">
                  <span className="block font-display text-[1.25rem] tracking-display text-ink transition-colors duration-200 ease-out group-hover:text-gold-deep sm:text-[1.4rem]">
                    {r.region}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.82rem] text-ink-faint">
                    {r.localities.join(' · ')}
                  </span>
                </span>
                <span className="tnum col-start-1 text-[0.82rem] text-ink-mute sm:col-start-auto sm:text-[0.88rem]">
                  {[r.forSale && r.forSale + ' for sale', r.forRent && r.forRent + ' to rent']
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="tnum hidden text-[0.88rem] text-ink sm:block">
                  {from(r) && (
                    <>
                      <span className="text-ink-faint">from </span>
                      {from(r)}
                    </>
                  )}
                </span>
                <span
                  aria-hidden
                  className="col-start-2 row-span-2 row-start-1 text-gold-deep transition-transform duration-300 ease-out group-hover:translate-x-1 sm:col-start-auto sm:row-span-1"
                >
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <path
                      d="M1 7h17M12.5 1.5L18.5 7l-6 5.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function AgentStrip({ agents }: { agents: ReturnType<typeof getAgents> }) {
  const reveal = useReveal();
  const year = new Date().getFullYear();

  return (
    <section className="mx-auto max-w-[82rem] px-5 pt-20 sm:px-8 sm:pt-24">
      <motion.div
        {...reveal}
        variants={revealUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 className="font-display text-[1.8rem] tracking-display text-ink sm:text-[2.2rem]">
            Ask the agent who walked it
          </h2>
          <p className="mt-2 max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink-mute">
            Every listing belongs to a named person who has been through the property.
          </p>
        </div>
        <Link
          href="/our-agents"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 text-[0.9rem] text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink"
        >
          Meet the whole team
        </Link>
      </motion.div>

      <motion.ul
        {...reveal}
        variants={staggerChildren(0.07)}
        className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {agents.map((a) => (
          <motion.li key={a.id} variants={revealUp}>
            <Link
              href={'/our-agents/' + a.slug}
              className="group flex items-center gap-4 rounded-sm py-3 transition-colors duration-200 ease-out active:opacity-80"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-bone-deep ring-1 ring-bone-edge transition-[box-shadow] duration-300 ease-out group-hover:ring-2 group-hover:ring-gold">
                <Image
                  src={a.image}
                  alt=""
                  fill
                  sizes="4rem"
                  className="object-cover [object-position:50%_18%]"
                />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[1.08rem] tracking-display text-ink transition-colors duration-200 ease-out group-hover:text-gold-deep">
                  {a.name}
                </span>
                <span className="block truncate text-[0.8rem] text-ink-faint">
                  {a.territories.join(' · ')}
                </span>
                <span className="tnum block text-[0.8rem] text-ink-mute">
                  {year - a.joined} years with us
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** The one place on the page asking an owner to get in touch. */
function SellerClose() {
  const reveal = useReveal();
  return (
    <section className="mx-auto max-w-[82rem] px-5 pb-4 pt-20 sm:px-8 sm:pt-24">
      <motion.div
        {...reveal}
        variants={revealUp}
        className="on-ink relative overflow-hidden rounded-sm bg-ink px-6 py-12 shadow-float sm:px-12 sm:py-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_22rem_at_100%_0%,rgba(184,147,77,0.22),transparent_70%)]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2 className="font-display text-[1.9rem] leading-tight tracking-display text-bone sm:text-[2.5rem]">
              Selling? <span className="italic text-gold">Start with a number.</span>
            </h2>
            <p className="mt-4 max-w-[36rem] text-[0.98rem] leading-[1.7] text-bone/70">
              A valuation costs nothing and takes about forty minutes. We will tell
              you what the property is worth today, and what small work would move
              that figure before it goes on the market.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sell"
              className="inline-flex min-h-12 items-center rounded-sm bg-gold px-6 text-[0.9rem] text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-bone active:scale-[0.98]"
            >
              Book a valuation
            </Link>
            <Link
              href="/sell#manage"
              className="inline-flex min-h-12 items-center rounded-sm border border-bone/25 px-6 text-[0.9rem] text-bone transition-[background-color,border-color,transform] duration-200 ease-out hover:border-bone/50 hover:bg-bone/5 active:scale-[0.98]"
            >
              Letting &amp; management
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
