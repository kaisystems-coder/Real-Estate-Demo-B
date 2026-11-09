'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Agent } from '@/types/agent';
import { BLUR_DATA_URL } from '@/lib/format';

/**
 * An agent on the roster.
 *
 * The portrait is a tall crop rather than a circle: a circular avatar reads as
 * a profile picture, and these are meant to read as the staff photographs on
 * an agency's wall. The ledger under the name carries territory and service,
 * matching the spec row on a property card.
 */
export default function AgentCard({
  agent,
  priority = false,
}: {
  agent: Agent;
  priority?: boolean;
}) {
  const years = new Date().getFullYear() - agent.joined;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
    >
      <Link href={'/our-agents/' + agent.slug} className="flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-bone-deep">
          <Image
            src={agent.image}
            alt={agent.name + ', ' + agent.role}
            fill
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover [object-position:50%_18%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply"
          />
          <div className="absolute inset-x-3 bottom-3">
            <p className="font-display text-[1.12rem] leading-tight tracking-display text-bone drop-shadow-[0_1px_6px_rgba(18,19,15,0.55)]">
              {agent.name}
            </p>
            <p className="mt-0.5 text-[0.72rem] text-bone/80 drop-shadow-[0_1px_4px_rgba(18,19,15,0.55)]">
              {agent.role}
            </p>
          </div>
        </div>
      </Link>

      <dl className="ledger mt-3.5">
        <div className="flex-1 py-2.5">
          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">
            Covers
          </dt>
          <dd className="mt-0.5 text-[0.82rem] leading-snug text-ink-soft">
            {agent.territories[0].replace(' Trinidad', '')}
            {agent.territories.length > 1 && (
              <span className="text-ink-faint"> +{agent.territories.length - 1}</span>
            )}
          </dd>
        </div>
        <div className="flex-1 py-2.5 pl-3">
          <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">
            With us
          </dt>
          <dd className="tnum mt-0.5 text-[0.82rem] text-ink-soft">
            {years} {years === 1 ? 'year' : 'years'}
          </dd>
        </div>
      </dl>
    </motion.article>
  );
}
