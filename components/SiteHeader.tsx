'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Logo, { BRAND } from './Logo';
import { isActiveRoute, isNavGroup, NAV } from '@/lib/nav';
import { useSavedCount } from '@/lib/saved';

/**
 * The ribbon. Six destinations is past what fits beside a wordmark on a phone,
 * so the row collapses into a drawer below lg rather than shrinking type or
 * dropping items.
 */

export default function SiteHeader() {
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The desktop dropdown: which group's label is open, by label. A ref
  // mirrors it so the close-on-leave timer reads current state without
  // becoming a dependency that retriggers the effect on every open/close.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  // Which ribbon item the pointer is currently over, by its key (href or
  // group label). The underline follows this when set, and falls back to
  // whichever item matches the route when it is not — so it slides to meet
  // the cursor on hover and slides back to the active tab on leave, rather
  // than only ever marking the current page.
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();
  const savedCount = useSavedCount();

  const openGroupNow = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };
  // A short delay before closing, not an instant blur-close — moving the
  // pointer from the "Properties" tab down into the panel crosses a gap, and
  // an instant close there reads as the menu fighting the cursor.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 160);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // The header sits transparent over a hero and gains a ground once the page
  // scrolls. Passive listener, no layout reads.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any route change closes the drawer and any open dropdown/accordion —
  // otherwise they stay open over the new page after a tap.
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
    setExpandedGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Escape closes the desktop dropdown too, independent of the drawer.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenGroup(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openGroup]);

  /**
   * Only routes that open on a dark hero get the transparent treatment. On a
   * bone page the header must carry its ground from the first pixel, or the
   * ink wordmark sits on nothing.
   */
  // Variant B: the home page opens on a daylight hero, so only /about keeps
  // the transparent header.
  const darkHeadedRoute = pathname === '/about';
  const onHero = darkHeadedRoute && !lifted && !menuOpen;

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-sticky border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ' +
        (onHero
          ? 'border-transparent bg-transparent'
          : 'border-bone-edge bg-bone/90 backdrop-blur-md')
      }
    >
      {/* Tighter gutter and gap below xs. At 320px the wordmark and the action
          cluster together exceeded the row, and both are shrink-0, so the menu
          button was pushed past the right edge. */}
      <div className="mx-auto flex h-[4.5rem] max-w-[82rem] items-center justify-between gap-2 px-3 xs:gap-4 xs:px-4 sm:px-8">
        <Link
          href="/"
          aria-label={
            BRAND.name +
            ' ' +
            BRAND.suffix +
            (BRAND.demoTag ? ', ' + BRAND.demoTag : '') +
            ', home'
          }
          className="flex min-h-11 shrink-0 items-center"
        >
          <Logo tone={onHero ? 'bone' : 'ink'} />
        </Link>

        {/* Desktop ribbon */}
        <nav aria-label="Primary" className="hidden items-center lg:flex">
          {NAV.map((item) => {
            if (isNavGroup(item)) {
              const active = item.children.some((c) => isActiveRoute(pathname, c.href));
              const isOpen = openGroup === item.label;
              // The underline shows for whichever item is hovered; with
              // nothing hovered it falls back to the active tab.
              const showUnderline = hoveredKey ? hoveredKey === item.label : active;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    openGroupNow(item.label);
                    setHoveredKey(item.label);
                  }}
                  onMouseLeave={() => {
                    scheduleClose();
                    setHoveredKey((k) => (k === item.label ? null : k));
                  }}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setOpenGroup(isOpen ? null : item.label)}
                    className={
                      'relative flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[0.82rem] tracking-wide transition-colors duration-300 ease-out lg:px-3 xl:px-4 ' +
                      (onHero
                        ? active || isOpen
                          ? 'text-bone'
                          : 'text-bone/70 hover:text-bone'
                        : active || isOpen
                          ? 'text-ink'
                          : 'text-ink-mute hover:text-ink')
                    }
                  >
                    {item.label}
                    <svg
                      width="9"
                      height="6"
                      viewBox="0 0 9 6"
                      aria-hidden
                      className={
                        'shrink-0 transition-transform duration-300 ease-out ' +
                        (isOpen ? '-rotate-180' : '')
                      }
                    >
                      <path
                        d="M1 1l3.5 3.5L8 1"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                    {showUnderline && (
                      <motion.span
                        layoutId="nav-underline"
                        aria-hidden
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 36 }
                        }
                        className="absolute inset-x-2.5 -bottom-px h-px bg-gold lg:inset-x-3 xl:inset-x-4"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 top-full z-modal w-44 -translate-x-1/2 pt-2"
                      >
                        <ul className="overflow-hidden rounded-sm border border-bone-edge bg-bone py-1.5 shadow-lift">
                          {item.children.map((child) => {
                            const childActive = isActiveRoute(pathname, child.href);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  aria-current={childActive ? 'page' : undefined}
                                  className={
                                    'flex min-h-10 items-center px-4 text-[0.86rem] transition-colors duration-200 ease-out ' +
                                    (childActive
                                      ? 'text-gold-deep'
                                      : 'text-ink-mute hover:bg-bone-deep hover:text-ink')
                                  }
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const active = isActiveRoute(pathname, item.href);
            const showUnderline = hoveredKey ? hoveredKey === item.href : active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHoveredKey(item.href)}
                onMouseLeave={() => setHoveredKey((k) => (k === item.href ? null : k))}
                className={
                  'relative whitespace-nowrap px-2.5 py-2 text-[0.82rem] tracking-wide transition-colors duration-300 ease-out lg:px-3 xl:px-4 ' +
                  (onHero
                    ? active
                      ? 'text-bone'
                      : 'text-bone/70 hover:text-bone'
                    : active
                      ? 'text-ink'
                      : 'text-ink-mute hover:text-ink')
                }
              >
                {item.label}
                {showUnderline && (
                  <motion.span
                    layoutId="nav-underline"
                    aria-hidden
                    transition={
                      reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                    }
                    className="absolute inset-x-2.5 -bottom-px h-px bg-gold lg:inset-x-3 xl:inset-x-4"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* The shortlist. Lives beside the CTA rather than in NAV: it is the
              visitor's own state, not a destination the agency is offering,
              and the ribbon is already full at nine tabs. */}
          <Link
            href="/saved"
            aria-label={
              savedCount === 0
                ? 'Your shortlist, empty'
                : 'Your shortlist, ' + savedCount + (savedCount === 1 ? ' property' : ' properties')
            }
            className={
              'relative inline-flex h-11 min-h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-sm border transition-[background-color,border-color,color] duration-300 ease-out ' +
              (onHero
                ? 'border-bone/25 text-bone hover:border-gold hover:text-gold'
                : 'border-ink/12 text-ink-mute hover:border-ink/30 hover:text-ink')
            }
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 3.6h12a1 1 0 0 1 1 1v15.9l-7-4.4-7 4.4V4.6a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
            {savedCount > 0 && (
              <span className="tnum absolute -right-1.5 -top-1.5 inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-medium text-ink">
                {savedCount}
              </span>
            )}
          </Link>

          <a
            href={'tel:' + BRAND.phone.replace(/[^+\d]/g, '')}
            className={
              'hidden rounded-sm border px-4 py-2 text-[0.8rem] tracking-wide transition-[background-color,border-color,color,transform] duration-300 ease-out active:translate-y-px xl:inline-block ' +
              (onHero
                ? 'border-bone/30 text-bone hover:border-gold hover:bg-gold hover:text-ink'
                : 'border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-bone')
            }
          >
            {BRAND.phone}
          </a>

          {/* Drawer trigger, below lg only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className={
              'flex h-11 w-11 items-center justify-center rounded-sm border transition-colors duration-300 ease-out lg:hidden ' +
              (onHero
                ? 'border-bone/25 text-bone'
                : 'border-ink/15 text-ink hover:bg-bone-deep')
            }
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              {menuOpen ? (
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path
                  d="M2 5h14M2 9h14M2 13h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="nav-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 top-[4.5rem] z-overlay bg-ink/40 backdrop-blur-[2px] lg:hidden"
            />
            <motion.nav
              key="nav-drawer"
              id="mobile-nav"
              aria-label="Primary"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full z-modal border-b border-bone-edge bg-bone shadow-lift lg:hidden"
            >
              <ul className="mx-auto max-w-[82rem] px-4 py-3 sm:px-8">
                {NAV.map((item) => {
                  if (isNavGroup(item)) {
                    const active = item.children.some((c) => isActiveRoute(pathname, c.href));
                    const isExpanded = expandedGroup === item.label;
                    return (
                      <li key={item.label} className="border-b border-bone-edge last:border-0">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls="mobile-nav-properties"
                          onClick={() => setExpandedGroup(isExpanded ? null : item.label)}
                          className={
                            'flex min-h-[3.25rem] w-full items-center justify-between text-[0.98rem] transition-colors duration-200 ease-out ' +
                            (active ? 'text-ink' : 'text-ink-mute hover:text-ink')
                          }
                        >
                          <span className="flex items-center gap-2">
                            {item.label}
                            {active && (
                              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                            )}
                          </span>
                          <svg
                            width="11"
                            height="7"
                            viewBox="0 0 11 7"
                            aria-hidden
                            className={
                              'shrink-0 transition-transform duration-300 ease-out ' +
                              (isExpanded ? '-rotate-180' : '')
                            }
                          >
                            <path
                              d="M1 1l4.5 4.5L10 1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.ul
                              id="mobile-nav-properties"
                              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              {item.children.map((child) => {
                                const childActive = isActiveRoute(pathname, child.href);
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      aria-current={childActive ? 'page' : undefined}
                                      className={
                                        'flex min-h-11 items-center pl-4 text-[0.92rem] transition-colors duration-200 ease-out ' +
                                        (childActive
                                          ? 'text-gold-deep'
                                          : 'text-ink-faint hover:text-ink')
                                      }
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  const active = isActiveRoute(pathname, item.href);
                  return (
                    <li key={item.href} className="border-b border-bone-edge last:border-0">
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={
                          'flex min-h-[3.25rem] items-center justify-between text-[0.98rem] transition-colors duration-200 ease-out ' +
                          (active ? 'text-ink' : 'text-ink-mute hover:text-ink')
                        }
                      >
                        {item.label}
                        {active && (
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-gold"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mx-auto max-w-[82rem] px-4 pb-4 sm:px-8">
                <a
                  href={'tel:' + BRAND.phone.replace(/[^+\d]/g, '')}
                  className="flex min-h-11 items-center justify-center rounded-sm bg-ink px-4 text-[0.88rem] text-bone transition-transform duration-200 ease-out active:translate-y-px"
                >
                  Call {BRAND.phone}
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
