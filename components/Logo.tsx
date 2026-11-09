/**
 * The wordmark. Reskinning for a prospect is this file plus the six colour
 * tokens in tailwind.config.ts — nothing else carries the agency's name.
 */
export const BRAND = {
  name: 'Prestige',
  suffix: 'Properties',
  /**
   * Appended to the suffix in the wordmark only — never in aria-labels,
   * metadata or the reskinnable brand fields above. This is a demo sent to
   * prospects to show what their own site could look like, not a live
   * agency, so the mark says so everywhere it appears rather than relying on
   * the footer's one "Demonstration site" line to carry that alone. Drop
   * this field (and its use in Logo below) when reskinning for a real,
   * paying client.
   */
  demoTag: 'Demo',
  /** Shown under the mark in the footer and on the contact form. */
  tagline: 'Licensed real estate, Trinidad & Tobago',
  phone: '+1 (868) 622-4180',
  /**
   * Digits only, country code first, no +. This is the wa.me path segment.
   * In Trinidad WhatsApp is the business line, not a secondary channel, so it
   * is a first-class brand field rather than a formatting of `phone`.
   */
  whatsapp: '18686224180',
  email: 'listings@prestigeproperties.tt',
  address: '14 Fitt Street, Woodbrook, Port of Spain',
};

export default function Logo({ tone = 'ink' }: { tone?: 'ink' | 'bone' }) {
  const primary = tone === 'bone' ? 'text-bone' : 'text-ink';
  const mark = tone === 'bone' ? 'text-gold' : 'text-gold-deep';

  return (
    <span className="inline-flex items-baseline gap-[0.3rem]">
      <span
        aria-hidden
        className={mark + ' font-display text-[1.35rem] leading-none'}
      >
        {/* A surveyor's corner mark — the notation on a T&T land plan. */}
        &#8968;
      </span>
      <span className={primary + ' font-display text-[1.05rem] font-medium tracking-display'}>
        {BRAND.name}
        <span
          className={
            // Tighter below xs: at 320px "PROPERTIES · DEMO" at 0.7rem/0.18em
            // made the wordmark 213px wide, which together with the action
            // cluster pushed the menu button off the right edge.
            'pl-[0.32rem] font-sans text-[0.58rem] font-normal uppercase tracking-[0.1em] xs:text-[0.7rem] xs:tracking-[0.18em] sm:text-[0.62rem] sm:tracking-[0.22em] ' +
            (tone === 'bone' ? 'text-bone/60' : 'text-ink-mute')
          }
        >
          {BRAND.suffix}
          {BRAND.demoTag && (
            <>
              {/* A lighter weight than the suffix itself, so the eye still
                  reads "Properties" first and "Demo" as an attached note
                  rather than a fourth word competing with the brand. */}
              <span className={tone === 'bone' ? 'text-bone/35' : 'text-ink-faint'}> · </span>
              <span className={tone === 'bone' ? 'text-gold/80' : 'text-gold-deep/85'}>
                {BRAND.demoTag}
              </span>
            </>
          )}
        </span>
      </span>
    </span>
  );
}
