'use client';

import { useState } from 'react';
import { REGIONS } from '@/lib/filters';
import { PROPERTY_TYPES } from '@/types/listing';

type Status = 'idle' | 'sending' | 'sent';

/** What the owner wants to do with it. Drives which fields matter downstream. */
const INTENTS = ['Sell it', 'Rent it out', 'Not sure yet — just want the value'];

/** How soon. The single most useful qualifier an agent can get up front. */
const TIMEFRAMES = [
  'As soon as possible',
  'Within 3 months',
  'Within 6 months',
  'Just researching',
];

/**
 * The seller and landlord intake — the form that turns a curious owner into an
 * instruction.
 *
 * This is the counterpart to /admin. The listing manager is where stock is
 * entered; this is where stock comes from, and it is the thing an agency
 * running its business off Instagram cannot do: capture a qualified seller
 * lead with an address, a price expectation and a timeframe attached, routed
 * to the office rather than lost in a DM.
 *
 * Front-end only for the demo: it validates, shows its sending and success
 * states, then resets.
 *
 * TODO: point at Web3Forms by POSTing the form body to
 * https://api.web3forms.com/submit with the agency's access key, and surface a
 * failed response as an error state beside the submit button.
 */
export default function ValuationForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const address = String(data.get('address') ?? '').trim();

    const next: Record<string, string> = {};
    if (!name) next.name = 'Enter your name so we know whose property this is.';
    if (!email) next.email = 'Enter an email address we can send the valuation to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'That email address is missing an @ or a domain.';
    // An agent cannot value a property they cannot find, and cannot call back
    // without a number. Both are required here even though the office contact
    // form treats phone as optional.
    if (!phone) next.phone = 'Enter a number an agent can reach you on.';
    if (!address) next.address = 'Enter the street and town so we can locate the property.';

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

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-sm border border-bone-edge bg-bone p-7 shadow-raise sm:p-9"
      >
        <span
          aria-hidden
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage-wash text-sage-deep"
        >
          <svg width="19" height="19" viewBox="0 0 15 15" aria-hidden>
            <path
              d="M3 8l3.2 3.2L12 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>

        <h3 className="mt-5 font-display text-[1.5rem] tracking-display text-ink">
          Request received
        </h3>
        <p className="mt-2.5 max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink-mute">
          An agent will call within one working day to arrange a visit. The
          written valuation follows within three working days of that visit,
          and it is free whether or not you list with us.
        </p>

        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 inline-flex min-h-11 items-center rounded-sm border border-bone-edge px-4 text-[0.85rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/25 hover:bg-bone-deep active:translate-y-px"
        >
          Send another property
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="min-w-0 rounded-sm border border-bone-edge bg-bone p-5 shadow-raise xs:p-6 sm:p-8"
    >
      <h2 className="font-display text-[1.5rem] tracking-display text-ink sm:text-[1.7rem]">
        Request a free valuation
      </h2>
      <p className="mt-2 max-w-[34rem] text-[0.9rem] leading-[1.7] text-ink-mute">
        Tell us where it is and what it is. No obligation, no charge, and no
        commitment to list with us.
      </p>

      {/* The property itself. Set apart from the owner's details because it is
          what the agent actually researches before the call. */}
      <fieldset className="mt-7 min-w-0 border-0 p-0">
        <legend className="text-[0.68rem] uppercase tracking-[0.16em] text-gold-deep">
          The property
        </legend>

        <div className="mt-4 flex flex-col gap-4">
          <Field
            id="address"
            label="Street address"
            error={errors.address}
            autoComplete="street-address"
            placeholder="e.g. 14 Ellerslie Park, Maraval"
            required
          />

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Select id="region" label="Region" options={[...REGIONS]} />
            <Select id="propertyType" label="Property type" options={[...PROPERTY_TYPES]} />
          </div>

          <div className="grid min-w-0 gap-4 xs:grid-cols-3">
            <Field id="beds" label="Bedrooms" type="text" inputMode="numeric" hint="Optional" />
            <Field id="baths" label="Bathrooms" type="text" inputMode="numeric" hint="Optional" />
            <Field id="sqft" label="Floor area" type="text" inputMode="numeric" hint="sq ft" />
          </div>
        </div>
      </fieldset>

      {/* Intent and timeframe: the qualifiers that decide who picks this up. */}
      <fieldset className="mt-8 min-w-0 border-0 p-0">
        <legend className="text-[0.68rem] uppercase tracking-[0.16em] text-gold-deep">
          What you want to do
        </legend>

        <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
          <Select id="intent" label="I want to" options={INTENTS} />
          <Select id="timeframe" label="Timeframe" options={TIMEFRAMES} />
        </div>

        <div className="mt-4">
          <Field
            id="expectation"
            label="Price you have in mind"
            type="text"
            inputMode="numeric"
            hint="Optional — TTD"
            placeholder="e.g. 2,400,000"
          />
        </div>
      </fieldset>

      {/* The owner. Last, because the property is the interesting part and
          asking for contact details first reads as a lead-capture gate. */}
      <fieldset className="mt-8 min-w-0 border-0 p-0">
        <legend className="text-[0.68rem] uppercase tracking-[0.16em] text-gold-deep">
          How we reach you
        </legend>

        <div className="mt-4 flex flex-col gap-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field
              id="name"
              label="Your name"
              error={errors.name}
              autoComplete="name"
              required
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              error={errors.phone}
              autoComplete="tel"
              placeholder="868 000 0000"
              required
            />
          </div>

          <Field
            id="email"
            label="Email"
            type="email"
            error={errors.email}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-[0.78rem] text-ink-soft">
              Anything else{' '}
              <span className="text-[0.72rem] text-ink-faint">Optional</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Recent works, tenancy in place, access arrangements — whatever an agent should know before visiting."
              className="resize-y rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] leading-relaxed text-ink transition-colors duration-200 ease-out placeholder:text-ink-faint hover:border-ink/25 focus:border-gold sm:py-2.5 desk:text-[0.9rem]"
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-ink px-6 text-[0.92rem] text-bone transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-ink-soft active:translate-y-px disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Sending…' : 'Request my valuation'}
      </button>

      <p className="mt-3.5 text-[0.78rem] leading-relaxed text-ink-faint">
        We use these details to value your property and nothing else. No
        third-party marketing.
      </p>
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
  placeholder,
  inputMode,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'text' | 'tel';
  required?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? id + '-error' : undefined}
        className={
          'rounded-sm border bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out placeholder:text-ink-faint focus:border-gold sm:py-2.5 desk:text-[0.88rem] ' +
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

function Select({
  id,
  label,
  options,
}: {
  id: string;
  label: string;
  options: string[];
}) {
  // min-w-0 on both the cell and the control: a <select> is sized by its
  // longest option, so without it a long option name ("Not sure yet — just
  // want the value") pushes the whole form wider than its grid cell and clips
  // the right edge on a 320px phone.
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.78rem] text-ink-soft">
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={options[0]}
        className="w-full min-w-0 rounded-sm border border-bone-edge bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out hover:border-ink/25 focus:border-gold sm:py-[0.7rem] desk:text-[0.88rem]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
