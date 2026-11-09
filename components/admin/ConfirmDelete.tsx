'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Listing } from '@/types/listing';

export default function ConfirmDelete({
  listing,
  onCancel,
  onConfirm,
}: {
  listing: Listing | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const reduce = useReducedMotion();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus lands on Cancel, not Delete — the safe option takes the Enter key.
  useEffect(() => {
    if (!listing) return;
    const focus = setTimeout(() => cancelRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(focus);
      window.removeEventListener('keydown', onKey);
    };
  }, [listing, onCancel]);

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="fixed inset-0 z-overlay bg-ink/50 backdrop-blur-[2px]"
          />
          <motion.div
            key="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-heading"
            aria-describedby="delete-body"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-modal w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-bone-edge bg-bone p-6 shadow-float"
          >
            <h2
              id="delete-heading"
              className="font-display text-[1.2rem] tracking-display text-ink"
            >
              Delete this listing?
            </h2>
            <p id="delete-body" className="mt-2 text-[0.88rem] leading-relaxed text-ink-mute">
              <span className="text-ink-soft">{listing.title}</span> in{' '}
              {listing.location} comes off the site straight away. This cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="rounded-sm border border-bone-edge px-4 py-2.5 text-[0.85rem] text-ink-soft transition-colors duration-200 ease-out hover:border-ink/25 hover:text-ink"
              >
                Keep listing
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-sm bg-[#9B3D2E] px-4 py-2.5 text-[0.85rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-[#823226] active:translate-y-px"
              >
                Delete listing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
