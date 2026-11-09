import type { Listing, ListingDraft } from '@/types/listing';
import { MOCK_LISTINGS } from './mock-listings';
import { useListingsStore } from './store';

/**
 * The single data-access boundary for the app.
 *
 * Nothing outside this file touches the store or the mock array directly, so
 * moving to Supabase is a change to five function bodies rather than a rewrite.
 * Each function below carries the query that replaces it.
 *
 * When these become async, the call sites change in one mechanical way: the
 * read functions are already called from Server Components (await them), and
 * the write functions are already called from event handlers (await them and
 * revalidate). No component structure changes.
 */

/** Reads used at build time by Server Components. */
export function getListings(): Listing[] {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('listings').select('*').order('date_listed', { ascending: false });
  // return data ?? [];
  return MOCK_LISTINGS;
}

export function getListingBySlug(slug: string): Listing | undefined {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('listings').select('*').eq('slug', slug).single();
  // return data ?? undefined;
  return MOCK_LISTINGS.find((l) => l.slug === slug);
}

export function createListing(draft: ListingDraft): Listing {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('listings').insert(draft).select().single();
  // return data;
  return useListingsStore.getState().create(draft);
}

export function updateListing(
  id: string,
  patch: Partial<ListingDraft>,
): Listing | null {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('listings').update(patch).eq('id', id).select().single();
  // return data;
  return useListingsStore.getState().update(id, patch);
}

export function deleteListing(id: string): void {
  // TODO: replace with Supabase query
  // await supabase.from('listings').delete().eq('id', id);
  useListingsStore.getState().remove(id);
}

/**
 * Related listings for a detail page: same region first, then same property
 * type, so a Tobago villa suggests other Tobago property before a Chaguanas
 * estate. Falls back to filling with anything recent if the match is thin.
 */
export function getRelatedListings(
  listing: Listing,
  pool: Listing[],
  limit = 3,
): Listing[] {
  const others = pool.filter((l) => l.id !== listing.id);
  const score = (l: Listing) =>
    (l.region === listing.region ? 2 : 0) +
    (l.propertyType === listing.propertyType ? 1 : 0) +
    (l.listingType === listing.listingType ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}
