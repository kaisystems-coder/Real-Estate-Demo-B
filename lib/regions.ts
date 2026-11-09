import type { Listing } from '@/types/listing';
import { REGIONS } from './filters';

/**
 * Region helpers for the /trinidad/[region] landing pages.
 *
 * These pages exist because of how people actually search. Nobody types
 * "property portal Trinidad"; they type "houses for sale in Chaguanas". A
 * filtered view at /buy?region=Central cannot rank for that — it is one URL
 * wearing many hats, and Google indexes URLs. A region page is a real page
 * with its own title, description and structured data.
 *
 * Everything a region page says is derived from listings that already exist.
 * No invented editorial: the counts, the price range and the agent list are
 * facts about the catalogue, which is also what keeps these pages from being
 * the thin doorway pages that get sites penalised.
 */

/** "North-West Trinidad" -> "north-west-trinidad" */
export function regionSlug(region: string): string {
  return region
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** The region whose slug matches, or undefined. */
export function regionFromSlug(slug: string): string | undefined {
  return REGIONS.find((r) => regionSlug(r) === slug);
}

/** Every region slug, for generateStaticParams. */
export function allRegionSlugs(): string[] {
  return REGIONS.map(regionSlug);
}

/**
 * The neighbourhoods the agency actually has stock in, for this region.
 *
 * Named places are what a searcher recognises, and listing them gives the page
 * genuine local specificity without writing a word of area copy.
 */
export function localitiesIn(listings: Listing[], region: string): string[] {
  return [
    ...new Set(
      listings.filter((l) => l.region === region).map((l) => l.location),
    ),
  ].sort();
}

export interface RegionStats {
  total: number;
  forSale: number;
  forRent: number;
  minPrice: number | null;
  maxPrice: number | null;
  localities: string[];
  propertyTypes: string[];
}

/** What the catalogue can truthfully say about a region right now. */
export function regionStats(listings: Listing[], region: string): RegionStats {
  const inRegion = listings.filter((l) => l.region === region);
  const sale = inRegion.filter((l) => l.listingType === 'Sale');
  const rent = inRegion.filter((l) => l.listingType === 'Rent');

  // Sale and rent prices are three orders of magnitude apart, so a combined
  // range would be meaningless. The headline range describes sales where any
  // exist, and falls back to rentals for a rental-only region.
  const priced = sale.length ? sale : rent;
  const prices = priced.map((l) => l.price);

  return {
    total: inRegion.length,
    forSale: sale.length,
    forRent: rent.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    localities: localitiesIn(listings, region),
    propertyTypes: [...new Set(inRegion.map((l) => l.propertyType))].sort(),
  };
}
