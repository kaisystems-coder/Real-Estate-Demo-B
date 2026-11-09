'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * The shortlist — properties a visitor has saved.
 *
 * Every serious property site is built around this loop: browse, save a few,
 * come back to the shortlist. Compass and Zillow both hang their return visits
 * on it, and My Bunch of Keys named their whole brand after it ("My Bunch").
 * It is also the one feature an agency running off Instagram cannot offer at
 * all — a saved post is saved into Instagram, where the agent never sees it.
 *
 * Backed by localStorage rather than the sessionStorage the listings store
 * uses. The two have different lifetimes on purpose: listing edits are a
 * meeting's worth of demo state and should reset for the next prospect, but a
 * shortlist is the visitor's own and has to survive closing the tab. That is
 * the whole point of saving something.
 *
 * Stores ids only. The listing itself is looked up from the listings store, so
 * a saved property that is later edited or removed stays consistent.
 */

/** Stands in for localStorage during prerendering, where it doesn't exist. */
const NOOP_STORAGE: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

interface SavedState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set) => ({
      ids: [],

      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : // Newest save first, so the shortlist reads in the order they
              // were found rather than in listing order.
              [id, ...state.ids],
        })),

      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),

      clear: () => set({ ids: [] }),
    }),
    {
      name: 'prestige-saved',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? NOOP_STORAGE : localStorage,
      ),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);

/**
 * True once the shortlist has been read back from localStorage.
 *
 * The server always renders an empty shortlist, so painting restored saves on
 * the first client render would be a hydration mismatch — every heart would
 * flip state on the second frame. Components gate on this and render the
 * unsaved state until the read completes.
 */
export function useSavedHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const api = useSavedStore.persist;
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

/** Whether one listing is saved. Returns false until hydration completes. */
export function useIsSaved(id: string): boolean {
  const hydrated = useSavedHydrated();
  const ids = useSavedStore((s) => s.ids);
  return hydrated && ids.includes(id);
}

/** How many are saved. Returns 0 until hydration completes. */
export function useSavedCount(): number {
  const hydrated = useSavedHydrated();
  const ids = useSavedStore((s) => s.ids);
  return hydrated ? ids.length : 0;
}
