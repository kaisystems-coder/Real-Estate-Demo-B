'use client';

import { useMemo, useState } from 'react';
import { amortisation, monthlyPayment } from '@/lib/finance';
import { formatTTD } from '@/lib/format';
import { MoneyField, SliderField } from './MoneyField';
import {
  EstimateNote,
  StatementRow,
  StatementSheet,
  StatementTotal,
} from './Statement';

/**
 * Mortgage calculator.
 *
 * Everything recomputes synchronously on change — the whole model is one
 * annuity formula and a 25-iteration loop, far below a frame, so there is no
 * spinner and no debounce.
 */
export default function MortgageCalculator({
  /** Prefills the price, used when the calculator is opened from a listing. */
  initialPrice = 1650000,
}: {
  initialPrice?: number;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [depositPercent, setDepositPercent] = useState(10);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(25);

  const deposit = Math.round(price * (depositPercent / 100));
  const principal = Math.max(0, price - deposit);

  const payment = useMemo(
    () => monthlyPayment(principal, rate, years),
    [principal, rate, years],
  );

  const schedule = useMemo(
    () => amortisation(principal, rate, years),
    [principal, rate, years],
  );

  const totalPaid = payment * years * 12;
  const totalInterest = Math.max(0, totalPaid - principal);

  // The first year's split is the figure that actually surprises people: on a
  // 25-year loan almost the whole instalment is interest at the start.
  const firstYear = schedule[0];
  const interestShareYearOne = firstYear
    ? (firstYear.interestPaid / (firstYear.interestPaid + firstYear.principalPaid)) * 100
    : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Mortgage calculator inputs"
      >
        <MoneyField
          label="Purchase price"
          value={price}
          onChange={setPrice}
          hint="TTD"
        />

        <SliderField
          label="Deposit"
          value={depositPercent}
          onChange={setDepositPercent}
          min={0}
          max={50}
          step={1}
          format={(v) => v + '%  ·  ' + formatTTD(price * (v / 100))}
        />

        <SliderField
          label="Interest rate"
          value={rate}
          onChange={setRate}
          min={0}
          max={15}
          step={0.05}
          format={(v) => v.toFixed(2) + '%'}
        />

        <SliderField
          label="Term"
          value={years}
          onChange={setYears}
          min={5}
          max={35}
          step={1}
          format={(v) => v + ' years'}
        />

        <div className="rounded-sm border border-dashed border-bone-edge px-4 py-3.5">
          <p className="text-[0.8rem] leading-relaxed text-ink-mute">
            Most Trinidad and Tobago lenders want a deposit of at least 10% and
            will lend over 25 to 30 years. Rates through 2026 have sat between
            about 5% and 8% depending on the institution and whether the rate is
            fixed.
          </p>
        </div>
      </form>

      <div>
        <StatementSheet
          title="Repayment estimate"
          reference={years + '-year term'}
        >
          <StatementRow label="Purchase price" amount={price} quiet />
          <StatementRow
            label="Deposit"
            note={depositPercent + '% down'}
            amount={deposit}
            quiet
          />
          <StatementRow label="Amount borrowed" amount={principal} />
          <StatementRow
            label="Total interest over the term"
            note={'At ' + rate.toFixed(2) + '% across ' + years + ' years'}
            amount={totalInterest}
          />
          <StatementRow
            label="Total repaid"
            note="Principal plus interest"
            amount={totalPaid}
          />

          <StatementTotal
            label="Monthly instalment"
            amount={payment}
            caption={
              principal > 0
                ? 'Principal and interest only. Property tax, home insurance and any life cover the lender requires are charged on top.'
                : 'Enter a purchase price above the deposit to see an instalment.'
            }
          />

          <EstimateNote>
            An estimate for planning, not a mortgage offer. The rate, term and
            fees a lender actually approves depend on income, credit history and
            their own valuation of the property.
          </EstimateNote>
        </StatementSheet>

        {firstYear && principal > 0 && (
          <div className="mt-5 rounded-sm border border-bone-edge bg-bone-deep/50 p-5">
            <h4 className="font-display text-[1.05rem] tracking-display text-ink">
              Where the first year goes
            </h4>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-mute">
              Of the {formatTTD(firstYear.interestPaid + firstYear.principalPaid)}{' '}
              paid in year one, {Math.round(interestShareYearOne)}% is interest.
              The balance only starts falling quickly in the back half of the term.
            </p>

            {/* A proportion, drawn as the thing it is: one bar, two parts.
                Labelled in text as well as by colour. */}
            <div
              className="mt-4 flex h-2.5 overflow-hidden rounded-sm bg-bone-edge"
              role="img"
              aria-label={
                'Year one: ' +
                Math.round(interestShareYearOne) +
                ' percent interest, ' +
                Math.round(100 - interestShareYearOne) +
                ' percent principal'
              }
            >
              <div
                className="h-full bg-gold-deep"
                style={{ width: interestShareYearOne + '%' }}
              />
              <div
                className="h-full bg-sage"
                style={{ width: 100 - interestShareYearOne + '%' }}
              />
            </div>

            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.8rem]">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 rounded-sm bg-gold-deep" />
                <dt className="text-ink-mute">Interest</dt>
                <dd className="tnum text-ink-soft">
                  {formatTTD(firstYear.interestPaid)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 rounded-sm bg-sage" />
                <dt className="text-ink-mute">Principal</dt>
                <dd className="tnum text-ink-soft">
                  {formatTTD(firstYear.principalPaid)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
