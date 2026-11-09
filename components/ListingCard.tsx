'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Listing } from '@/types/listing';
import { BLUR_DATA_URL, formatPrice, specLedger } from '@/lib/format';
import StatusPill from './StatusPill';
import SaveButton from './SaveButton';

export default function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  const specs = specLedger(listing).slice(0, 3);

  return (
    <motion.article
      layout
      // Card motion is per-item and additive: the resting state is fully
      // visible, so a card that never animates is still readable.
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <div className="flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-bone-deep">
          <Image
            src={listing.images[0]}
            alt={listing.title + ', ' + listing.location}
            fill
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
          />
          {/* Gradient scrim plus a warm multiply layer, so photography from a
              dozen different sources reads as one catalogue. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply"
          />

          {/* Above the stretched link (z-20 vs z-10) so a save never
              navigates, and a real sibling of it rather than a nested button,
              which would be invalid HTML and untabbable. */}
          <div className="absolute right-3 top-3 z-20">
            <SaveButton id={listing.id} title={listing.title} />
          </div>

          {/* Stacked, not inline: both badges together overflow the card's
              top edge at grid widths and collide. */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <StatusPill status={listing.status} />
            {listing.featured && (
              <span className="rounded-sm bg-gold px-2 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-ink sm:text-[0.6rem]">
                Featured
              </span>
            )}
          </div>

          <p className="tnum absolute bottom-3 left-3 font-display text-[1.3rem] text-bone drop-shadow-[0_1px_6px_rgba(18,19,15,0.5)]">
            {formatPrice(listing)}
          </p>
        </div>

        <div className="pt-4">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gold-deep">
            {listing.location}
          </p>
          <h3 className="mt-1.5 font-display text-[1.12rem] leading-snug tracking-display text-ink transition-colors duration-300 ease-out group-hover:text-gold-deep">
            {/* The stretched link: it owns the accessible name and the focus
                ring, and its ::after covers the card so the whole tile is
                clickable without nesting anything inside an anchor. */}
            <Link
              href={'/listings/' + listing.slug}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold"
            >
              {listing.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* The spec ledger — the same row appears on the detail page and in the
          admin table, which is what ties the three surfaces together. */}
      <dl className="ledger mt-3.5">
        {specs.map((spec) => (
          <div key={spec.label} className="flex-1 py-2.5 pl-3 first:pl-0">
            <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">
              {spec.label}
            </dt>
            <dd className="tnum mt-0.5 text-[0.95rem] text-ink-soft sm:text-[0.92rem]">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </motion.article>
  );
}
