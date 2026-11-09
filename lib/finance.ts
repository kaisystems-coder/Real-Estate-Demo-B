/**
 * Mortgage and closing-cost maths for the calculators on /mortgages.
 *
 * All figures are TTD. The stamp duty bands below are the Trinidad & Tobago
 * residential rates in force since 1 October 2008, confirmed against the Board
 * of Inland Revenue's published schedule. They are reproduced here so the
 * calculator is credible in a pitch — but every result the UI renders carries
 * an estimate disclaimer, because the duty actually assessed depends on the
 * valuation the BIR accepts, not on the asking price.
 *
 * Source: ird.gov.tt, "New Stamp Duty Rates from October 1st, 2008".
 */

export type PropertyKind = 'dwelling' | 'land' | 'commercial';

interface Band {
  /** Duty applies to the portion of the price above this figure. */
  threshold: number;
  rate: number;
}

/**
 * Marginal bands, lowest first. Each band's rate applies only to the slice of
 * the price between its own threshold and the next band's threshold — the same
 * way income tax brackets work, which is the part buyers most often get wrong.
 */
const DUTY_BANDS: Record<PropertyKind, Band[]> = {
  // Residential with a dwelling house: first $850,000 exempt, then 3% / 5% / 7.5%.
  dwelling: [
    { threshold: 850000, rate: 0.03 },
    { threshold: 1250000, rate: 0.05 },
    { threshold: 1750000, rate: 0.075 },
  ],
  // Residential land with no dwelling: first $450,000 exempt, then 2% / 5% / 7%.
  land: [
    { threshold: 450000, rate: 0.02 },
    { threshold: 650000, rate: 0.05 },
    { threshold: 850000, rate: 0.07 },
  ],
  // Commercial and agricultural: no exemption, charged from the first dollar.
  commercial: [
    { threshold: 0, rate: 0.02 },
    { threshold: 300000, rate: 0.05 },
    { threshold: 400000, rate: 0.07 },
  ],
};

/**
 * First-time buyers pay no duty on a residential house and land up to
 * $2,000,000 (Finance Act 2020, in force 1 January 2021). For land only the
 * relief stops at the ordinary $450,000 exemption.
 */
export const FIRST_TIME_BUYER_CAP = 2000000;

export interface DutyBreakdown {
  total: number;
  /** One row per band that actually attracted duty, for the statement. */
  rows: { label: string; amount: number; duty: number }[];
  /** True when first-time-buyer relief wiped out the charge entirely. */
  relieved: boolean;
}

export function stampDuty(
  price: number,
  kind: PropertyKind = 'dwelling',
  firstTimeBuyer = false,
): DutyBreakdown {
  if (!Number.isFinite(price) || price <= 0) {
    return { total: 0, rows: [], relieved: false };
  }

  if (firstTimeBuyer && kind === 'dwelling' && price <= FIRST_TIME_BUYER_CAP) {
    return { total: 0, rows: [], relieved: true };
  }

  const bands = DUTY_BANDS[kind];
  const rows: DutyBreakdown['rows'] = [];
  let total = 0;

  bands.forEach((band, i) => {
    const ceiling = bands[i + 1]?.threshold ?? Infinity;
    // The slice of the price that falls inside this band.
    const slice = Math.max(0, Math.min(price, ceiling) - band.threshold);
    if (slice <= 0) return;
    const duty = slice * band.rate;
    total += duty;
    rows.push({
      label:
        Math.round(band.rate * 1000) / 10 +
        '% on ' +
        (ceiling === Infinity
          ? 'the balance above ' + short(band.threshold)
          : short(band.threshold) + ' to ' + short(ceiling)),
      amount: slice,
      duty,
    });
  });

  return { total, rows, relieved: false };
}

/** "$1.25M" / "$850k" — compact figures for band labels, not for money columns. */
function short(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000;
    return '$' + (Number.isInteger(m) ? m : String(m)) + 'M';
  }
  return '$' + value / 1000 + 'k';
}

