'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import MortgageCalculator from './MortgageCalculator';
import ClosingCostCalculator from './ClosingCostCalculator';

type Tab = 'mortgage' | 'closing';

const TABS: { value: Tab; label: string; blurb: string }[] = [
  {
    value: 'mortgage',
    label: 'Mortgage',
    blurb: 'What the monthly instalment comes to, and what the loan costs over its life.',
  },
  {
    value: 'closing',
    label: 'Closing costs',
    blurb: 'Stamp duty, legal fees and valuation — the cash needed on top of the deposit.',
  },
];

/**
 * Both calculators on one page, switched rather than stacked.
 *
 * They answer different questions at different moments — "can I carry this
 * monthly" and "what do I need in hand on the day" — so showing both at once
 * doubles the page length without helping either. Both panels stay mounted so
 * switching back does not discard what was typed.
 */
export default function CalculatorTabs() {
  const [tab, setTab] = useState<Tab>('mortgage');
  const reduce = useReducedMotion();
  const active = TABS.find((t) => t.value === tab);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Calculators"
        className="flex flex-wrap gap-1 border-b border-bone-edge"
      >
        {TABS.map((t) => {
          const selected = t.value === tab;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={'tab-' + t.value}
              aria-selected={selected}
              aria-controls={'panel-' + t.value}
              onClick={() => setTab(t.value)}
              className={
                'relative min-h-11 px-4 text-[0.92rem] transition-colors duration-200 ease-out sm:px-5 ' +
                (selected ? 'text-ink' : 'text-ink-mute hover:text-ink')
              }
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId="calc-tab"
                  aria-hidden
                  transition={
                    reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                  }
                  className="absolute inset-x-3 -bottom-px h-[2px] bg-gold-deep"
                />
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <p className="mt-4 max-w-[40rem] text-[0.9rem] leading-relaxed text-ink-mute">
          {active.blurb}
        </p>
      )}

      <div className="mt-8">
        {/* Both panels stay mounted; the inactive one is hidden rather than
            unmounted so switching tabs never clears the other calculator. */}
        <div
          role="tabpanel"
          id="panel-mortgage"
          aria-labelledby="tab-mortgage"
          hidden={tab !== 'mortgage'}
        >
          <MortgageCalculator />
        </div>
        <div
          role="tabpanel"
          id="panel-closing"
          aria-labelledby="tab-closing"
          hidden={tab !== 'closing'}
        >
          <ClosingCostCalculator />
        </div>
      </div>
    </div>
  );
}
