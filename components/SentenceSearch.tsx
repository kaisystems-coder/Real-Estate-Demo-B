'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useId, useMemo, useState } from 'react';
import { useListingsStore } from '@/lib/store';
import { applyFilters, defaultFilters, REGIONS } from '@/lib/filters';
import type { ListingType, SaleOrRent } from '@/types/listing';

/**
 * The hero search, written as a sentence the visitor finishes.
 *
 *   I'd like to [buy] [a house] in [Port of Spain], up to [$3.5M].
 *
 * Each underlined phrase is a native select laid over its own words, so it
 * keeps the phone's picker, keyboard stepping and a real label, while reading
 * as plain language rather than a row of form fields. The button counts the
 * matches as the sentence changes, so a visitor knows what they will see
 * before they press it.
 *
 * Every option is read off the catalogue. A phrase that would lead to an
 * empty grid is never offered, and a choice that stops making sense after
 * another phrase changes falls back to "anything" rather than to nothing.
 */

type Mode = 'buy' | 'rent';

/** How each property type reads in the sentence. */
const TYPE_PHRASE: Partial<Record<ListingType, string>> = {
  House: 'a house',
  Apartment: 'an apartment',
  Townhouse: 'a townhouse',
  Villa: 'a villa',
  Commercial: 'commercial space',
};

/** Budget ceilings in TTD. Sale and rent are separate scales. */
const SALE_CAPS = [1_000_000, 1_500_000, 2_000_000, 3_500_000, 5_000_000];
const RENT_CAPS = [5_000, 8_000, 12_000, 20_000];

function capPhrase(value: number, mode: Mode): string {
  if (mode === 'rent') return '$' + (value / 1000).toFixed(0) + 'k a month';
  const m = value / 1_000_000;
  return '$' + (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)) + 'M';
}

