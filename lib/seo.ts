import type { Listing } from '@/types/listing';
import type { Agent } from '@/types/agent';
import { BRAND } from '@/components/Logo';

/**
 * One place for everything search engines and link previews read.
 *
 * The demo had per-page titles but nothing else: no sitemap, no robots, no
 * structured data and no OpenGraph, which meant a listing shared on WhatsApp
 * — the way property actually circulates in Trinidad — rendered as a bare grey
 * link, and Google had no way to understand a listing as a property rather
 * than as a page of text.
 *
 * Reskinning: SITE_URL is the only value here that must change per client.
 */

/**
 * The canonical origin, no trailing slash.
 *
 * NEXT_PUBLIC_SITE_URL wins when it is set. Otherwise, on Vercel, the
 * project's production domain (which becomes the custom domain once one is
 * attached), then the deployment's own URL. Without those fallbacks every
 * canonical and og:url on the live site pointed at localhost unless someone
 * remembered to set the variable. Localhost is the last resort, for local
 * builds only. Every consumer of this module is a server component, so the
 * non-public Vercel variables are readable here.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  if (process.env.VERCEL_URL) return 'https://' + process.env.VERCEL_URL;
  return 'http://localhost:5300';
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, '');

export const SITE_NAME = BRAND.name + ' ' + BRAND.suffix;

/** The shape WhatsApp, iMessage and Facebook render as a large preview card. */
export const SHARE_W = 1200;
export const SHARE_H = 630;

/**
 * Rewrites an Unsplash or Pexels photo URL into one that link previews render
 * sharply.
 *
 * Both CDNs negotiate format from the Accept header, so the `auto=format` /
 * `auto=compress` URLs used on the site were served to WhatsApp's crawler as
 * AVIF — which it handles badly, falling back to a small low-resolution
 * thumbnail stretched across the card. That, plus quality 74, was the blurry
 * preview. Forcing `fm=jpg` returns a plain JPEG to every client, cropped to
 * the exact 1200x630 the card displays (so nothing is rescaled twice), and
 * the quality is chosen to stay under the ~300KB WhatsApp will reliably
 * fetch: measured at 152KB from Unsplash and 286KB from Pexels.
 *
 * Any other URL is returned untouched.
 */
export function shareImage(src: string, opts: { faces?: boolean } = {}): string {
  let u: URL;
  try {
    u = new URL(remoteOriginal(src));
  } catch {
    return src;
  }
  if (u.hostname === 'images.unsplash.com') {
    u.search = '';
    u.searchParams.set('fm', 'jpg');
    u.searchParams.set('fit', 'crop');
    if (opts.faces) u.searchParams.set('crop', 'faces');
    u.searchParams.set('w', String(SHARE_W));
    u.searchParams.set('h', String(SHARE_H));
    u.searchParams.set('q', '85');
  } else if (u.hostname === 'images.pexels.com') {
    u.search = '';
    u.searchParams.set('cs', 'tinysrgb');
    u.searchParams.set('fm', 'jpg');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('w', String(SHARE_W));
    u.searchParams.set('h', String(SHARE_H));
    u.searchParams.set('q', '80');
  }
  return u.toString();
}

/**
 * The CDN original of a photo the site serves from public/photos/.
 *
 * The pages render local copies so they never wait on Unsplash, but a link
 * preview still wants the CDN's exact 1200x630 JPEG crop, which a local
 * 1600px file cannot give. The file names keep the original IDs
 * (photo-…, agent-photo-…, pexels-N), so the mapping is mechanical.
 */
function remoteOriginal(src: string): string {
  const m = src.match(/^\/photos\/(?:agent-)?(photo-[\w-]+|pexels-(\d+))\.jpg$/);
  if (!m) return src;
  return m[2]
    ? 'https://images.pexels.com/photos/' + m[2] + '/pexels-photo-' + m[2] + '.jpeg'
    : 'https://images.unsplash.com/' + m[1];
}

/**
 * The default share image — the hero photograph.
 *
 * A page that declares its own `openGraph` block replaces the parent's
 * entirely — Next does not merge the two — so every such page has to restate
 * an image or it shares as a blank card.
 */
export const DEFAULT_OG_IMAGE = shareImage(
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
);

/** OpenGraph image entry with the dimensions and type crawlers want stated. */
export function ogImage(url: string, alt: string) {
  return { url, width: SHARE_W, height: SHARE_H, type: 'image/jpeg', alt };
}

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return SITE_URL + (path.startsWith('/') ? path : '/' + path);
}

