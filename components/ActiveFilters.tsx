'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { activeChips, defaultFilters, type Filters } from '@/lib/filters';
import { formatTTD } from '@/lib/format';

/**
 * The row of removable filter chips above the results.
 *
 * Without it the only signal that filters are on is a count in the bar, and
 * the only way to undo one is Clear all — which also throws away the filters
 * the visitor wanted to keep. Showing each filter as its own chip makes the
 * narrowing legible and reversible one piece at a time.
 *
 * Renders nothing when no filter is active, so the results sit tight under the
 * bar in the common case.
 */
export default function ActiveFilters({
  filters,
  setFilters,
  resultCount,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  resultCount: number;
}) {
  const reduce = useReducedMotion();
  const chips = activeChips(filters, formatTTD);

  if (chips.length === 0) return null;

  return (
    <div className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-2">
      <p className="tnum mr-1 text-[0.8rem] text-ink-mute">
        <span className="text-ink">{resultCount}</span>{' '}
        {resultCount === 1 ? 'match' : 'matches'}
      </p>

      <AnimatePresence initial={false} mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            layout={!reduce}
            // Resting state is visible; the animation only offsets it.
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            type="button"
            onClick={() => setFilters({ ...filters, ...chip.clear })}
            aria-label={'Remove filter: ' + chip.label}
            className="group inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gold-deep/35 bg-gold-wash py-1 pl-3 pr-2 text-[0.8rem] text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-gold-deep hover:bg-gold/25"
          >
            {chip.label}
            <span
              aria-hidden
              className="text-ink-faint transition-colors duration-200 ease-out group-hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => setFilters(defaultFilters(filters.listingType))}
          className="ml-1 inline-flex min-h-9 items-center text-[0.8rem] text-ink-mute underline decoration-bone-edge underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:decoration-ink/40"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
