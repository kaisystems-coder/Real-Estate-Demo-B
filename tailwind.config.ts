import type { Config } from 'tailwindcss';

/**
 * Brand tokens live here and ONLY here.
 * To reskin for a different agency: change these six values plus the
 * wordmark in components/Logo.tsx. Nothing else references raw hex.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // Small phones (320-400px) need a stacked layout where a 400px+
        // phone has room for a row.
        xs: '400px',
      },
      colors: {
        ink: {
          DEFAULT: '#12130F', // near-black charcoal — primary text + dark ground
          soft: '#2A2C25',
          mute: '#5A5D52',
          faint: '#7C8073',
        },
        bone: {
          DEFAULT: '#FAF8F4', // warm off-white — page ground
          deep: '#F2EEE6', // elevated surface
          edge: '#E7E2D8', // stone — hairlines, dividers
        },
        gold: {
          DEFAULT: '#B8934D', // muted gold accent
          deep: '#8E6F36', // AA-safe on bone for text
          wash: '#EFE6D2',
        },
        sage: {
          DEFAULT: '#8C9284',
          deep: '#5F6559',
          wash: '#E6E9E1',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.03em',
      },
      boxShadow: {
        // Layered, ink-tinted. No flat shadow-md anywhere.
        raise: '0 1px 2px rgba(18,19,15,0.04), 0 8px 24px -12px rgba(18,19,15,0.10)',
        lift: '0 2px 4px rgba(18,19,15,0.05), 0 18px 44px -20px rgba(18,19,15,0.18)',
        float: '0 4px 8px rgba(18,19,15,0.06), 0 32px 64px -28px rgba(18,19,15,0.28)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        sticky: '20',
        overlay: '40',
        modal: '50',
        toast: '60',
      },
    },
  },
  plugins: [
    /**
     * `touch:` — a coarse-pointer variant.
     *
     * Touch sizing keyed only to width breaks on a landscape phone: at 844px
     * wide the `sm:` rules fire and fingers get 24px targets. This variant asks
     * the device what it actually is, so a control can hold 44px on every
     * touchscreen and still tighten up for a mouse.
     */
    function pointerVariants({ addVariant }: { addVariant: (n: string, v: string) => void }) {
      addVariant('touch', '@media (pointer: coarse)');
      // `desk:` — the mouse-only counterpart to `sm:`. Use it wherever a rule
      // shrinks a hit target, so the tightening follows the pointer rather
      // than the viewport and a landscape phone keeps its 44px.
      addVariant('desk', '@media (min-width: 640px) and (pointer: fine)');
    },
  ],
};

export default config;
