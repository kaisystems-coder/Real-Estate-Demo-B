import type { Metadata } from 'next';
import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';

/**
 * The page itself is a client component (the listing store is per-session
 * demo state), and a client component cannot export `metadata` — without
 * this layout the route silently fell back to the root title.
 *
 * `noindex` matches the existing `Disallow: /admin` in robots.txt. The tab
 * stays visible in the ribbon on purpose so a prospect can click into the
 * listing manager during a pitch; keeping it out of search results is a
 * separate concern from keeping it reachable.
 */
export const metadata: Metadata = {
  title: 'Admin',
  description: 'Listing manager for the demo catalogue.',
  alternates: { canonical: abs('/admin') },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Admin · ' + SITE_NAME,
    description: 'Listing manager for the demo catalogue.',
    url: abs('/admin'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
