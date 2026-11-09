import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WhatsAppButton from '@/components/WhatsAppButton';
import {
  DEFAULT_OG_IMAGE,
  jsonLd,
  ogImage,
  organisationSchema,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

/**
 * Display face: Playfair Display. Fraunces' soft/wonk axes read as editorial
 * and a little playful for a site prospects judge as "would this look
 * professional with my listings on it" — Playfair's higher-contrast, formal
 * old-style letterforms are the closer match to how established T&T agency
 * brands (Terra Caribbean among them) actually set headlines.
 */
const display = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  // Variant B sets its hero line and the search phrases in the true italic.
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const sans = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
});

const DESCRIPTION =
  'Licensed real estate agency in Trinidad & Tobago. Houses, apartments, land and commercial space for sale and rent, from Westmoorings to Bon Accord.';

export const metadata: Metadata = {
  // Makes every relative URL in metadata below resolve to an absolute one,
  // which OpenGraph requires — a relative og:image is ignored outright.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME + ' — Trinidad & Tobago',
    template: '%s · ' + SITE_NAME,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  // In Trinidad property circulates on WhatsApp, which reads OpenGraph. With
  // no og tags a shared listing renders as a bare grey link and the agency
  // loses the click.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_TT',
    url: SITE_URL,
    title: SITE_NAME + ' — Trinidad & Tobago',
    description: DESCRIPTION,
    // The hero photograph. Without an og:image a link shared on WhatsApp
    // renders as a bare grey row and loses the tap.
    images: [ogImage(DEFAULT_OG_IMAGE, SITE_NAME + ' — property across Trinidad & Tobago')],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME + ' — Trinidad & Tobago',
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'real estate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-TT" className={display.variable + ' ' + sans.variable}>
      <body className="font-sans antialiased">
        {/* The agency, as a RealEstateAgent. Emitted once here rather than per
            page so every page inherits one canonical @id to reference. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(organisationSchema())}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bone"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
