import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import LandBrowser from '@/components/LandBrowser';

export const metadata: Metadata = {
  title: 'Land',
  description:
    'Surveyed parcels, plots and acreage for sale and lease across Trinidad & Tobago, with the land-only stamp duty schedule explained.',
  alternates: { canonical: abs('/land') },
  openGraph: {
    title: 'Land · ' + SITE_NAME,
    description:
      'Surveyed parcels, plots and acreage for sale and lease across Trinidad & Tobago, with the land-only stamp duty schedule explained.',
    url: abs('/land'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function LandPage() {
  return <LandBrowser />;
}