/**
 * Level-payment mortgage instalment.
 *
 * Guards the zero-rate case explicitly: the standard annuity formula divides
 * by the rate, so a 0% mortgage would return NaN and render as "$NaN" rather
 * than the principal split evenly across the term.
 */
export function monthlyPayment(
  principal: number,
  annualRatePercent: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (!Number.isFinite(principal) || principal <= 0 || n <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / n;
  const growth = Math.pow(1 + r, n);
  return (principal * r * growth) / (growth - 1);
}

export interface AmortisationYear {
  year: number;
  interestPaid: number;
  principalPaid: number;
  balance: number;
}

/**
 * Year-by-year amortisation. Walked month by month rather than solved in
 * closed form, so the final balance lands exactly on zero and rounding never
 * leaves a few dollars outstanding in the last row.
 */
export function amortisation(
  principal: number,
  annualRatePercent: number,
  years: number,
): AmortisationYear[] {
  const payment = monthlyPayment(principal, annualRatePercent, years);
  if (payment <= 0) return [];

  const r = annualRatePercent / 100 / 12;
  const out: AmortisationYear[] = [];
  let balance = principal;

  for (let y = 1; y <= Math.round(years); y += 1) {
    let interestPaid = 0;
    let principalPaid = 0;
    for (let m = 0; m < 12 && balance > 0; m += 1) {
      const interest = balance * r;
      // The last instalment is whatever clears the balance, not a full payment.
      const principalPart = Math.min(payment - interest, balance);
      interestPaid += interest;
      principalPaid += principalPart;
      balance -= principalPart;
    }
    out.push({
      year: y,
      interestPaid,
      principalPaid,
      balance: Math.max(0, balance),
    });
    if (balance <= 0) break;
  }

  return out;
}

export interface ClosingCostInput {
  price: number;
  kind: PropertyKind;
  firstTimeBuyer: boolean;
  /** Percent of price. Conveyancing is quoted as a percentage here. */
  legalFeePercent: number;
  /** Flat TTD figure — valuators quote a fee, not a percentage. */
  valuationFee: number;
  /** Mortgage amount, used for the mortgage deed duty. 0 for a cash purchase. */
  mortgageAmount: number;
}

export interface ClosingCostLine {
  label: string;
  amount: number;
  /** Shown under the label on the statement. */
  note?: string;
}

export interface ClosingCostResult {
  lines: ClosingCostLine[];
  total: number;
  /** Total as a percentage of the purchase price. */
  percentOfPrice: number;
  duty: DutyBreakdown;
}

/**
 * Mortgage deed stamp duty. Residential mortgages are exempt to $450,000 and
 * charged at 50c per $250 above it — which works out to 0.2% of the excess.
 */
function mortgageDeedDuty(mortgageAmount: number): number {
  const exempt = 450000;
  if (mortgageAmount <= exempt) return 0;
  return (mortgageAmount - exempt) * 0.002;
}

export function closingCosts(input: ClosingCostInput): ClosingCostResult {
  const { price, kind, firstTimeBuyer, legalFeePercent, valuationFee, mortgageAmount } =
    input;

  const duty = stampDuty(price, kind, firstTimeBuyer);
  const legal = Math.max(0, price * (legalFeePercent / 100));
  const deed = mortgageDeedDuty(Math.max(0, mortgageAmount));

  const lines: ClosingCostLine[] = [
    {
      label: 'Stamp duty on transfer',
      amount: duty.total,
      note: duty.relieved
        ? 'Relieved in full under first-time buyer exemption'
        : duty.total === 0
          ? 'Below the exemption threshold'
          : undefined,
    },
    {
      label: 'Legal and conveyancing',
      amount: legal,
      note: legalFeePercent + '% of purchase price',
    },
    { label: 'Valuation report', amount: Math.max(0, valuationFee) },
  ];

  if (mortgageAmount > 0) {
    lines.push({
      label: 'Stamp duty on mortgage deed',
      amount: deed,
      note: deed === 0 ? 'Mortgage below the $450k threshold' : '0.2% above $450k',
    });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  return {
    lines,
    total,
    percentOfPrice: price > 0 ? (total / price) * 100 : 0,
    duty,
  };
}
