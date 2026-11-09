import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[40rem] px-5 pb-24 pt-40 text-center sm:px-8">
      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold-deep">
        Page not found
      </p>
      <h1 className="mt-4 font-display text-[2.2rem] leading-tight tracking-display text-ink">
        That address isn&rsquo;t on the books
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-mute">
        The page may have moved, or the listing has been taken off the market.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block rounded-sm bg-ink px-5 py-3 text-[0.88rem] text-bone transition-transform duration-200 ease-out active:translate-y-px"
      >
        Back to listings
      </Link>
    </div>
  );
}
