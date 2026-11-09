'use client';

import { useState } from 'react';

/**
 * The location map on a listing detail page.
 *
 * OpenStreetMap's embed rather than Google Maps: it needs no API key, no
 * billing account and no consent banner, which matters for a demo that has to
 * work on a strange wifi in a pitch meeting. A `?q=` Google embed also renders
 * a white search panel over the map, which this avoids entirely.
 *
 * The position is the neighbourhood centroid, not the door — see the note on
 * `Listing.coords`. The caption says so, because a buyer reading a pin as the
 * exact address is a real misunderstanding to avoid.
 *
 * Loaded behind a click rather than on mount: an iframe to a third party is a
 * third-party request on every listing view, and the map is secondary to the
 * photography. The static preview carries the location until then.
 */
export default function LocationMap({
  lat,
  lng,
  location,
  region,
}: {
  lat: number;
  lng: number;
  location: string;
  region: string;
}) {
  const [loaded, setLoaded] = useState(false);

  // A tight box around the point. OSM picks the zoom from the bbox, and this
  // span puts the neighbourhood in frame without showing the whole island.
  const d = 0.012;
  const bbox = [lng - d, lat - d / 1.7, lng + d, lat + d / 1.7].join('%2C');
  const src =
    'https://www.openstreetmap.org/export/embed.html?bbox=' +
    bbox +
    '&layer=mapnik&marker=' +
    lat +
    '%2C' +
    lng;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-bone-edge bg-bone-deep sm:aspect-[2/1]">
        {loaded ? (
          <iframe
            src={src}
            title={'Map showing the approximate location of this property in ' + location}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
            style={{
              // OSM's raster tiles are brighter and bluer than this palette.
              // A light touch of desaturation and warmth settles them onto the
              // bone ground without making the map hard to read.
              filter: 'saturate(0.72) contrast(0.96) sepia(0.08)',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors duration-300 ease-out hover:bg-bone-deep"
          >
            {/* A drawn pin on a ruled ground — the same hairline language as
                the spec ledger, rather than a grey "map unavailable" box. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage:
                  'linear-gradient(#E7E2D8 1px, transparent 1px), linear-gradient(90deg, #E7E2D8 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }}
            />
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-deep/40 bg-gold-wash text-gold-deep transition-transform duration-300 ease-out group-hover:scale-105">
              <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden fill="none">
                <path
                  d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <span className="relative text-[0.88rem] text-ink">
              Show {location} on the map
            </span>
            <span className="relative text-[0.76rem] text-ink-faint">
              {region}
            </span>
          </button>
        )}
      </div>

      <p className="mt-2.5 text-[0.76rem] leading-relaxed text-ink-faint">
        Approximate location, shown to the neighbourhood. Contact the agent for
        the exact address and to arrange a viewing.
      </p>
    </div>
  );
}
