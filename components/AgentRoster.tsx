'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Agent } from '@/types/agent';
import { allTerritories } from '@/lib/agents';
import AgentCard from './AgentCard';

/**
 * The roster, filtered by territory.
 *
 * Territory is the filter that matters: a seller in San Fernando wants the
 * agent who works San Fernando, not the one with the nicest headshot.
 */
export default function AgentRoster({ agents }: { agents: Agent[] }) {
  const [territory, setTerritory] = useState('');
  const territories = useMemo(() => allTerritories(agents), [agents]);

  const shown = useMemo(
    () =>
      territory ? agents.filter((a) => a.territories.includes(territory)) : agents,
    [agents, territory],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
          Area
        </span>
        {[{ value: '', label: 'Everyone' }, ...territories.map((t) => ({ value: t, label: t }))].map(
          (option) => {
            const active = option.value === territory;
            return (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => setTerritory(option.value)}
                aria-pressed={active}
                className={
                  'min-h-11 rounded-sm border px-3.5 text-[0.82rem] transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px desk:min-h-0 sm:px-3 sm:py-1.5 sm:text-[0.78rem] ' +
                  (active
                    ? 'border-gold-deep bg-gold-wash text-ink'
                    : 'border-bone-edge bg-bone text-ink-mute hover:border-ink/25 hover:text-ink')
                }
              >
                {option.label}
              </button>
            );
          },
        )}
      </div>

      <p className="tnum mt-4 text-[0.82rem] text-ink-faint" role="status">
        {shown.length} {shown.length === 1 ? 'agent' : 'agents'}
        {territory ? ' covering ' + territory : ' on the team'}
      </p>

      <motion.div
        layout
        className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} priority={i < 4} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
