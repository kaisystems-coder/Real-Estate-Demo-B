import type { MetadataRoute } from 'next';
import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getAgents } from '@/lib/agents';
import { REGIONS } from '@/lib/filters';
import { regionSlug } from '@/lib/regions';
import { SITE_URL } from '@/lib/seo';

/**
 * The sitemap, generated from the same data the pages render from.
 *
 * Built from MOCK_LISTINGS rather than the zustand store on purpose: the store
 * is per-visitor session state, and a sitemap has to describe what a crawler
 * would find on a cold request. Listings added through /admin during a pitch
 * are demo state and correctly absent here.
 *
 * Excluded by design: /saved (a visitor's own device state, nothing to index)
 * and /admin (unauthenticated listing manager — see the note in lib/nav.ts).
 * Both are also disallowed in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }[] = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/buy', priority: 0.9, changeFrequency: 'daily' },
    { path: '/rent', priority: 0.9, changeFrequency: 'daily' },
    { path: '/land', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/sell', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/our-agents', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/mortgages', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: SITE_URL + r.path,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),

    // Region pages — the queries people actually type ("houses for sale in
    // Chaguanas"), so they rank above the generic /buy.
    ...REGIONS.map((region) => ({
      url: SITE_URL + '/trinidad/' + regionSlug(region),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Listings carry their own dateListed, which is a truthful lastModified
    // rather than "now" on every build.
    ...MOCK_LISTINGS.map((l) => ({
      url: SITE_URL + '/listings/' + l.slug,
      lastModified: new Date(l.dateListed),
      changeFrequency: 'weekly' as const,
      priority: l.featured ? 0.8 : 0.7,
    })),

    ...getAgents().map((a) => ({
      url: SITE_URL + '/our-agents/' + a.slug,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
