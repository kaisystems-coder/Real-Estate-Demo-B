import Link from 'next/link';

/**
 * A section's opening line, with an optional link to the page that holds the
 * rest. The rule under it is shared with PageHeader so the two read as the
 * same system at different scales.
 */
export default function SectionHeading({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-bone-edge pb-5">
      <div className="max-w-[36rem]">
        <h2 className="font-display text-[1.7rem] tracking-display text-ink sm:text-[2rem]">
          {title}
        </h2>
        {intro && (
          <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-mute">{intro}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-[0.85rem] text-gold-deep transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
        >
          {action.label}
          <span
            aria-hidden
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          >
            <svg width="16" height="12" viewBox="0 0 16 12">
              <path
                d="M1 6h13M9.5 1l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
        </Link>
      )}
    </div>
  );
}
