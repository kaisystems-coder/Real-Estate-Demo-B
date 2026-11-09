'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Listing, ListingDraft, ListingStatus } from '@/types/listing';
import { useListingsStore } from '@/lib/store';
import { createListing, deleteListing, updateListing } from '@/lib/listings';
import { BLUR_DATA_URL, formatDate, formatNumber, formatPrice, specLedger } from '@/lib/format';
import StatusPill from '@/components/StatusPill';
import ListingForm from '@/components/admin/ListingForm';
import ConfirmDelete from '@/components/admin/ConfirmDelete';

const STATUS_TABS: ('All' | ListingStatus)[] = ['All', 'Active', 'Pending', 'Sold'];

export default function AdminPage() {
  const listings = useListingsStore((s) => s.listings);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | ListingStatus>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (status !== 'All' && l.status !== status) return false;
      if (!q) return true;
      return (l.title + ' ' + l.location + ' ' + l.region).toLowerCase().includes(q);
    });
  }, [listings, query, status]);

  const announce = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3600);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setEditing(listing);
    setFormOpen(true);
  };

  const save = (draft: ListingDraft) => {
    if (editing) {
      updateListing(editing.id, draft);
      announce('Saved. ' + draft.title + ' is updated on the site.');
    } else {
      createListing(draft);
      announce('Published. ' + draft.title + ' is live on the site.');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteListing(pendingDelete.id);
    announce('Deleted. ' + pendingDelete.title + ' is off the site.');
    setPendingDelete(null);
  };

  return (
    <div className="mx-auto max-w-[82rem] px-5 pb-10 pt-28 sm:px-8 sm:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <h1 className="font-display text-[1.9rem] tracking-display text-ink sm:text-[2.2rem]">
              Listing manager
            </h1>
            {/* Tighter wording on phones — the long sentence wrapped to two
                ragged lines. It still says when changes go away. */}
            <span className="rounded-sm border border-gold/40 bg-gold-wash px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.14em] text-gold-deep sm:text-[0.65rem]">
              <span className="sm:hidden">Demo &mdash; clears on tab close</span>
              <span className="hidden sm:inline">
                Demo mode &mdash; changes clear when the tab closes
              </span>
            </span>
          </div>
          <p className="mt-2 max-w-[44ch] text-[0.92rem] leading-relaxed text-ink-mute">
            Add, edit or remove a property. Every change shows on the{' '}
            <Link
              href="/"
              className="inline-flex min-h-11 items-center underline decoration-bone-edge underline-offset-4 transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
            >
              public site
            </Link>{' '}
            immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-[0.87rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M7 2v10M2 7h10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Add listing
        </button>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-bone-edge py-3">
        <div className="relative min-w-[12rem] flex-1">
          <label htmlFor="admin-search" className="sr-only">
            Search listings
          </label>
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, area or region"
            className="w-full rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out hover:border-ink/25 focus:border-gold sm:py-2.5 desk:text-[0.86rem]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              aria-pressed={status === tab}
              className={
                'min-h-11 rounded-sm border px-4 py-2.5 text-[0.82rem] transition-[background-color,border-color,color] duration-200 ease-out desk:min-h-0 sm:px-3 sm:py-2 sm:text-[0.79rem] ' +
                (status === tab
                  ? 'border-ink bg-ink text-bone'
                  : 'border-bone-edge text-ink-mute hover:border-ink/25 hover:text-ink')
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <p className="tnum ml-auto text-[0.8rem] text-ink-faint">
          {rows.length} of {listings.length}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-bone-edge px-6 py-16 text-center">
          <h2 className="font-display text-[1.3rem] tracking-display text-ink">
            {listings.length === 0 ? 'No listings yet' : 'Nothing matches that search'}
          </h2>
          <p className="mx-auto mt-2 max-w-[30rem] text-[0.9rem] leading-relaxed text-ink-mute">
            {listings.length === 0
              ? 'Add the first property and it appears on the homepage straight away.'
              : 'Try a different area name, or switch the status filter back to All.'}
          </p>
          <button
            type="button"
            onClick={listings.length === 0 ? openAdd : () => { setQuery(''); setStatus('All'); }}
            className="mt-6 rounded-sm bg-ink px-5 py-2.5 text-[0.85rem] text-bone transition-transform duration-200 ease-out active:translate-y-px"
          >
            {listings.length === 0 ? 'Add listing' : 'Clear search'}
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: a table. Mobile: the same rows as stacked cards. */}
          <div className="mt-2 hidden lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-bone-edge">
                  {['Property', 'Status', 'Price', 'Specification', 'Listed', ''].map(
                    (head) => (
                      <th
                        key={head}
                        scope="col"
                        className="py-3 pr-4 text-[0.66rem] font-normal uppercase tracking-[0.16em] text-ink-faint"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((listing) => (
                    <motion.tr
                      key={listing.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="group border-b border-bone-edge align-middle"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-sm bg-bone-deep">
                            {listing.images[0] && (
                              <Image
                                src={listing.images[0]}
                                alt=""
                                fill
                                unoptimized={
                                  !listing.images[0].startsWith('/') &&
                                  !listing.images[0].startsWith(
                                    'https://images.unsplash.com',
                                  )
                                }
                                placeholder="blur"
                                blurDataURL={BLUR_DATA_URL}
                                sizes="64px"
                                className="object-cover"
                              />
                            )}
                          </span>
                          <span className="min-w-0">
                            <Link
                              href={'/listings/' + listing.slug}
                              className="block truncate text-[0.9rem] text-ink transition-colors duration-200 ease-out hover:text-gold-deep"
                            >
                              {listing.title}
                            </Link>
                            <span className="block truncate text-[0.78rem] text-ink-faint">
                              {listing.location} &middot; {listing.propertyType}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusPill status={listing.status} className="ring-1 ring-bone-edge" />
                      </td>
                      <td className="tnum py-3.5 pr-4 text-[0.88rem] text-ink-soft">
                        {formatPrice(listing)}
                      </td>
                      <td className="tnum py-3.5 pr-4 text-[0.82rem] text-ink-mute">
                        {specLedger(listing)
                          .slice(0, 3)
                          .map((s) => s.value + ' ' + s.label)
                          .join(' · ') || '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-[0.82rem] text-ink-mute">
                        {formatDate(listing.dateListed)}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <RowAction onClick={() => openEdit(listing)} label="Edit">
                            Edit
                          </RowAction>
                          <RowAction
                            onClick={() => setPendingDelete(listing)}
                            label={'Delete ' + listing.title}
                            danger
                          >
                            Delete
                          </RowAction>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <ul className="mt-6 flex flex-col gap-3 lg:hidden">
            <AnimatePresence initial={false}>
              {rows.map((listing) => (
                <motion.li
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-sm border border-bone-edge bg-bone-deep/50 p-4"
                >
                  <div className="flex gap-3">
                    <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-sm bg-bone-deep">
                      {listing.images[0] && (
                        <Image
                          src={listing.images[0]}
                          alt=""
                          fill
                          unoptimized={
                            !listing.images[0].startsWith('/') &&
                            !listing.images[0].startsWith('https://images.unsplash.com')
                          }
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      {/* The card layout is the phone view, so the title is a
                          real touch target rather than a 22px line of text. */}
                      <Link
                        href={'/listings/' + listing.slug}
                        className="flex min-h-11 items-center truncate text-[0.92rem] text-ink"
                      >
                        {listing.title}
                      </Link>
                      <p className="truncate text-[0.78rem] text-ink-faint">
                        {listing.location} &middot; {listing.propertyType}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusPill
                          status={listing.status}
                          className="ring-1 ring-bone-edge"
                        />
                        <span className="tnum text-[0.85rem] text-ink-soft">
                          {formatPrice(listing)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 border-t border-bone-edge pt-3 xs:flex-row xs:items-center xs:justify-between">
                    <p className="tnum text-[0.82rem] text-ink-mute">
                      {specLedger(listing)
                        .slice(0, 3)
                        .map((s) => s.value + ' ' + s.label)
                        .join(' · ') || 'No specification'}
                    </p>
                    {/* gap-3, not gap-1: Delete sits next to Edit and a
                        mis-tap is destructive. */}
                    <div className="flex gap-3 sm:gap-1">
                      <RowAction onClick={() => openEdit(listing)} label="Edit">
                        Edit
                      </RowAction>
                      <RowAction
                        onClick={() => setPendingDelete(listing)}
                        label={'Delete ' + listing.title}
                        danger
                      >
                        Delete
                      </RowAction>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      <ListingForm
        open={formOpen}
        listing={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />

      <ConfirmDelete
        listing={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Confirmation of what just changed. Polite, never steals focus. */}
      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 left-1/2 z-toast -translate-x-1/2 rounded-sm bg-ink px-4 py-3 text-[0.84rem] text-bone shadow-float"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function RowAction({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        // Bordered and 44px tall on touch, so Edit and Delete read as two
        // distinct buttons rather than adjacent words. Delete is separated
        // and tinted, because mis-tapping it destroys a listing.
        'min-h-11 min-w-[4.5rem] rounded-sm border px-3.5 py-2.5 text-[0.82rem] transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px desk:min-h-0 sm:min-w-0 sm:border-transparent sm:px-2.5 sm:py-1.5 sm:text-[0.79rem] ' +
        (danger
          ? 'border-[#9B3D2E]/25 text-[#9B3D2E] hover:border-[#9B3D2E]/40 hover:bg-[#9B3D2E]/8 sm:text-ink-mute sm:hover:border-[#9B3D2E]/30 sm:hover:text-[#9B3D2E]'
          : 'border-bone-edge text-ink hover:bg-bone-deep sm:text-ink-mute sm:hover:border-bone-edge sm:hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
