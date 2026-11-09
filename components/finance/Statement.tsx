'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatTTD } from '@/lib/format';

/**
 * The signature for both calculators: results set as a printed settlement
 * statement rather than as result cards.
 *
 * Hairline rules, a right-aligned money column in tabular figures, and a ruled
 * total — the shape of the document an attorney actually hands a buyer at
 * closing. It is the spec ledger's logic applied to money.
 */

export function StatementRow({
  label,
  note,
  amount,
  /** Renders the figure in the muted tone, for informational rows. */
  quiet = false,
}: {
  label: string;
  note?: string;
  amount: number;
  quiet?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-bone-edge py-3 last:border-b-0">
      <div className="min-w-0">
        <p className={'text-[0.9rem] ' + (quiet ? 'text-ink-mute' : 'text-ink-soft')}>
          {label}
        </p>
        {note && <p className="mt-0.5 text-[0.76rem] text-ink-faint">{note}</p>}
      </div>
      <p
        className={
          'tnum shrink-0 text-[0.95rem] tabular-nums ' +
          (quiet ? 'text-ink-mute' : 'text-ink')
        }
      >
        {formatTTD(amount)}
      </p>
    </div>
  );
}

/**
 * The ruled total. Double rule above, the way a printed statement closes a
 * column — the one place in the app where a border is doubled.
 */
export function StatementTotal({
  label,
  amount,
  caption,
}: {
  label: string;
  amount: number;
  caption?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-1 border-t-[3px] border-double border-ink/25 pt-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[1.05rem] tracking-display text-ink">{label}</p>
        {/* The figure is the answer, so it is the only thing on the page set
            at display size in gold. Keyed so it re-runs when the number
            changes, but the resting state is always the final value. */}
        <motion.p
          key={Math.round(amount)}
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="tnum shrink-0 font-display text-[1.5rem] leading-none tracking-display text-gold-deep sm:text-[1.7rem]"
        >
          {formatTTD(amount)}
        </motion.p>
      </div>
      {caption && <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-faint sm:text-[0.78rem]">{caption}</p>}
    </div>
  );
}

/** The paper the statement is printed on. */
export function StatementSheet({
  title,
  reference,
  children,
}: {
  title: string;
  /** Small right-hand label, e.g. the property kind the figures assume. */
  reference?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-bone-edge bg-bone p-5 shadow-raise sm:p-6">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
        <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-mute">
          {title}
        </h3>
        {reference && (
          <p className="shrink-0 text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
            {reference}
          </p>
        )}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * The estimate disclaimer. Present on every result the calculators render —
 * these are indicative figures, and a settlement statement that looks
 * authoritative has to say plainly that it is not.
 */
export function EstimateNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 flex gap-2.5 rounded-sm bg-sage-wash/60 px-3.5 py-3 text-[0.84rem] leading-relaxed text-sage-deep sm:text-[0.78rem]">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden
        className="mt-0.5 shrink-0"
      >
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path
          d="M7 6.2v4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="7" cy="4" r="0.8" fill="currentColor" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
