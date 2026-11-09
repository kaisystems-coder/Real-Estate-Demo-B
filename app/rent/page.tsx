import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import ListingsBrowser from '@/components/ListingsBrowser';

export const metadata: Metadata = {
  title: 'Rent',
  description:
    'Apartments, houses and commercial space to rent across Trinidad & Tobago, with monthly figures in TTD.',
  alternates: { canonical: abs('/rent') },
  openGraph: {
    title: 'Rent · ' + SITE_NAME,
    description:
      'Apartments, houses and commercial space to rent across Trinidad & Tobago, with monthly figures in TTD.',
    url: abs('/rent'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function RentPage() {
  return (
    <ListingsBrowser
      mode="Rent"
      title="Places to rent, from a month to a long lease"
      intro="Furnished and unfurnished, executive and family. Monthly figures in TTD with no hidden agency markup, and a rentals manager who can hand over keys inside a week."
    />
  );
}
