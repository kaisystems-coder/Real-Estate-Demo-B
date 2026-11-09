import type { Listing } from '@/types/listing';

/**
 * A 10px warm-grey JPEG, used as the blur placeholder under every photo.
 * Inline so it costs no request and the card never flashes white.
 */
export const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQIFBQAAAAAAAAAAAAABAgMABAUGERIhBxMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEiEx0f/aAAwDAQACEQMRAD8AmmXc2YhhWKNPHcSGFn3NCzkqR9FFFMcHeyLGOxS3Y8kkkn7RRSySlt7GKTP/2Q==';

const ttd = new Intl.NumberFormat('en-TT', {
  style: 'currency',
  currency: 'TTD',
  maximumFractionDigits: 0,
});

/** "$4,200,000" for a sale, "$6,500/mo" for a rental. */
export function formatPrice(listing: Pick<Listing, 'price' | 'listingType'>): string {
  const amount = ttd.format(listing.price).replace('TTD', '').replace(/\s/g, '');
  return listing.listingType === 'Rent' ? amount + '/mo' : amount;
}

/** Bare figure with thousands separators, for form fields and table cells. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-TT').format(value);
}

/**
 * "$1,234,567" — a money column figure for the calculator statements.
 *
 * Rounded to the dollar: cents on a six-figure estimate imply a precision the
 * figures do not have, and they misalign the column. Guards non-finite input
 * so a cleared field renders "$0" rather than "$NaN".
 */
export function formatTTD(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return '$' + new Intl.NumberFormat('en-TT').format(safe);
}

/** "3.5" not "3.50" — half-baths are common here. */
export function formatBaths(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-TT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * The spec ledger: the stat row repeated on the card, the detail page and the
 * admin table. Land has no beds or baths, commercial has no beds — each type
 * reports only the figures an agent would actually print on its sheet.
 */
export function specLedger(listing: Listing): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [];
  if (listing.beds !== null) specs.push({ label: 'Bed', value: String(listing.beds) });
  if (listing.baths !== null)
    specs.push({ label: 'Bath', value: formatBaths(listing.baths) });
  if (listing.sqft !== null)
    specs.push({ label: 'Sq Ft', value: formatNumber(listing.sqft) });
  if (listing.lotSize) specs.push({ label: 'Lot', value: listing.lotSize });
  if (listing.yearBuilt) specs.push({ label: 'Built', value: String(listing.yearBuilt) });
  return specs;
}
