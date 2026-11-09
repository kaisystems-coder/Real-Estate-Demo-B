import type { Metadata } from 'next';
import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';

/**
 * The page itself is a client component (the shortlist lives in a zustand
 * store backed by localStorage), and a client component cannot export
 * `metadata` — without this layout the route silently fell back to the
 * root title.
 *
 * `noindex` because the shortlist is the visitor's own state: there is
 * nothing here for a crawler, and robots.txt already disallows it.
 */
export const metadata: Metadata = {
  title: 'Saved',
  description: 'The properties you have shortlisted.',
  alternates: { canonical: abs('/saved') },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Saved · ' + SITE_NAME,
    description: 'The properties you have shortlisted.',
    url: abs('/saved'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
