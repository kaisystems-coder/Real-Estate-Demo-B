/** A single ribbon destination. */
type NavLink = { href: string; label: string };

/**
 * A ribbon destination that branches into its own children — rendered as a
 * hover/click dropdown on desktop and an inline accordion in the mobile
 * drawer, rather than as three separate tabs.
 */
type NavGroup = { label: string; children: readonly NavLink[] };

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

/**
 * The primary navigation, in ribbon order.
 *
 * Lives in its own module rather than in SiteHeader so the footer can import
 * it without pulling a client component into a server-rendered tree.
 *
 * Buy / Rent / Land are the three things a visitor arrives wanting, so they
 * lead — grouped under one "Properties" tab rather than three of their own,
 * which is what kept the ribbon crowded. Land stays a distinct child rather
 * than a filter inside Buy because it is bought on different terms — no floor
 * area, no bedrooms, its own stamp duty schedule, and often a different
 * agent — that grouping is unchanged, only its entry point moved.
 */
export const NAV: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  {
    label: 'Properties',
    children: [
      { href: '/buy', label: 'Buy' },
      { href: '/rent', label: 'Rent' },
      { href: '/land', label: 'Land' },
    ],
  },
  // The seller's entry point. A site that only serves buyers helps an agent
  // move the stock they already hold; this is the one that wins them new
  // instructions, which is the side of the business the listings come from.
  { href: '/sell', label: 'Sell' },
  { href: '/our-agents', label: 'Our Agents' },
  { href: '/mortgages', label: 'Mortgages' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  // The listing manager, back in the ribbon on 2026-09-13 by explicit
  // instruction: the demo is being sent to prospects to click through on their
  // own, with nobody there to point them at a footer link. The admin system is
  // a large part of what is being sold, so it has to be visible.
  //
  // Still deliberately unauthenticated — there is no backend to authenticate
  // against, and a prospect must not be handed a password. It is world-
  // writable as it stands: gate it before any deploy to a public domain.
  { href: '/admin', label: 'Admin' },
] as const;

/** Flat list of every link in NAV, groups expanded — for the footer. */
export const NAV_LINKS: readonly NavLink[] = NAV.flatMap((item) =>
  isNavGroup(item) ? item.children : [item],
);

/**
 * Links that belong to the visitor rather than to the agency. Kept out of NAV
 * and rendered in the footer baseline.
 *
 * /saved is the visitor's own shortlist; it already has an icon and a live
 * count in the header, so a ribbon tab would be a third route to the same
 * place.
 */
export const UTILITY_NAV = [{ href: '/saved', label: 'Saved' }] as const;

/** True when `href` is the current route or an ancestor of it. */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
