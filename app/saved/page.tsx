'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useListingsStore } from '@/lib/store';
import { useSavedStore, useSavedHydrated } from '@/lib/saved';
import PageHeader from '@/components/PageHeader';
import ListingCard from '@/components/ListingCard';

/**
 * The shortlist.
 *
 * Saving is only half the loop — the other half is a place to compare what you
 * saved and hand it to an agent. That last step is the conversion: a visitor
 * arriving at an office with five specific listings is a qualified buyer, and
 * it is the thing a saved Instagram post can never do, because the save lives
 * inside Instagram where the agent never sees it.
 *
 * Client-rendered because the shortlist lives in the visitor's own browser.
 * Metadata therefore comes from the layout rather than an exported object.
 */
export default function SavedPage() {
  const listings = useListingsStore((s) => s.listings);
  const ids = useSavedStore((s) => s.ids);
  const clear = useSavedStore((s) => s.clear);
  const hydrated = useSavedHydrated();

  // Saved order, not listing order: the shortlist reads newest save first.
  // Ids for listings that no longer exist are dropped rather than rendered
  // as holes.
  const saved = useMemo(
    () =>
      ids
        .map((id) => listings.find((l) => l.id === id))
        .filter((l): l is NonNullable<typeof l> => Boolean(l)),
    [ids, listings],
  );

  const count = hydrated ? saved.length : 0;

  return (
    <>
      <PageHeader
        eyebrow="Your shortlist"
        title="Properties you've saved"
        intro="Saved on this device. Send the list to an agent and they will arrange the viewings in one run, rather than one property at a time."
        meta={
          hydrated
            ? count === 0
              ? undefined
              : count + (count === 1 ? ' property saved' : ' properties saved')
            : undefined
        }
      />

      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-16">
        {/*
          Until the store rehydrates, the server-rendered empty state is what
          the HTML contains — rendering saves before then would be a hydration
          mismatch. This is a brief, unstyled-free hold, not a spinner.
        */}
        {!hydrated ? (
          <p className="text-[0.9rem] text-ink-faint">Loading your shortlist…</p>
        ) : count === 0 ? (
          <div className="rounded-sm border border-dashed border-bone-edge px-6 py-16 text-center">
            <span
              aria-hidden
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-bone-edge bg-bone-deep text-ink-faint"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 3.6h12a1 1 0 0 1 1 1v15.9l-7-4.4-7 4.4V4.6a1 1 0 0 1 1-1z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 className="mt-5 font-display text-[1.5rem] tracking-display text-ink">
              Nothing saved yet
            </h2>
            <p className="mx-auto mt-2.5 max-w-[32rem] text-[0.94rem] leading-[1.7] text-ink-mute">
              Tap the bookmark on any property to keep it here. The shortlist
              stays on this device, so you can come back to it later.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/buy"
                className="inline-flex min-h-11 items-center rounded-sm bg-ink px-5 text-[0.88rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
              >
                Browse properties for sale
              </Link>
              <Link
                href="/rent"
                className="inline-flex min-h-11 items-center rounded-sm border border-bone-edge px-5 text-[0.88rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/25 hover:bg-bone-deep active:translate-y-px"
              >
                Browse rentals
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-bone-edge pb-5">
              <p className="max-w-[36rem] text-[0.94rem] leading-[1.7] text-ink-mute">
                Ready to view them? Send the shortlist across and an agent will
                line up the viewings.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center rounded-sm bg-ink px-5 text-[0.88rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
                >
                  Arrange viewings
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex min-h-11 items-center text-[0.85rem] text-ink-mute underline decoration-bone-edge underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:decoration-ink/40"
                >
                  Clear shortlist
                </button>
              </div>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3"
            >
              {saved.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} priority={i < 3} />
              ))}
            </motion.div>
          </>
        )}
      </section>
    </>
  );
}
