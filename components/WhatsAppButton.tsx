'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from './Logo';

/**
 * The floating WhatsApp action, fixed bottom-right on every page.
 *
 * In Trinidad WhatsApp is the business line — an agent's number on a flyer is
 * assumed to be a WhatsApp number — so this is the primary contact affordance
 * on the site, not a social link. Instagram-based agencies already run their
 * whole enquiry flow through it, which is exactly the habit this demo has to
 * meet rather than replace.
 *
 * Behaviour notes:
 * - The label is revealed on hover/focus at sm and up, where there is room for
 *   it. On a phone it stays a 56px circle so it never covers listing content.
 * - It hides itself over the footer. The footer carries the same number as a
 *   plain link, and a floating button sitting on top of it reads as a bug.
 * - Green is WhatsApp's own #25D366 rather than a brand token. The channel's
 *   colour is the thing people recognise; recolouring it to gold would cost
 *   the instant read and gain nothing.
 */

/** Prefilled per route, so the agent knows what the enquiry is about. */
function messageFor(pathname: string): string {
  if (pathname.startsWith('/listings/'))
    return `Hello ${BRAND.name} ${BRAND.suffix}, I'd like more information on a listing I saw on your site.`;
  if (pathname.startsWith('/sell'))
    return `Hello ${BRAND.name} ${BRAND.suffix}, I'm thinking of selling or renting out my property and would like a valuation.`;
  if (pathname.startsWith('/rent'))
    return `Hello ${BRAND.name} ${BRAND.suffix}, I'm looking for a rental and would like some help.`;
  if (pathname.startsWith('/land'))
    return `Hello ${BRAND.name} ${BRAND.suffix}, I'm interested in a parcel of land listed on your site.`;
  if (pathname.startsWith('/mortgages'))
    return `Hello ${BRAND.name} ${BRAND.suffix}, I have a question about mortgage and closing costs.`;
  return `Hello ${BRAND.name} ${BRAND.suffix}, I'd like to speak to an agent.`;
}

export default function WhatsAppButton() {
  const pathname = usePathname() ?? '/';
  const [overFooter, setOverFooter] = useState(false);

  // Retract over the footer, which carries the same number as a text link.
  // IntersectionObserver rather than a scroll handler so this costs nothing
  // per frame.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      // Fire once the footer has risen into the bottom strip the button sits in.
      { rootMargin: '0px 0px -88px 0px' },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const href =
    'https://wa.me/' + BRAND.whatsapp + '?text=' + encodeURIComponent(messageFor(pathname));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-retracted={overFooter ? '' : undefined}
      aria-label={'Message ' + BRAND.name + ' ' + BRAND.suffix + ' on WhatsApp'}
      className={
        'group fixed bottom-5 right-5 z-sticky inline-flex items-center gap-0 overflow-hidden ' +
        'rounded-full bg-[#25D366] pl-[0.95rem] pr-[0.95rem] text-ink sm:bottom-6 sm:right-6 ' +
        // Ink-tinted layered shadow, matching the token scale rather than a
        // flat green glow.
        'shadow-[0_2px_4px_rgba(18,19,15,0.10),0_16px_36px_-16px_rgba(18,19,15,0.34)] ' +
        'min-h-14 min-w-14 justify-center ' +
        'transition-[transform,opacity,box-shadow,background-color] duration-300 ease-out ' +
        'hover:bg-[#1FBE5A] hover:shadow-[0_2px_6px_rgba(18,19,15,0.12),0_22px_48px_-18px_rgba(18,19,15,0.42)] ' +
        'active:translate-y-px ' +
        // Retracted state: slide out and fade rather than unmount, so the
        // transition can play and focus is never yanked mid-tab.
        'data-[retracted]:pointer-events-none data-[retracted]:translate-y-24 data-[retracted]:opacity-0'
      }
    >
      <svg
        aria-hidden
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29z" />
      </svg>

      {/*
        Grid-rows collapse rather than width/max-width: the label's own width
        is what animates, so the text never reflows mid-transition and the
        button grows from the icon outward.
      */}
      <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out motion-safe:group-hover:grid-cols-[1fr] motion-safe:group-focus-visible:grid-cols-[1fr]">
        <span className="overflow-hidden">
          <span className="block whitespace-nowrap pl-2.5 pr-1 text-[0.88rem] font-medium">
            WhatsApp us
          </span>
        </span>
      </span>
    </a>
  );
}
