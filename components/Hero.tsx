'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Listing } from '@/types/listing';
import { BLUR_DATA_URL, formatPrice, specLedger } from '@/lib/format';
import SentenceSearch from './SentenceSearch';

/**
 * The landing hero, variant B: a daylight page rather than a dark reel.
 *
 * The copy column carries the search, written as a sentence the visitor
 * completes. The other column shows two of the featured properties as
 * photographs pinned to the page, each with its own key tag, so the first
 * screen is already the catalogue rather than a picture of a generic house.
 */
export default function Hero({ featured }: { featured: Listing[] }) {
  const reduce = useReducedMotion();
  const [lead, second] = featured;

  // Every element's resting state is visible; the entrance only offsets it.
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Two quiet washes behind the photographs, so the right-hand column
          sits on a ground of its own rather than on flat paper. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(48rem_32rem_at_88%_30%,rgba(184,147,77,0.13),transparent_65%),radial-gradient(34rem_24rem_at_62%_62%,rgba(140,146,132,0.14),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-[82rem] gap-12 px-5 pb-12 pt-[7.25rem] sm:px-8 sm:pb-14 sm:pt-[8.5rem] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16">
        <div className="min-w-0">
          <motion.p
            {...rise(0.05)}
            className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-gold-deep"
          >
            <span aria-hidden className="h-px w-8 bg-gold" />
            Trinidad &amp; Tobago &middot; since 2009
          </motion.p>

          <motion.h1
            {...rise(0.12)}
            className="mt-5 font-display text-[2.3rem] leading-[1.04] tracking-display text-ink xs:text-[2.6rem] sm:text-[3.5rem] lg:text-[4rem]"
          >
            From Westmoorings
            <span className="block italic text-gold-deep">to Bon&nbsp;Accord.</span>
          </motion.h1>

          <motion.p
            {...rise(0.2)}
            className="mt-5 max-w-[32rem] text-[1rem] leading-[1.7] text-ink-mute"
          >
            Houses, apartments, land and commercial space across both islands.
            Every listing measured, photographed and priced in TTD.
          </motion.p>

          <SentenceSearch />
        </div>

        {lead && <PhotoPair lead={lead} second={second} reduce={Boolean(reduce)} />}
      </div>
    </section>
  );
}

/**
 * Two featured properties, pinned to the page.
 *
 * The lead photograph unveils from the foot upward, the way a print is drawn
 * out of an agency folder, and the second follows it in. That is the page's
 * one orchestrated moment; everything else only rises. Below lg the second
 * photograph is dropped and the lead sits full width under the search.
 */
function PhotoPair({
  lead,
  second,
  reduce,
}: {
  lead: Listing;
  second?: Listing;
  reduce: boolean;
}) {
  const unveil = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
    : {
        initial: { clipPath: 'inset(100% 0% 0% 0%)' },
        animate: { clipPath: 'inset(0% 0% 0% 0%)' },
        transition: { duration: 1.1, delay: 0.25, ease: [0.76, 0, 0.24, 1] as const },
      };

  const follow = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div className="relative min-w-0 lg:pb-14 lg:pl-10">
      <motion.div {...unveil} className="relative lg:ml-auto lg:w-[86%]">
        <Plate listing={lead} priority className="aspect-[4/3] lg:aspect-[4/5]" sizes="(max-width: 1024px) 100vw, 34rem" />
      </motion.div>

      {second && (
        <motion.div
          {...follow}
          className="absolute bottom-0 left-0 hidden w-[46%] lg:block"
        >
          {/* The bone ring lifts the small print off the large one. */}
          <div className="rounded-sm bg-bone p-1.5 shadow-float">
            <Plate listing={second} className="aspect-[4/3]" sizes="16rem" compact />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * One photograph with its key tag: where it is, what it is, what it costs,
 * and the first figures of its spec ledger. The whole plate is the link.
 */
function Plate({
  listing,
  className,
  sizes,
  priority = false,
  compact = false,
}: {
  listing: Listing;
  className: string;
  sizes: string;
  priority?: boolean;
  compact?: boolean;
}) {
  const specs = specLedger(listing).slice(0, compact ? 2 : 3);

  return (
    <Link
      href={'/listings/' + listing.slug}
      aria-label={listing.title + ', ' + listing.location + ', ' + formatPrice(listing)}
      className={
        'group relative block overflow-hidden rounded-sm bg-bone-deep transition-transform duration-500 ease-out active:scale-[0.99] ' +
        className
      }
    >
      <Image
        src={listing.images[0]}
        alt=""
        fill
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes={sizes}
        className="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply"
      />

      {compact ? (
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-[0.62rem] uppercase tracking-[0.18em] text-bone/80">
            {listing.location}
          </p>
          <p className="tnum mt-0.5 font-display text-[1.05rem] text-bone">
            {formatPrice(listing)}
          </p>
        </div>
      ) : (
        // The key tag: a small printed card hung on the photograph. It slides
        // a few pixels on hover, which is the plate's only hover signal.
        <div className="absolute bottom-3 right-3 w-[min(17rem,calc(100%-1.5rem))] rounded-sm bg-bone/95 p-3.5 shadow-lift transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:bottom-4 sm:right-4 sm:p-4 lg:bottom-auto lg:top-4">
          <p className="truncate text-[0.66rem] uppercase tracking-[0.18em] text-gold-deep">
            {listing.location} &middot; Featured
          </p>
          <p className="mt-1 font-display text-[1.08rem] leading-snug tracking-display text-ink">
            {listing.title}
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-bone-edge pt-2">
            <span className="tnum text-[0.95rem] text-ink">{formatPrice(listing)}</span>
            <span className="tnum truncate text-[0.74rem] text-ink-faint">
              {specs.map((s) => s.value + ' ' + s.label.toLowerCase()).join(' · ')}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
