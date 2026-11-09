import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt.
 *
 * /admin is disallowed even though it is now a visible ribbon tab. The two are
 * not in conflict: a prospect sent the link clicks the tab and sees the listing
 * manager, which is the point — a crawl directive does not hide anything from a
 * person. What it prevents is the manager turning up in a Google result for
 * someone who was never sent the demo.
 *
 * It is a crawl instruction, not security. The page is unauthenticated and
 * world-writable by anyone who knows the URL, which is exactly why it must be
 * gated before any deploy to a domain that outlives the pitch.
 *
 * /saved holds a visitor's own shortlist in their browser. There is nothing
 * there for a crawler and every crawl of it would be an empty page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/saved'],
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  };
}
