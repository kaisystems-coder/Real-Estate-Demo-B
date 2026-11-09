'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Listing, ListingType, SaleOrRent, Sector } from '@/types/listing';
import { typesForSector } from '@/types/listing';
import {
  activeFilterCount,
  allAmenities,
  allRegions,
  defaultFilters,
  PRICE_BOUNDS,
  type Filters,
  type SortKey,
} from '@/lib/filters';
import PriceRange from './PriceRange';

/**
 * The listings filter bar, variant B: one horizontal row of pills.
 *
 * Each pill names a filter and, once set, reads back its value ("Port of
 * Spain", "3+ bd · 2+ ba"), so the row doubles as a summary of the search.
 * Pressing one opens that filter alone: a dropdown under the pill on a desk,
 * a bottom sheet on a phone. Results update live behind it, so there is no
 * apply step to forget.
 *
 * There is no side rail. The grid gets the full width of the page.
 */

type Panel = 'location' | 'type' | 'price' | 'rooms' | 'more';

const SECTORS: { value: Sector; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];

const BED_STEPS = [0, 1, 2, 3, 4, 5];
const BATH_STEPS = [0, 1, 2, 3, 4];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'beds', label: 'Most bedrooms' },
];

const PANEL_TITLE: Record<Panel, string> = {
  location: 'Location',
  type: 'Property type',
  price: 'Price',
  rooms: 'Beds & baths',
  more: 'More filters',
};

/** True from the sm breakpoint up, where panels drop down instead of sheeting up. */
function useIsDesk() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setDesk(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return desk;
}

function money(value: number, mode: SaleOrRent): string {
  if (mode === 'Rent') return '$' + (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
  return value >= 1_000_000
    ? '$' + (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + 'M'
    : '$' + (value / 1000).toFixed(0) + 'k';
}

/* ------------------------------------------------------------------ */

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'min-h-11 min-w-11 rounded-full border px-4 text-[0.85rem] transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] desk:min-h-9 desk:min-w-9 desk:px-3.5 desk:text-[0.8rem] ' +
        (active
          ? 'border-ink bg-ink text-bone'
          : 'border-bone-edge bg-bone text-ink-mute hover:border-ink/30 hover:text-ink')
      }
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">{children}</span>
  );
}

