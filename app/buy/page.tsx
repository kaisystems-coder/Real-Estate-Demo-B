import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import ListingsBrowser from '@/components/ListingsBrowser';

export const metadata: Metadata = {
  title: 'Buy',
  description:
    'Houses, apartments, townhouses, villas, land and commercial property for sale across Trinidad & Tobago, priced in TTD.',
  alternates: { canonical: abs('/buy') },
  openGraph: {
    title: 'Buy · ' + SITE_NAME,
    description:
      'Houses, apartments, townhouses, villas, land and commercial property for sale across Trinidad & Tobago, priced in TTD.',
    url: abs('/buy'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function BuyPage() {
  return (
    <ListingsBrowser
      mode="Sale"
      title="Property for sale across Trinidad & Tobago"
      intro="Every listing is measured, photographed and priced in TTD. Filter by area, type, budget and the details that decide it — then book a viewing with the agent who holds the file."
    />
  );
}
