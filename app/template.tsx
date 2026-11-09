'use client';

import { motion } from 'framer-motion';

/**
 * Route transitions. A short fade with a few pixels of lift — enough to stop
 * the white flash between routes without making navigation feel slow.
 *
 * initial is an offset from a visible resting state, never a visibility gate:
 * if the animation never runs, the page is still fully readable.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
