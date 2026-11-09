import type { Listing, ListingType, SaleOrRent, Sector } from '@/types/listing';
import { typesForSector } from '@/types/listing';

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'beds';

export interface Filters {
  region: string; // '' = any
  listingType: SaleOrRent;
  /** Residential or commercial. Scopes which propertyTypes are offered. */
  sector: Sector;
  propertyTypes: ListingType[];
  priceMin: number;
  priceMax: number;
  beds: number; // 0 = any
  baths: number; // 0 = any
  sqftMin: number | null;
  sqftMax: number | null;
  amenities: string[];
  sort: SortKey;
}

/**
 * Sale and rent live on scales three orders of magnitude apart, so the price
 * slider carries its own bounds per mode rather than one range that makes
 * every rental sit in the first pixel.
 */
export const PRICE_BOUNDS: Record<SaleOrRent, { min: number; max: number; step: number }> = {
  Sale: { min: 0, max: 8000000, step: 50000 },
  Rent: { min: 0, max: 20000, step: 500 },
};

export function defaultFilters(listingType: SaleOrRent = 'Sale'): Filters {
  const bounds = PRICE_BOUNDS[listingType];
  return {
    region: '',
    listingType,
    sector: 'residential',
    propertyTypes: [],
    priceMin: bounds.min,
    priceMax: bounds.max,
    beds: 0,
    baths: 0,
    sqftMin: null,
    sqftMax: null,
    amenities: [],
    sort: 'newest',
  };
}

/** Every amenity present in the current data, alphabetical. */
export function allAmenities(listings: Listing[]): string[] {
  const set = new Set<string>();
  listings.forEach((l) => l.amenities.forEach((a) => set.add(a)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Regions present in the data, in the north-to-south order agents use. */
/**
 * Every region the agency covers, roughly north to south and then Tobago.
 *
 * Exported because two callers need different halves of it: the listing
 * filters want only the regions that currently have stock, while the valuation
 * form has to offer all of them — an owner's property exists whether or not
 * the agency happens to have a listing in that region today.
 */
export const REGIONS = [
  'North-West Trinidad',
  'North Trinidad',
  'Port of Spain',
  'East Trinidad',
  'Central Trinidad',
  'South Trinidad',
  'Tobago',
] as const;

export function allRegions(listings: Listing[]): string[] {
  const present = new Set(listings.map((l) => l.region));
  return REGIONS.filter((r) => present.has(r));
}

/** How many filters are actually narrowing the results. Drives the mobile badge. */
export function activeFilterCount(f: Filters): number {
  const bounds = PRICE_BOUNDS[f.listingType];
  let n = 0;
  if (f.region) n += 1;
  if (f.sector !== 'residential') n += 1;
  if (f.propertyTypes.length) n += 1;
  if (f.priceMin > bounds.min || f.priceMax < bounds.max) n += 1;
  if (f.beds > 0) n += 1;
  if (f.baths > 0) n += 1;
  if (f.sqftMin !== null || f.sqftMax !== null) n += 1;
  if (f.amenities.length) n += 1;
  return n;
}

/** One removable filter, as shown in the chip row above the results. */
export interface ActiveChip {
  /** Stable key for React and for the remove handler. */
  key: string;
  /** What the visitor reads, e.g. "3+ beds" or "Maraval". */
  label: string;
  /** The patch that turns this filter off. */
  clear: Partial<Filters>;
}

/**
 * The active filters, as individually removable chips.
 *
 * A count alone ("3 filters") tells a visitor that something is narrowing the
 * results but not what, so the only way out is Clear all — which throws away
 * the two filters they wanted to keep. Every major property site shows the
 * filters themselves and lets each one go independently.
 *
 * Mirrors `activeFilterCount` condition for condition; the two must agree, so
 * change them together.
 */
export function activeChips(f: Filters, money: (n: number) => string): ActiveChip[] {
  const bounds = PRICE_BOUNDS[f.listingType];
  const chips: ActiveChip[] = [];

  if (f.region) {
    chips.push({ key: 'region', label: f.region, clear: { region: '' } });
  }
  if (f.sector !== 'residential') {
    chips.push({ key: 'sector', label: 'Commercial', clear: { sector: 'residential' } });
  }
  for (const t of f.propertyTypes) {
    chips.push({
      key: 'type:' + t,
      label: t,
      clear: { propertyTypes: f.propertyTypes.filter((x) => x !== t) },
    });
  }
  if (f.priceMin > bounds.min || f.priceMax < bounds.max) {
    const from = f.priceMin > bounds.min ? money(f.priceMin) : null;
    const to = f.priceMax < bounds.max ? money(f.priceMax) : null;
    chips.push({
      key: 'price',
      label: from && to ? from + ' – ' + to : from ? from + ' and up' : 'Up to ' + to,
      clear: { priceMin: bounds.min, priceMax: bounds.max },
    });
  }
  if (f.beds > 0) {
    chips.push({ key: 'beds', label: f.beds + '+ beds', clear: { beds: 0 } });
  }
  if (f.baths > 0) {
    chips.push({ key: 'baths', label: f.baths + '+ baths', clear: { baths: 0 } });
  }
  if (f.sqftMin !== null || f.sqftMax !== null) {
    const lo = f.sqftMin !== null ? f.sqftMin.toLocaleString('en-TT') : null;
    const hi = f.sqftMax !== null ? f.sqftMax.toLocaleString('en-TT') : null;
    chips.push({
      key: 'sqft',
      label: (lo && hi ? lo + ' – ' + hi : lo ? lo + '+' : 'Up to ' + hi) + ' sq ft',
      clear: { sqftMin: null, sqftMax: null },
    });
  }
  for (const a of f.amenities) {
    chips.push({
      key: 'amenity:' + a,
      label: a,
      clear: { amenities: f.amenities.filter((x) => x !== a) },
    });
  }

  return chips;
}

export function applyFilters(
  listings: Listing[],
  f: Filters,
  query = '',
): Listing[] {
  const q = query.trim().toLowerCase();

  const out = listings.filter((l) => {
    if (l.listingType !== f.listingType) return false;
    if (f.region && l.region !== f.region) return false;
    // Sector always constrains; an explicit type selection narrows within it.
    // Land belongs to neither sector and is reached through its own route.
    if (!typesForSector(f.sector).includes(l.propertyType)) return false;
    if (f.propertyTypes.length && !f.propertyTypes.includes(l.propertyType)) return false;
    if (l.price < f.priceMin || l.price > f.priceMax) return false;
    if (f.beds > 0 && (l.beds ?? 0) < f.beds) return false;
    if (f.baths > 0 && (l.baths ?? 0) < f.baths) return false;
    if (f.sqftMin !== null && (l.sqft ?? 0) < f.sqftMin) return false;
    if (f.sqftMax !== null && (l.sqft ?? Infinity) > f.sqftMax) return false;
    if (f.amenities.length && !f.amenities.every((a) => l.amenities.includes(a)))
      return false;
    if (q) {
      const haystack = (
        l.title +
        ' ' +
        l.location +
        ' ' +
        l.region +
        ' ' +
        l.propertyType
      ).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...out];
  switch (f.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'beds':
      sorted.sort((a, b) => (b.beds ?? 0) - (a.beds ?? 0));
      break;
    default:
      sorted.sort(
        (a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime(),
      );
  }
  return sorted;
}
