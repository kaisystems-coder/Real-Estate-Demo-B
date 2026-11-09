'use client';

import { useState } from 'react';
import type { Agent } from '@/types/agent';

type Status = 'idle' | 'sending' | 'sent';

/**
 * Enquiry form on an agent's page. Front-end only for the demo: it validates,
 * shows its sending and success states, then resets.
 *
 * TODO: point at Web3Forms (or the agency's CRM) by posting the form body to
 * the endpoint and surfacing a failed response as an error state.
 */
export default function AgentEnquiry({ agent }: { agent: Agent }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const first = agent.name.split(' ')[0];

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('agent-name') ?? '').trim();
    const email = String(data.get('agent-email') ?? '').trim();

    const next: Record<string, string> = {};
    if (!name) next['agent-name'] = 'Enter your name so ' + first + ' knows who called.';
    if (!email) next['agent-email'] = 'Enter an email address we can reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next['agent-email'] = 'That email address is missing an @ or a domain.';

    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }

    setStatus('sending');
    await new Promise((r) => setTimeout(r, 700));
    setStatus('sent');
    form.reset();
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-[1.25rem] tracking-display text-ink">
          Get in touch with {first}
        </h2>
        <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-mute">
          Replies within one working day, usually the same afternoon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="agent-name"
          label="Your name"
          error={errors['agent-name']}
          autoComplete="name"
          required
        />
        <Field
          id="agent-email"
          label="Email"
          type="email"
          error={errors['agent-email']}
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="agent-message" className="text-[0.78rem] text-ink-soft">
          Message
        </label>
        <textarea
          id="agent-message"
          name="agent-message"
          rows={3}
          defaultValue={
            'Hello ' + first + ', I would like to talk about a property.'
          }
          className="resize-y rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] leading-relaxed text-ink transition-colors duration-200 ease-out hover:border-ink/25 focus:border-gold sm:py-2.5 desk:text-[0.88rem]"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 self-start rounded-sm bg-ink px-5 py-3 text-[0.88rem] text-bone transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-ink-soft active:translate-y-px disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'sent' && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-sm bg-sage-wash px-3 py-2.5 text-[0.84rem] text-sage-deep"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
            <path
              d="M3 8l3.2 3.2L12 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Message sent. {first} will be in touch.
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  type = 'text',
  error,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.78rem] text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? id + '-error' : undefined}
        className={
          'rounded-sm border bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out focus:border-gold sm:py-2.5 desk:text-[0.88rem] ' +
          (error ? 'border-[#9B3D2E]' : 'border-bone-edge hover:border-ink/25')
        }
      />
      {error && (
        <p id={id + '-error'} role="alert" className="text-[0.76rem] text-[#9B3D2E]">
          {error}
        </p>
      )}
    </div>
  );
}