/**
 * The agency itself, as Google understands it.
 *
 * RealEstateAgent is a LocalBusiness subtype, so it carries address, phone and
 * area served — the fields that feed a local pack result. Emitted once, in the
 * root layout, rather than per page.
 */
export function organisationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': abs('/#agency'),
    name: SITE_NAME,
    url: SITE_URL,
    telephone: BRAND.phone,
    email: BRAND.email,
    description:
      'Licensed real estate agency in Trinidad & Tobago. Residential and commercial sales, rentals, land, valuations and property management.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Fitt Street',
      addressLocality: 'Woodbrook, Port of Spain',
      addressCountry: 'TT',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Trinidad and Tobago',
    },
    knowsLanguage: 'en',
  };
}

/**
 * One listing, as a property Google can put in a rich result.
 *
 * Uses RealEstateListing (a subtype of Product/Offer) over the older
 * SingleFamilyResidence so rentals, commercial units and land all validate
 * under the same shape. Only fields the listing actually carries are emitted —
 * an invented floorSize on a parcel of land is worse than an absent one.
 */
export function listingSchema(listing: Listing) {
  const url = abs('/listings/' + listing.slug);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url + '#listing',
    url,
    name: listing.title,
    description: listing.description,
    datePosted: listing.dateListed,
    // Schema needs absolute URLs; the photos are served from this site now.
    image: listing.images.map((src) => (src.startsWith('/') ? abs(src) : src)),
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'TTD',
      // A rental price is a monthly figure, which Offer alone cannot express.
      ...(listing.listingType === 'Rent'
        ? { priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: listing.price,
            priceCurrency: 'TTD',
            unitCode: 'MON',
          } }
        : {}),
      availability:
        listing.status === 'Sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      seller: { '@id': abs('/#agency') },
    },
  };

  // The property itself, nested. Land has no beds, baths or floor area, so
  // each field is conditional rather than defaulted to zero.
  const about: Record<string, unknown> = {
    '@type': listing.propertyType === 'Land' ? 'LandForm' : 'Accommodation',
    name: listing.title,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location,
      addressRegion: listing.region,
      addressCountry: 'TT',
    },
  };
  if (listing.beds !== null) about.numberOfBedrooms = listing.beds;
  if (listing.baths !== null) about.numberOfBathroomsTotal = listing.baths;
  if (listing.sqft !== null) {
    about.floorSize = {
      '@type': 'QuantitativeValue',
      value: listing.sqft,
      unitCode: 'FTK', // square foot
    };
  }
  if (listing.amenities.length) about.amenityFeature = listing.amenities.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a,
  }));
  if (listing.coords) {
    about.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.coords.lat,
      longitude: listing.coords.lng,
    };
  }

  schema.about = about;
  return schema;
}

/**
 * One agent, as a person.
 *
 * Agent pages previously carried only the inherited agency schema, so Google
 * saw a page about the business rather than about a named person with a
 * territory. RealEstateAgent is a LocalBusiness subtype and wrong for an
 * individual; Person with `worksFor` is the correct shape, and areaServed is
 * what makes the page eligible for "estate agent in <area>" queries.
 */
export function agentSchema(agent: Agent) {
  const url = abs('/our-agents/' + agent.slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': url + '#person',
    url,
    name: agent.name,
    jobTitle: agent.role,
    description: agent.bio,
    image: agent.image.startsWith('/') ? abs(agent.image) : agent.image,
    telephone: agent.phone,
    email: agent.email,
    worksFor: { '@id': abs('/#agency') },
    areaServed: agent.territories.map((t) => ({ '@type': 'Place', name: t })),
    knowsAbout: agent.specialties,
    knowsLanguage: agent.languages,
  };
}

/**
 * A breadcrumb trail, so the SERP shows "Listings › Port of Spain › Title"
 * instead of a raw URL.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/** A results page, as an ordered list of the listings it shows. */
export function itemListSchema(listings: Listing[], path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': abs(path) + '#results',
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs('/listings/' + l.slug),
      name: l.title,
    })),
  };
}

/**
 * Renders a schema object as a JSON-LD script tag.
 *
 * dangerouslySetInnerHTML is the documented way to emit JSON-LD in React; the
 * payload is our own serialised object, never user input. `<` is escaped so a
 * stray sequence in a description can never close the script tag early.
 */
export function jsonLd(schema: object) {
  return {
    __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
  };
}