export default function SentenceSearch() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const uid = useId();
  const listings = useListingsStore((s) => s.listings);

  const [mode, setMode] = useState<Mode>('buy');
  const [type, setType] = useState<ListingType | ''>('');
  const [region, setRegion] = useState('');
  const [cap, setCap] = useState<number | ''>('');
  const [query, setQuery] = useState('');

  const listingType: SaleOrRent = mode === 'buy' ? 'Sale' : 'Rent';

  // Land has its own route and its own link below the sentence.
  const stock = useMemo(
    () => listings.filter((l) => l.listingType === listingType && l.propertyType !== 'Land'),
    [listings, listingType],
  );

  const types = useMemo(
    () =>
      (Object.keys(TYPE_PHRASE) as ListingType[]).filter((t) =>
        stock.some((l) => l.propertyType === t),
      ),
    [stock],
  );
  const safeType = types.includes(type as ListingType) ? type : '';

  // "Anything" in the type phrase means somewhere to live: the browsing route
  // opens in the residential sector, so a region whose only stock is a
  // warehouse would open on an empty grid.
  const ofType = useMemo(
    () =>
      stock.filter((l) =>
        safeType ? l.propertyType === safeType : l.propertyType !== 'Commercial',
      ),
    [stock, safeType],
  );

  const regions = useMemo(
    () => REGIONS.filter((r) => ofType.some((l) => l.region === r)),
    [ofType],
  );
  const safeRegion = (regions as readonly string[]).includes(region) ? region : '';

  const inRegion = useMemo(
    () => (safeRegion ? ofType.filter((l) => l.region === safeRegion) : ofType),
    [ofType, safeRegion],
  );

  // Only ceilings that actually cut what is left: above the cheapest match
  // and below the dearest, since "up to the most expensive" means no limit.
  const caps = useMemo(() => {
    const prices = inRegion.map((l) => l.price);
    if (!prices.length) return [];
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    return (mode === 'buy' ? SALE_CAPS : RENT_CAPS).filter((c) => c > lo && c < hi);
  }, [inRegion, mode]);
  const safeCap = cap !== '' && caps.includes(cap) ? cap : '';

  /** The same predicate the browsing route will run, so the count is exact. */
  const matches = useMemo(() => {
    const f = defaultFilters(listingType);
    if (safeRegion) f.region = safeRegion;
    if (safeType) {
      f.propertyTypes = [safeType];
      if (safeType === 'Commercial') f.sector = 'commercial';
    }
    if (safeCap !== '') f.priceMax = safeCap;
    return applyFilters(listings, f, query).length;
  }, [listings, listingType, safeRegion, safeType, safeCap, query]);

  const landCount = listings.filter((l) => l.propertyType === 'Land').length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (safeRegion) params.set('region', safeRegion);
    if (safeType) params.set('type', safeType);
    if (safeCap !== '') params.set('max', String(safeCap));
    const qs = params.toString();
    router.push('/' + mode + (qs ? '?' + qs : ''));
  };

  // A sale ceiling means nothing to a rental, so switching drops the budget.
  const switchMode = (next: Mode) => {
    setMode(next);
    setCap('');
  };

  const rise = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const },
      };

  const noun = mode === 'buy' ? (matches === 1 ? 'property' : 'properties') : matches === 1 ? 'rental' : 'rentals';

  return (
    <motion.form
      {...rise}
      onSubmit={submit}
      aria-label="Search properties"
      className="mt-9 max-w-[38rem] rounded-sm border border-bone-edge bg-bone p-5 shadow-lift xs:p-6 sm:p-7"
    >
      <p
        id={uid + '-sentence'}
        className="font-display text-[1.4rem] leading-[1.75] tracking-[-0.01em] text-ink xs:text-[1.55rem] sm:text-[1.8rem] sm:leading-[1.7]"
      >
        I&rsquo;d like to{' '}
        <Phrase
          id={uid + '-mode'}
          label="Buy or rent"
          value={mode}
          onChange={(v) => switchMode(v as Mode)}
          options={[
            { value: 'buy', label: 'buy' },
            { value: 'rent', label: 'rent' },
          ]}
        />{' '}
        <Phrase
          id={uid + '-type'}
          label="Property type"
          value={safeType}
          onChange={(v) => setType(v as ListingType | '')}
          options={[
            { value: '', label: 'a home' },
            ...types.map((t) => ({ value: t, label: TYPE_PHRASE[t] as string })),
          ]}
        />{' '}
        in{' '}
        <Phrase
          id={uid + '-region'}
          label="Area"
          value={safeRegion}
          onChange={setRegion}
          options={[
            { value: '', label: 'any part of T&T' },
            ...regions.map((r) => ({ value: r, label: r })),
          ]}
        />
        {caps.length > 0 && (
          <>
            , up to{' '}
            <Phrase
              id={uid + '-cap'}
              label={mode === 'buy' ? 'Budget' : 'Monthly budget'}
              value={safeCap === '' ? '' : String(safeCap)}
              onChange={(v) => setCap(v === '' ? '' : Number(v))}
              options={[
                { value: '', label: 'any budget' },
                ...caps.map((c) => ({ value: String(c), label: capPhrase(c, mode) })),
              ]}
            />
          </>
        )}
        .
      </p>

      <div className="mt-5 flex flex-col gap-3 border-t border-bone-edge pt-5 sm:flex-row sm:items-center">
        <label htmlFor={uid + '-q'} className="sr-only">
          Search by area, street or keyword
        </label>
        <div className="relative min-w-0 flex-1">
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 18 18"
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint"
          >
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id={uid + '-q'}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Or a name: Maraval, Bayshore…"
            className="min-h-11 w-full border-b border-bone-edge bg-transparent pl-6 text-[16px] text-ink outline-none transition-colors duration-200 ease-out placeholder:text-ink-faint hover:border-ink/25 focus:border-gold-deep desk:text-[0.92rem]"
          />
        </div>
        <button
          type="submit"
          disabled={matches === 0}
          className="tnum flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-sm bg-ink px-5 text-[0.9rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/40"
        >
          {matches === 0 ? 'No matches yet' : 'See ' + matches + ' ' + noun}
          <svg aria-hidden width="16" height="12" viewBox="0 0 20 14" fill="none">
            <path
              d="M1 7h17M12.5 1.5L18.5 7l-6 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {landCount > 0 && (
        <p className="mt-4 text-[0.82rem] text-ink-mute">
          Looking for a plot instead?{' '}
          <Link
            href="/land"
            className="tnum inline-flex min-h-11 items-center text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
          >
            {landCount} parcels of land
          </Link>
        </p>
      )}
    </motion.form>
  );
}

/**
 * One fill-in phrase. The words are what the visitor reads; an invisible
 * native select covers them and does the choosing. The underline and caret
 * are what say "this changes", and the focus ring lands on the phrase, since
 * the select itself is transparent.
 */
function Phrase({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const current = options.find((o) => o.value === value)?.label ?? options[0]?.label;

  return (
    <span className="group relative inline-flex min-h-11 items-baseline gap-1.5 whitespace-nowrap rounded-[2px] align-baseline transition-colors duration-200 ease-out hover:bg-gold-wash/60 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold">
      <span className="border-b-2 border-gold/55 italic leading-[1.15] text-gold-deep transition-colors duration-200 ease-out group-hover:border-gold-deep">
        {current}
      </span>
      <svg
        aria-hidden
        width="11"
        height="7"
        viewBox="0 0 11 7"
        fill="none"
        className="relative -top-[0.2em] shrink-0 text-gold-deep/70"
      >
        <path
          d="M1 1.2 5.5 5.6 10 1.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 text-[16px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}