/** The controls for one panel. Shared by the dropdown and the sheet. */
function PanelBody({
  panel,
  filters,
  patch,
  listings,
  showSort,
}: {
  panel: Panel;
  filters: Filters;
  patch: (part: Partial<Filters>) => void;
  listings: Listing[];
  showSort: boolean;
}) {
  if (panel === 'location') {
    const regions = allRegions(listings);
    const options = [{ value: '', label: 'Anywhere in T&T' }, ...regions.map((r) => ({ value: r, label: r }))];
    return (
      <div role="radiogroup" aria-label="Location" className="flex flex-col">
        {options.map((o) => {
          const active = filters.region === o.value;
          return (
            <button
              key={o.value || 'any'}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => patch({ region: o.value })}
              className={
                'flex min-h-11 items-center justify-between gap-4 rounded-sm px-3 text-left text-[0.95rem] transition-colors duration-150 ease-out desk:min-h-10 desk:text-[0.88rem] ' +
                (active ? 'bg-gold-wash text-ink' : 'text-ink-mute hover:bg-bone-deep hover:text-ink')
              }
            >
              {o.label}
              {active && (
                <svg aria-hidden width="14" height="11" viewBox="0 0 14 11" fill="none" className="shrink-0 text-gold-deep">
                  <path d="M1 5.5 5 9.5 13 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (panel === 'type') {
    const visibleTypes = typesForSector(filters.sector);
    // Switching sector drops what the new sector cannot show, or filters keep
    // narrowing after their controls have left the screen.
    const setSector = (sector: Sector) =>
      patch({
        sector,
        propertyTypes: filters.propertyTypes.filter((t) => typesForSector(sector).includes(t)),
        ...(sector === 'residential' ? {} : { beds: 0, baths: 0 }),
      });
    const toggle = (t: ListingType) =>
      patch({
        propertyTypes: filters.propertyTypes.includes(t)
          ? filters.propertyTypes.filter((x) => x !== t)
          : [...filters.propertyTypes, t],
      });
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <FieldLabel>Use</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <Chip key={s.value} active={filters.sector === s.value} onClick={() => setSector(s.value)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>
        {visibleTypes.length > 1 && (
          <div className="flex flex-col gap-2.5">
            <FieldLabel>Type</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {visibleTypes.map((t) => (
                <Chip key={t} active={filters.propertyTypes.includes(t)} onClick={() => toggle(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (panel === 'price') {
    return (
      <PriceRange
        listingType={filters.listingType}
        min={filters.priceMin}
        max={filters.priceMax}
        onChange={(next) => patch(next)}
      />
    );
  }

  if (panel === 'rooms') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <FieldLabel>Bedrooms, at least</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {BED_STEPS.map((n) => (
              <Chip key={n} active={filters.beds === n} onClick={() => patch({ beds: n })}>
                {n === 0 ? 'Any' : n === 5 ? '5+' : n}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <FieldLabel>Bathrooms, at least</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {BATH_STEPS.map((n) => (
              <Chip key={n} active={filters.baths === n} onClick={() => patch({ baths: n })}>
                {n === 0 ? 'Any' : n === 4 ? '4+' : n}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // more
  const amenities = allAmenities(listings);
  const toggleAmenity = (a: string) =>
    patch({
      amenities: filters.amenities.includes(a)
        ? filters.amenities.filter((x) => x !== a)
        : [...filters.amenities, a],
    });
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {showSort && (
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sheet-sort">
            <FieldLabel>Sort by</FieldLabel>
          </label>
          <select
            id="sheet-sort"
            value={filters.sort}
            onChange={(e) => patch({ sort: e.target.value as SortKey })}
            className="w-full min-w-0 rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <FieldLabel>Floor area, sq ft</FieldLabel>
        <div className="flex min-w-0 items-center gap-2">
          <input
            id="filter-sqft-min"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum square feet"
            value={filters.sqftMin ?? ''}
            onChange={(e) => patch({ sqftMin: e.target.value === '' ? null : Number(e.target.value) })}
            className="tnum w-full min-w-0 rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink placeholder:text-ink-faint desk:py-2 desk:text-[0.86rem]"
          />
          <span aria-hidden className="text-ink-faint">
            &ndash;
          </span>
          <input
            id="filter-sqft-max"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum square feet"
            value={filters.sqftMax ?? ''}
            onChange={(e) => patch({ sqftMax: e.target.value === '' ? null : Number(e.target.value) })}
            className="tnum w-full min-w-0 rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink placeholder:text-ink-faint desk:py-2 desk:text-[0.86rem]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <FieldLabel>Amenities</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <Chip key={a} active={filters.amenities.includes(a)} onClick={() => toggleAmenity(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function FilterBar({
  mode,
  filters,
  setFilters,
  listings,
  resultCount,
}: {
  /** Fixed by the route: /buy is Sale, /rent is Rent. */
  mode: SaleOrRent;
  filters: Filters;
  setFilters: (next: Filters) => void;
  listings: Listing[];
  resultCount: number;
}) {
  const reduce = useReducedMotion();
  const desk = useIsDesk();
  const uid = useId();
  const [open, setOpen] = useState<Panel | null>(null);
  // The portal target only exists in the browser; rendering it before mount
  // would make the server and client trees disagree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const barRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<Panel, HTMLButtonElement | null>>>({});

  const patch = useCallback(
    (part: Partial<Filters>) => setFilters({ ...filters, ...part }),
    [filters, setFilters],
  );

  const bounds = PRICE_BOUNDS[mode];
  const count = activeFilterCount(filters);
  const residential = filters.sector === 'residential';

  const close = useCallback((returnFocus = true) => {
    setOpen((current) => {
      if (current && returnFocus) triggers.current[current]?.focus();
      return null;
    });
  }, []);

  // Escape closes; a press anywhere outside the bar and the open panel closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (barRef.current?.contains(t) || sheetRef.current?.contains(t)) return;
      close(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, close]);

  // Lock the page behind the phone sheet.
  useEffect(() => {
    if (!open || desk) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, desk]);

  // The rooms filter means nothing on commercial stock, so its pill leaves
  // the row; close it if it was open when the sector changed.
  useEffect(() => {
    if (open === 'rooms' && !residential) setOpen(null);
  }, [open, residential]);

  /** What each pill reads, and whether its filter is narrowing the results. */
  const summary: Record<Panel, { label: string; active: boolean }> = {
    location: { label: filters.region || 'Location', active: Boolean(filters.region) },
    type: {
      label:
        filters.propertyTypes.length === 0
          ? residential
            ? 'Property type'
            : 'Commercial'
          : filters.propertyTypes.length === 1
            ? filters.propertyTypes[0]
            : filters.propertyTypes[0] + ' +' + (filters.propertyTypes.length - 1),
      active: !residential || filters.propertyTypes.length > 0,
    },
    price: {
      label:
        filters.priceMin > bounds.min && filters.priceMax < bounds.max
          ? money(filters.priceMin, mode) + ' – ' + money(filters.priceMax, mode)
          : filters.priceMin > bounds.min
            ? money(filters.priceMin, mode) + '+'
            : filters.priceMax < bounds.max
              ? 'Up to ' + money(filters.priceMax, mode)
              : 'Price',
      active: filters.priceMin > bounds.min || filters.priceMax < bounds.max,
    },
    rooms: {
      label:
        filters.beds || filters.baths
          ? [filters.beds && filters.beds + '+ bd', filters.baths && filters.baths + '+ ba']
              .filter(Boolean)
              .join(' · ')
          : 'Beds & baths',
      active: filters.beds > 0 || filters.baths > 0,
    },
    more: (() => {
      const n =
        filters.amenities.length + (filters.sqftMin !== null || filters.sqftMax !== null ? 1 : 0);
      return { label: n ? 'More · ' + n : 'More', active: n > 0 };
    })(),
  };

  const panels: Panel[] = ['location', 'type', 'price', ...(residential ? (['rooms'] as Panel[]) : []), 'more'];

  /** Turns off just the open panel's filter. */
  const clearPanel = (panel: Panel) => {
    const reset: Record<Panel, Partial<Filters>> = {
      location: { region: '' },
      type: { sector: 'residential', propertyTypes: [] },
      price: { priceMin: bounds.min, priceMax: bounds.max },
      rooms: { beds: 0, baths: 0 },
      more: { sqftMin: null, sqftMax: null, amenities: [] },
    };
    patch(reset[panel]);
  };

  const panelId = (p: Panel) => uid + '-panel-' + p;
  const resultsLabel = resultCount + ' ' + (resultCount === 1 ? 'property' : 'properties');

  const footer = (panel: Panel) => (
    <div className="flex items-center gap-3 border-t border-bone-edge px-5 py-3.5">
      <button
        type="button"
        onClick={() => clearPanel(panel)}
        disabled={!summary[panel].active}
        className="min-h-11 rounded-sm px-2 text-[0.85rem] text-ink-mute underline decoration-ink/20 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink disabled:pointer-events-none disabled:opacity-40 desk:min-h-9"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => close()}
        className="tnum ml-auto min-h-11 rounded-sm bg-ink px-5 text-[0.85rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:scale-[0.98] desk:min-h-9"
      >
        {desk ? 'Done' : 'Show ' + resultsLabel}
      </button>
    </div>
  );

  return (
    <>
      <div
        ref={barRef}
        // The bar is its own stacking context, so a dropdown inside it can
        // only clear the cards' save buttons (z-20) if the bar itself rises
        // while a panel is open.
        className={
          'sticky top-[4.5rem] border-y border-bone-edge bg-bone/95 backdrop-blur-md ' +
          (open && desk ? 'z-overlay' : 'z-sticky')
        }
      >
        <div className="mx-auto flex max-w-[82rem] items-center gap-3 py-2.5 sm:px-8 sm:py-3">
          {/* Phones scroll the whole row sideways; from sm it wraps instead,
              so the dropdowns are never clipped by a scroll container. */}
          <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-4 sm:flex-wrap sm:overflow-visible sm:px-0">
            {/* Buy / Rent are separate routes, so this is navigation. */}
            <div className="relative flex shrink-0 rounded-full border border-bone-edge bg-bone-deep/60 p-0.5">
              {([
                { mode: 'Sale' as const, href: '/buy', label: 'Buy' },
                { mode: 'Rent' as const, href: '/rent', label: 'Rent' },
              ]).map((tab) => {
                const active = mode === tab.mode;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex min-h-11 items-center rounded-full px-4 text-[0.85rem] transition-colors duration-200 ease-out desk:min-h-8 desk:text-[0.8rem]"
                  >
                    {active && (
                      <motion.span
                        layoutId="mode-pill-b"
                        aria-hidden
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-full bg-gold"
                      />
                    )}
                    <span className={'relative ' + (active ? 'text-ink' : 'text-ink-mute hover:text-ink')}>
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <span aria-hidden className="mx-1 hidden h-6 w-px shrink-0 bg-bone-edge sm:block" />

            {panels.map((p) => {
              const s = summary[p];
              const isOpen = open === p;
              return (
                <div key={p} className="relative shrink-0">
                  <button
                    ref={(el) => {
                      triggers.current[p] = el;
                    }}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? panelId(p) : undefined}
                    onClick={() => setOpen(isOpen ? null : p)}
                    className={
                      'flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[0.85rem] transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] desk:min-h-9 desk:text-[0.8rem] ' +
                      (s.active
                        ? 'border-ink bg-ink text-bone hover:bg-ink-soft'
                        : isOpen
                          ? 'border-ink bg-bone text-ink'
                          : 'border-bone-edge bg-bone text-ink-soft hover:border-ink/30 hover:text-ink')
                    }
                  >
                    <span className="tnum">{s.label}</span>
                    <svg
                      aria-hidden
                      width="10"
                      height="6"
                      viewBox="0 0 11 7"
                      fill="none"
                      className={
                        'shrink-0 transition-transform duration-200 ease-out ' +
                        (isOpen ? 'rotate-180' : '') +
                        (s.active ? ' text-gold' : ' text-ink-faint')
                      }
                    >
                      <path d="M1 1.2 5.5 5.6 10 1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Desk: the panel drops from its own pill. */}
                  <AnimatePresence>
                    {desk && isOpen && (
                      <motion.div
                        key={p}
                        id={panelId(p)}
                        role="dialog"
                        aria-label={PANEL_TITLE[p]}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={
                          'absolute top-[calc(100%+0.6rem)] z-overlay flex max-h-[min(32rem,calc(100vh-11rem))] flex-col rounded-md border border-bone-edge bg-bone shadow-float ' +
                          (p === 'more' ? 'right-0 w-[24rem] origin-top-right' : 'left-0 origin-top-left ') +
                          (p === 'price' ? 'w-[22rem]' : p === 'location' ? 'w-[17rem]' : p !== 'more' ? 'w-[20rem]' : '')
                        }
                      >
                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                          <PanelBody panel={p} filters={filters} patch={patch} listings={listings} showSort={false} />
                        </div>
                        {footer(p)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {count > 0 && (
              <button
                type="button"
                onClick={() => setFilters(defaultFilters(mode))}
                className="min-h-11 shrink-0 whitespace-nowrap px-2 text-[0.82rem] text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink desk:min-h-9 desk:text-[0.78rem]"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Count and sort sit at the right from sm; on phones sort lives in
              the More sheet and the count on its button. */}
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <p className="tnum hidden text-[0.8rem] text-ink-mute lg:block" aria-live="polite">
              {resultsLabel}
            </p>
            <label htmlFor="sort" className="sr-only">
              Sort listings
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
              className="min-h-11 rounded-full border border-bone-edge bg-bone px-4 text-[16px] text-ink-soft transition-colors duration-200 ease-out hover:border-ink/30 desk:min-h-9 desk:text-[0.8rem]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Phone: the open filter as a bottom sheet, portalled out of the
          sticky bar (its backdrop blur would otherwise trap a fixed child). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {!desk && open && (
              <>
                <motion.div
                  key="scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => close(false)}
                  className="fixed inset-0 z-overlay bg-ink/45"
                />
                <motion.div
                  ref={sheetRef}
                  key="sheet"
                  id={panelId(open)}
                  role="dialog"
                  aria-modal="true"
                  aria-label={PANEL_TITLE[open]}
                  initial={reduce ? { opacity: 0 } : { y: '100%' }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                  transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 340, damping: 36 }}
                  className="fixed inset-x-0 bottom-0 z-modal flex max-h-[86dvh] flex-col rounded-t-xl border-t border-bone-edge bg-bone pb-[env(safe-area-inset-bottom)] shadow-float"
                >
                  <div className="flex items-center justify-between border-b border-bone-edge px-5 py-3">
                    <h2 className="font-display text-[1.15rem] tracking-display text-ink">{PANEL_TITLE[open]}</h2>
                    <button
                      type="button"
                      onClick={() => close()}
                      aria-label="Close"
                      className="flex h-11 w-11 items-center justify-center rounded-sm text-ink-mute transition-colors duration-200 ease-out hover:bg-bone-deep hover:text-ink"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                        <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </svg>
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <PanelBody panel={open} filters={filters} patch={patch} listings={listings} showSort={open === 'more'} />
                  </div>
                  {footer(open)}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
