'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Scroll-reveal state for a section that must never depend on the animation
 * to become visible. `armed` is only true once the component has mounted,
 * is not already in view, and the visitor has not asked for reduced motion —
 * so a failed chunk, a fast scroll past the trigger, or `once` latching
 * before the ref attaches all fall back to the fully visible resting state
 * instead of stranding content at opacity 0.
 *
 * Usage: initial={armed ? 'hidden' : false} whileInView="show" variants={...}
 */
export function useReveal() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const armed = mounted && !reduce;

  return {
    initial: armed ? 'hidden' : false,
    whileInView: 'show',
    viewport: { once: true, amount: 0.2, margin: '0px 0px -80px 0px' } as const,
  };
}

export const revealUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function staggerChildren(stagger = 0.08) {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: 0.04 },
    },
  };
}
