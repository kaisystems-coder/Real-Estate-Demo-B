'use client';

import { useId } from 'react';

/**
 * Inputs for the calculators.
 *
 * Money fields are text, not number: `type="number"` on a field people type
 * "1,200,000" into rejects the separators silently and leaves the field empty,
 * and its spinner arrows are useless at this scale. The value is held as a
 * number by the parent and formatted with separators on the way in.
 */
export function MoneyField({
  label,
  value,
  onChange,
  hint,
  prefix = '$',
  max = 100000000,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  prefix?: string;
  max?: number;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2">
        <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
          {label}
        </span>
        {hint && <span className="text-[0.72rem] text-ink-faint">{hint}</span>}
      </label>
      <div className="flex items-center rounded-sm border border-bone-edge bg-bone transition-colors duration-200 ease-out focus-within:border-gold hover:border-ink/25">
        <span aria-hidden className="pl-3 text-[0.9rem] text-ink-faint">
          {prefix}
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value > 0 ? value.toLocaleString('en-TT') : ''}
          placeholder="0"
          onChange={(e) => {
            // Keep digits only, so pasted "$1,200,000" and typed separators
            // both resolve to a number instead of clearing the field.
            const digits = e.target.value.replace(/[^\d]/g, '');
            const next = digits === '' ? 0 : Number(digits);
            onChange(Math.min(next, max));
          }}
          className="tnum w-full bg-transparent px-2 py-3 text-[16px] text-ink outline-none placeholder:text-ink-faint sm:py-2.5 desk:text-[0.95rem]"
        />
      </div>
    </div>
  );
}

/**
 * A slider paired with its own readout. Used for rate, term and deposit, where
 * dragging communicates the range better than typing and the exact figure
 * still has to be visible.
 */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min || 1)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2">
        <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
          {label}
        </span>
        <span className="tnum text-[0.92rem] text-ink">{format(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-rail"
        // The painted portion of the rail follows the thumb.
        style={{ '--fill': pct + '%' } as React.CSSProperties}
      />
    </div>
  );
}

/** A segmented choice — property kind, buyer status. */
export function ChoiceField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
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
        })}
      </div>
    </fieldset>
  );
}

/** A labelled on/off, for the first-time buyer relief. */
export function ToggleField({
  label,
  note,
  checked,
  onChange,
}: {
  label: string;
  note?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();

  return (
    <div className="flex items-start gap-3 rounded-sm border border-bone-edge bg-bone-deep/40 px-3.5 py-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-gold-deep"
      />
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[0.88rem] text-ink-soft">{label}</span>
        {note && <span className="mt-0.5 block text-[0.76rem] text-ink-faint">{note}</span>}
      </label>
    </div>
  );
}
