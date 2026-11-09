'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent';

const SUBJECTS = [
  'Buying a property',
  'Renting a property',
  'Selling or letting mine',
  'A valuation',
  'Something else',
];

/**
 * The office contact form. Front-end only for the demo: it validates, shows
 * its sending and success states, then resets.
 *
 * TODO: point at Web3Forms by POSTing the form body to
 * https://api.web3forms.com/submit with the agency's access key, and surface a
 * failed response as an error state beside the submit button.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const next: Record<string, string> = {};
    if (!name) next.name = 'Enter your name so we know who is writing.';
    if (!email) next.email = 'Enter an email address we can reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'That email address is missing an @ or a domain.';
    if (!message) next.message = 'Tell us what you are looking for.';

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
        <h2 className="font-display text-[1.35rem] tracking-display text-ink">
          Send the office a message
        </h2>
        <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-mute">
          We reply within one working day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          id="email"
          label="Email"
          type="email"
          error={errors.email}
          autoComplete="email"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone" type="tel" autoComplete="tel" hint="Optional" />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-[0.78rem] text-ink-soft">
            What about
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue={SUBJECTS[0]}
            className="rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out hover:border-ink/25 focus:border-gold sm:py-[0.7rem] desk:text-[0.88rem]"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-[0.78rem] text-ink-soft">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
          placeholder="Area, budget, number of bedrooms — whatever you already know."
          className={
            'resize-y rounded-sm border bg-bone px-3 py-3 text-[16px] leading-relaxed text-ink transition-colors duration-200 ease-out placeholder:text-ink-faint focus:border-gold sm:py-2.5 desk:text-[0.9rem] ' +
            (errors.message ? 'border-[#9B3D2E]' : 'border-bone-edge hover:border-ink/25')
          }
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-[0.76rem] text-[#9B3D2E]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 self-start rounded-sm bg-ink px-6 py-3 text-[0.9rem] text-bone transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-ink-soft active:translate-y-px disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'sent' && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-sm bg-sage-wash px-3.5 py-3 text-[0.86rem] text-sage-deep"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden className="shrink-0">
            <path
              d="M3 8l3.2 3.2L12 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Message sent. An agent will be in touch within one working day.
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
  hint,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-[0.78rem] text-ink-soft"
      >
        {label}
        {hint && <span className="text-[0.72rem] text-ink-faint">{hint}</span>}
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
