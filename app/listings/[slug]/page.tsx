import type { Metadata } from 'next';
import { getListingBySlug, getListings } from '@/lib/listings';
import ListingDetail from '@/components/ListingDetail';
import { formatPrice } from '@/lib/format';
import { regionSlug } from '@/lib/regions';
import {
  abs,
  breadcrumbSchema,
  jsonLd,
  listingSchema,
  ogImage,
  shareImage,
  SITE_NAME,
} from '@/lib/seo';

/** Every seeded listing is rendered at build time — no request-time fetching. */
export function generateStaticParams() {
  return getListings().map((listing) => ({ slug: listing.slug }));
}

/**
 * A listing created in /admin has a slug that did not exist at build time, so
 * its route must still render rather than 404. The shell is static either way;
 * the content comes from the client store.
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) return { title: 'Listing not found' };

  const path = '/listings/' + listing.slug;
  // Price and place in the description: this is the line that appears under
  // the result in Google and in a WhatsApp preview, so it has to carry the two
  // facts that decide whether anyone taps it.
  const description =
    formatPrice(listing) +
    ' — ' +
    listing.location +
    ', ' +
    listing.region +
    '. ' +
    listing.description;

  return {
    title: listing.title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: {
      type: 'article',
      title: listing.title + ' · ' + formatPrice(listing),
      description,
      url: abs(path),
      siteName: SITE_NAME,
      locale: 'en_TT',
      // The property photograph is the whole reason a shared link gets tapped,
      // so it goes through shareImage: a plain JPEG at exactly the card size,
      // not the AVIF the site's own image URLs negotiate to.
      images: listing.images
        .slice(0, 1)
        .map((url) => ogImage(shareImage(url), listing.title + ', ' + listing.location)),
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title + ' · ' + formatPrice(listing),
      description,
      images: listing.images.slice(0, 1).map((url) => shareImage(url)),
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Schema comes from the build-time listing. A property added in /admin has
  // none, which is correct: it is session-only demo state that no crawler will
  // ever see.
  const listing = getListingBySlug(slug);

  // The detail view resolves the listing from the shared client store, so a
  // property added or edited in /admin renders here too — not just the ten
  // seeded slugs that were known at build time.
  return (
    <>
      {listing && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLd(listingSchema(listing))}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLd(
              breadcrumbSchema([
                { name: 'Home', path: '/' },
                {
                  name: listing.region,
                  path: '/trinidad/' + regionSlug(listing.region),
                },
                { name: listing.title, path: '/listings/' + listing.slug },
              ]),
            )}
          />
        </>
      )}
      <ListingDetail slug={slug} />
    </>
  );
}
