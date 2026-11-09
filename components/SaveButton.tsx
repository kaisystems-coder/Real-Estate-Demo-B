'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSavedStore, useIsSaved } from '@/lib/saved';

/**
 * The save control, on every listing card and detail page.
 *
 * A filled gold mark rather than the usual red heart: red belongs to nobody's
 * brand here and reads as a "like" from a social app, which is exactly the
 * register this site is trying to move an agency away from. Gold is the
 * accent the rest of the catalogue already uses for the thing worth noticing.
 *
 * Sits above the card's own <Link> in the stacking order and stops the click
 * from reaching it, so saving never navigates.
 */
export default function SaveButton({
  id,
  title,
  /** `card` floats on photography; `inline` sits on a bone ground. */
  variant = 'card',
}: {
  id: string;
  title: string;
  variant?: 'card' | 'inline';
}) {
  const reduce = useReducedMotion();
  const toggle = useSavedStore((s) => s.toggle);
  const saved = useIsSaved(id);

  const onClick = (e: React.MouseEvent) => {
    // The card is a link; saving is not navigation.
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const label = (saved ? 'Remove ' : 'Save ') + title + (saved ? ' from' : ' to') + ' your shortlist';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved' : 'Save'}
      className={
        'inline-flex items-center justify-center rounded-full transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px ' +
        (variant === 'card'
          ? // 44px touch target on the photo, with a scrim behind it so the
            // mark stays legible over a bright midday shot.
            'h-11 w-11 border border-bone/25 bg-ink/35 backdrop-blur-[2px] hover:bg-ink/55 ' +
            (saved ? 'text-gold' : 'text-bone')
          : 'h-11 w-11 border ' +
            (saved
              ? 'border-gold-deep bg-gold-wash text-gold-deep'
              : 'border-bone-edge bg-bone text-ink-mute hover:border-ink/25 hover:text-ink'))
      }
    >
      <motion.span
        // A small press-in on save. Scale only, so nothing reflows, and the
        // resting state is always visible.
        key={saved ? 'on' : 'off'}
        initial={reduce ? false : { scale: 0.78 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          aria-hidden
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        >
          {/* A bookmark, not a heart: this is a shortlist, not a like. */}
          <path d="M6 3.6h12a1 1 0 0 1 1 1v15.9l-7-4.4-7 4.4V4.6a1 1 0 0 1 1-1z" />
        </svg>
      </motion.span>
    </button>
  );
}
