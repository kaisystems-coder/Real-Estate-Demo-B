'use client';

import { useId } from 'react';
import type { SaleOrRent } from '@/types/listing';
import { PRICE_BOUNDS } from '@/lib/filters';

/**
 * Dual-thumb price range built from two stacked native range inputs, so it
 * stays keyboard-operable and announces its values without a custom widget.
 * The track between the thumbs is painted with a gradient on the rail.
 */
export default function PriceRange({
  listingType,
  min,
  max,
  onChange,
}: {
  listingType: SaleOrRent;
  min: number;
  max: number;
  onChange: (next: { priceMin: number; priceMax: number }) => void;
}) {
  const id = useId();
  const bounds = PRICE_BOUNDS[listingType];
  const span = bounds.max - bounds.min || 1;
  const lowPct = ((min - bounds.min) / span) * 100;
  const highPct = ((max - bounds.min) / span) * 100;

  const label = (value: number) =>
    value === 0
      ? '$0'
      : listingType === 'Rent'
      ? '$' + value.toLocaleString('en-TT')
      : value >= 1000000
        ? '$' + (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1) + 'M'
        : '$' + (value / 1000).toFixed(0) + 'k';

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
          Price
        </span>
        <span className="tnum text-[0.8rem] text-ink-soft">
          {label(min)} &ndash; {label(max)}
          {listingType === 'Rent' && <span className="text-ink-faint">/mo</span>}
        </span>
      </div>

      <div className="relative mt-3 h-5">
        {/* Rail */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-bone-edge"
        />
        {/* Selected span */}
        <div
          aria-hidden
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gold"
          style={{ left: lowPct + '%', right: 100 - highPct + '%' }}
        />
        <input
          id={id + '-min'}
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={min}
          aria-label="Minimum price"
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), max - bounds.step);
            onChange({ priceMin: v, priceMax: max });
          }}
          className="range-thumb absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent"
        />
        <input
          id={id + '-max'}
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={max}
          aria-label="Maximum price"
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), min + bounds.step);
            onChange({ priceMin: min, priceMax: v });
          }}
          className="range-thumb absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent"
        />
      </div>

      <style jsx>{`
        /* Only the thumb takes pointer events, so the two stacked inputs
           don't block each other. */
        .range-thumb {
          pointer-events: none;
        }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #faf8f4;
          border: 1.5px solid #8e6f36;
          box-shadow: 0 1px 2px rgba(18, 19, 15, 0.12);
          cursor: grab;
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .range-thumb::-webkit-slider-thumb:active {
          transform: scale(0.92);
          cursor: grabbing;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #faf8f4;
          border: 1.5px solid #8e6f36;
          box-shadow: 0 1px 2px rgba(18, 19, 15, 0.12);
          cursor: grab;
        }
        .range-thumb:focus-visible::-webkit-slider-thumb {
          outline: 2px solid #b8934d;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
