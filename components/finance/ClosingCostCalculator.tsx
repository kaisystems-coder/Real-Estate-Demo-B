'use client';

import { useMemo, useState } from 'react';
import {
  closingCosts,
  FIRST_TIME_BUYER_CAP,
  type PropertyKind,
} from '@/lib/finance';
import { formatTTD } from '@/lib/format';
import { ChoiceField, MoneyField, SliderField, ToggleField } from './MoneyField';
import {
  EstimateNote,
  StatementRow,
  StatementSheet,
  StatementTotal,
} from './Statement';

const KINDS: { value: PropertyKind; label: string }[] = [
  { value: 'dwelling', label: 'House & land' },
  { value: 'land', label: 'Land only' },
  { value: 'commercial', label: 'Commercial' },
];

/**
 * Closing cost calculator.
 *
 * The figure buyers in Trinidad and Tobago most often get wrong is stamp duty,
 * because the bands are marginal — the 7.5% rate applies only to the slice
 * above $1.75M, not to the whole price. The statement therefore itemises each
 * band that was charged rather than printing one duty figure.
 */
export default function ClosingCostCalculator({
  initialPrice = 1650000,
}: {
  initialPrice?: number;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [kind, setKind] = useState<PropertyKind>('dwelling');
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(false);
  const [legalFeePercent, setLegalFeePercent] = useState(2);
  const [valuationFee, setValuationFee] = useState(2500);
  const [financed, setFinanced] = useState(true);
  const [depositPercent, setDepositPercent] = useState(10);

  const mortgageAmount = financed ? Math.max(0, price - price * (depositPercent / 100)) : 0;

  const result = useMemo(
    () =>
      closingCosts({
        price,
        kind,
        firstTimeBuyer,
        legalFeePercent,
        valuationFee,
        mortgageAmount,
      }),
    [price, kind, firstTimeBuyer, legalFeePercent, valuationFee, mortgageAmount],
  );

  // Relief only exists for a dwelling; offering the toggle on land or
  // commercial would imply a relief that does not apply there.
  const reliefAvailable = kind === 'dwelling';

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Closing cost calculator inputs"
      >
        <MoneyField label="Purchase price" value={price} onChange={setPrice} hint="TTD" />

        <ChoiceField
          label="What is being bought"
          value={kind}
          onChange={(next) => {
            setKind(next);
            // Relief does not survive a switch away from a dwelling.
            if (next !== 'dwelling') setFirstTimeBuyer(false);
          }}
          options={KINDS}
        />

        {reliefAvailable && (
          <ToggleField
            label="First-time buyer"
            note={
              'No stamp duty on a house and land up to ' +
              formatTTD(FIRST_TIME_BUYER_CAP) +
              '. Above that, the ordinary bands apply to the whole price.'
            }
            checked={firstTimeBuyer}
            onChange={setFirstTimeBuyer}
          />
        )}

        <SliderField
          label="Legal and conveyancing"
          value={legalFeePercent}
          onChange={setLegalFeePercent}
          min={0.5}
          max={4}
          step={0.1}
          format={(v) => v.toFixed(1) + '%  ·  ' + formatTTD(price * (v / 100))}
        />

        <MoneyField
          label="Valuation report"
          value={valuationFee}
          onChange={setValuationFee}
          hint="Flat fee"
          max={50000}
        />

        <ToggleField
          label="Buying with a mortgage"
          note="Adds stamp duty on the mortgage deed, charged above $450,000."
          checked={financed}
          onChange={setFinanced}
        />

        {financed && (
          <SliderField
            label="Deposit"
            value={depositPercent}
            onChange={setDepositPercent}
            min={0}
            max={50}
            step={1}
            format={(v) => v + '%  ·  borrowing ' + formatTTD(price - price * (v / 100))}
          />
        )}
      </form>

      <div>
        <StatementSheet
          title="Estimated closing costs"
          reference={KINDS.find((k) => k.value === kind)?.label}
        >
          {result.lines.map((line) => (
            <StatementRow
              key={line.label}
              label={line.label}
              note={line.note}
              amount={line.amount}
            />
          ))}

          <StatementTotal
            label="Cash needed at closing"
            amount={result.total}
            caption={
              price > 0
                ? 'About ' +
                  result.percentOfPrice.toFixed(1) +
                  '% of the purchase price, on top of the deposit.'
                : 'Enter a purchase price to see an estimate.'
            }
          />

          <EstimateNote>
            Stamp duty is assessed on the value the Board of Inland Revenue
            accepts, which can differ from the asking price. Legal and valuation
            figures are typical market rates, not quotations.
          </EstimateNote>
        </StatementSheet>

        {/* The band breakdown is the teaching moment: duty is marginal, and
            seeing the slices is what corrects the usual misreading. */}
        {result.duty.rows.length > 0 && (
          <div className="mt-5 rounded-sm border border-bone-edge bg-bone-deep/50 p-5">
            <h4 className="font-display text-[1.05rem] tracking-display text-ink">
              How the duty was worked out
            </h4>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-mute">
              Each rate applies only to the slice of the price inside its band,
              the way income tax brackets work. The top rate is never charged on
              the whole purchase price.
            </p>

            <dl className="mt-4">
              {result.duty.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-bone-edge py-2.5 last:border-b-0"
                >
                  <dt className="min-w-0 text-[0.84rem] text-ink-soft">
                    {row.label}
                    <span className="mt-0.5 block text-[0.74rem] text-ink-faint">
                      on {formatTTD(row.amount)}
                    </span>
                  </dt>
                  <dd className="tnum shrink-0 text-[0.9rem] text-ink">
                    {formatTTD(row.duty)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {result.duty.relieved && (
          <div className="mt-5 rounded-sm border border-gold/40 bg-gold-wash/50 p-5">
            <h4 className="font-display text-[1.05rem] tracking-display text-ink">
              Stamp duty relieved in full
            </h4>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">
              A first-time buyer pays no stamp duty on a residential house and
              land up to {formatTTD(FIRST_TIME_BUYER_CAP)}. On this purchase that
              saves the {formatTTD(closingCosts({
                price,
                kind,
                firstTimeBuyer: false,
                legalFeePercent,
                valuationFee,
                mortgageAmount,
              }).duty.total)}{' '}
              that would otherwise be charged. The relief is claimed once, and
              the Board of Inland Revenue will ask for a declaration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
