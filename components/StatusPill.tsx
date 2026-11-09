import type { ListingStatus } from '@/types/listing';

/**
 * Status reads as form as well as text — a filled dot, a hollow dot and a
 * struck dot — so an agent scanning the admin table sees state at a glance
 * without relying on colour alone.
 */
const TONE: Record<ListingStatus, { chip: string; dot: string }> = {
  // Opaque, not translucent: over a bright photograph a 92%-alpha bone chip
  // loses its edge and the label reads as clipped.
  Active: { chip: 'bg-bone text-ink', dot: 'bg-sage-deep' },
  Pending: { chip: 'bg-bone text-ink', dot: 'bg-gold ring-1 ring-gold-deep' },
  Sold: { chip: 'bg-ink text-bone', dot: 'bg-bone/45' },
};

export default function StatusPill({
  status,
  className = '',
}: {
  status: ListingStatus;
  className?: string;
}) {
  const tone = TONE[status];
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[0.68rem] uppercase tracking-[0.16em] sm:text-[0.6rem] ' +
        tone.chip +
        ' ' +
        className
      }
    >
      <span aria-hidden className={'h-1.5 w-1.5 rounded-full ' + tone.dot} />
      {status}
    </span>
  );
}
