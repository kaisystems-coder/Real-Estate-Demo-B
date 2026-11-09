export type ListingType =
  | 'House'
  | 'Apartment'
  | 'Townhouse'
  | 'Villa'
  | 'Land'
  | 'Commercial';

export type ListingStatus = 'Active' | 'Pending' | 'Sold';

export type SaleOrRent = 'Sale' | 'Rent';

export interface Listing {
  id: string;
  slug: string;
  title: string;
  listingType: SaleOrRent;
  propertyType: ListingType;
  status: ListingStatus;
  /** TTD. Monthly figure if Rent. */
  price: number;
  /** Neighbourhood. */
  location: string;
  /** Broader area, used for the location filter. */
  region: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  /** For Land listings. */
  lotSize?: string;
  yearBuilt?: number;
  description: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  /** ISO date. */
  dateListed: string;
  /**
   * Approximate position, for the location map on the detail page.
   *
   * Deliberately the neighbourhood centroid rather than the door: a public
   * listing should show a buyer which part of town it is in without publishing
   * the exact address of an occupied house. The map labels itself
   * "Approximate location" for the same reason.
   *
   * Optional so a listing added through /admin during a pitch is still valid
   * without one; the detail page just omits the map.
   */
  coords?: { lat: number; lng: number };
}

export type ListingDraft = Omit<Listing, 'id' | 'slug'> & {
  id?: string;
  slug?: string;
};

export const PROPERTY_TYPES: ListingType[] = [
  'House',
  'Apartment',
  'Townhouse',
  'Villa',
  'Land',
  'Commercial',
];

/**
 * The split a buyer actually thinks in before they think in property types:
 * somewhere to live, or somewhere to trade from. Land sits in neither, because
 * a parcel is bought on its own terms and has its own route.
 */
export const RESIDENTIAL_TYPES: ListingType[] = [
  'House',
  'Apartment',
  'Townhouse',
  'Villa',
];

export const COMMERCIAL_TYPES: ListingType[] = ['Commercial'];

export type Sector = 'residential' | 'commercial';

export function typesForSector(sector: Sector): ListingType[] {
  return sector === 'residential' ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;
}

export const LISTING_STATUSES: ListingStatus[] = ['Active', 'Pending', 'Sold'];

export const REGIONS = [
  'North-West Trinidad',
  'North Trinidad',
  'East Trinidad',
  'Central Trinidad',
  'South Trinidad',
  'Port of Spain',
  'Tobago',
] as const;
