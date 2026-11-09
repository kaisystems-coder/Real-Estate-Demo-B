'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * The opening block on every interior page.
 *
 * A bone header rather than a second dark hero: only the homepage and About
 * carry photography at the top, so the working pages start light and the
 * listings below them are the first thing with colour in it.
 *
 * The rule under the title is the page's one ornament — a hairline that stops
 * short, echoing the spec ledger's borders.
 */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  meta,
  query,
  setQuery,
  searchLabel = 'Search',
}: {
  eyebrow: string;
  title: string;
  intro: string;
  /** Small figure under the intro, e.g. a result count. */
  meta?: string;
  /** Passing both enables the search field. */
  query?: string;
  setQuery?: (q: string) => void;
  searchLabel?: string;
}) {
  const reduce = useReducedMotion();

  // Resting state is visible; the animation only offsets it.
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const searchable = typeof query === 'string' && typeof setQuery === 'function';

  return (
    <section className="border-b border-bone-edge bg-bone-deep/40">
      <div className="mx-auto max-w-[82rem] px-5 pb-10 pt-[7.5rem] sm:px-8 sm:pb-12 sm:pt-[8.5rem]">
        <div className="max-w-[46rem]">
          <motion.p
            {...rise(0.04)}
            className="text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            {...rise(0.1)}
            className="mt-3.5 font-display text-[2.1rem] leading-[1.08] tracking-display text-ink sm:text-[2.7rem]"
          >
            {title}
          </motion.h1>

          <motion.div {...rise(0.14)} aria-hidden className="mt-5 h-px w-16 bg-gold" />

          <motion.p
            {...rise(0.18)}
            className="mt-5 max-w-[38rem] text-[0.98rem] leading-[1.7] text-ink-mute"
          >
            {intro}
          </motion.p>
        </div>

        {searchable && (
          <motion.div {...rise(0.24)} className="mt-8 max-w-[34rem]">
            <label htmlFor="page-search" className="sr-only">
              {searchLabel}
            </label>
            <div className="flex items-center gap-2 rounded-sm border border-bone-edge bg-bone p-1.5 transition-colors duration-300 ease-out focus-within:border-gold hover:border-ink/25">
              <svg
                aria-hidden
                width="17"
                height="17"
                viewBox="0 0 18 18"
                className="ml-2.5 shrink-0 text-ink-faint"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="5.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M12 12l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                id="page-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Maraval, Tobago, townhouse&hellip;"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] text-ink outline-none placeholder:text-ink-faint desk:text-[0.95rem]"
              />
            </div>
          </motion.div>
        )}

        {meta && (
          <motion.p {...rise(0.28)} className="tnum mt-4 text-[0.82rem] text-ink-faint">
            {meta}
          </motion.p>
        )}
      </div>
    </section>
  );
}
