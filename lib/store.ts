'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Listing, ListingDraft } from '@/types/listing';
import { MOCK_LISTINGS } from './mock-listings';

/**
 * Listings store for the demo.
 *
 * This is the single source of truth: /, /listings/[slug] and /admin all read
 * from here, so an edit in the admin table is visible on the public pages
 * immediately.
 *
 * Backed by sessionStorage, which is the right lifetime for a pitch meeting:
 * changes survive a page reload or a pasted URL, so nothing added on screen
 * vanishes mid-demo, but closing the tab resets to the seeded ten listings for
 * the next prospect. Still no database — the "Demo Mode" badge in the admin
 * header says so.
 *
 * When Supabase lands, this store keeps its shape and the actions in
 * lib/listings.ts become async calls; components stay untouched.
 */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Keeps slugs unique when two listings share a title. */
function uniqueSlug(base: string, taken: string[]): string {
  const seed = base || 'listing';
  if (!taken.includes(seed)) return seed;
  let n = 2;
  while (taken.includes(seed + '-' + n)) n += 1;
  return seed + '-' + n;
}

/** Stands in for sessionStorage during prerendering, where it doesn't exist. */
const NOOP_STORAGE: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

interface ListingsState {
  listings: Listing[];
  create: (draft: ListingDraft) => Listing;
  update: (id: string, patch: Partial<ListingDraft>) => Listing | null;
  remove: (id: string) => void;
  reset: () => void;
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: MOCK_LISTINGS,

      create: (draft) => {
        const taken = get().listings.map((l) => l.slug);
        const listing: Listing = {
          ...draft,
          id: draft.id ?? 'pp-' + Math.random().toString(36).slice(2, 9),
          slug: uniqueSlug(draft.slug || slugify(draft.title), taken),
        };
        set((state) => ({ listings: [listing, ...state.listings] }));
        return listing;
      },

      update: (id, patch) => {
        let updated: Listing | null = null;
        set((state) => ({
          listings: state.listings.map((l) => {
            if (l.id !== id) return l;
            const taken = state.listings.filter((o) => o.id !== id).map((o) => o.slug);
            const nextTitle = patch.title ?? l.title;
            // Re-derive the slug when the title changes so URLs stay readable.
            const nextSlug =
              patch.title && patch.title !== l.title
                ? uniqueSlug(slugify(nextTitle), taken)
                : l.slug;
            updated = { ...l, ...patch, id: l.id, slug: nextSlug };
            return updated;
          }),
        }));
        return updated;
      },

      remove: (id) =>
        set((state) => ({ listings: state.listings.filter((l) => l.id !== id) })),

      reset: () => {
        set({ listings: MOCK_LISTINGS });
        useListingsStore.persist?.clearStorage();
      },
    }),
    {
      // Renamed when the photos moved local, so a tab still holding the old
      // hotlinked URLs starts fresh instead of rendering them.
      name: 'prestige-listings-local-photos',
      // sessionStorage, not localStorage: one meeting's worth of changes.
      // The factory must not touch sessionStorage during prerendering, where
      // it does not exist — returning a no-op store keeps the middleware wired
      // up so `.persist` is still defined on the server.
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? NOOP_STORAGE : sessionStorage,
      ),
      // Only the data persists. Re-persisting the action functions would be
      // meaningless and would bloat every write.
      partialize: (state) => ({ listings: state.listings }),
    },
  ),
);

/**
 * True once the persisted state has been read back from sessionStorage.
 *
 * Server-rendered HTML is always built from the seed data, so rendering
 * restored listings on the very first client paint would be a hydration
 * mismatch. Components read this and show the seed data until rehydration
 * finishes on the next tick.
 *
 * `persist.onFinishHydration` fires after that read; `hasHydrated()` covers the
 * case where it already completed before this subscribes.
 */
export function useStoreHydrated(): boolean {
  // Always false on the first render, including on the server, so the client's
  // first paint matches the prerendered HTML.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const api = useListingsStore.persist;
    if (!api) {
      setHydrated(true);
      return;
    }
    const unsub = api.onFinishHydration(() => setHydrated(true));
    if (api.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
