'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { monthlyPayment, stampDuty } from '@/lib/finance';
import { formatTTD } from '@/lib/format';
import { SliderField } from './finance/MoneyField';
import { useReveal, revealUp } from '@/lib/use-reveal';

/**
 * The calculator, on the landing page, already working.
 *
 * One slider and two live figures. A panel that only described the calculator
 * would be an advertisement for a click; this answers a real question before
 * the visitor commits to anything, which is the reason they carry on to
 * /mortgages rather than leaving.
 */
export default function CalculatorTeaser() {
  const [price, setPrice] = useState(1650000);
  const reveal = useReveal();

  // The assumptions are stated on screen rather than hidden, because the
  // figures are only meaningful alongside them.
  const RATE = 6.5;
  const YEARS = 25;
  const DEPOSIT = 0.1;

  const payment = monthlyPayment(price * (1 - DEPOSIT), RATE, YEARS);
  const duty = stampDuty(price, 'dwelling', false).total;

  return (
    <section className="mt-16 border-y border-bone-edge bg-ink sm:mt-20">
      <motion.div
        {...reveal}
        variants={revealUp}
        className="on-ink mx-auto grid max-w-[82rem] gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1fr_1fr] lg:gap-16"
      >
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">
            Before you call anyone
          </p>
          <h2 className="mt-3.5 font-display text-[1.9rem] leading-tight tracking-display text-bone sm:text-[2.3rem]">
            Find out what it really costs
          </h2>
          <p className="mt-4 max-w-[34rem] text-[0.98rem] leading-[1.7] text-bone/65">
            Most buyers budget for the deposit and get caught by the stamp duty.
            Move the slider to see the monthly instalment and the duty on a
            purchase at that price, then open the full calculators for legal
            fees, valuation and the first-time buyer exemption.
          </p>

          <Link
            href="/mortgages"
            className="mt-7 inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-[0.88rem] text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-bone active:translate-y-px desk:min-h-0 sm:py-3"
          >
            Open the calculators
          </Link>
        </div>

        <div className="rounded-sm border border-bone/15 bg-bone/[0.06] p-5 backdrop-blur-sm sm:p-6">
          {/* The slider inherits the dark ground, so its labels are overridden
              here rather than in the shared component. */}
          <div className="teaser-slider">
            <SliderField
              label="Purchase price"
              value={price}
              onChange={setPrice}
              min={500000}
              max={6000000}
              step={50000}
              format={(v) => formatTTD(v)}
            />
          </div>

          <dl className="mt-7 grid gap-5 xs:grid-cols-2">
            <div className="border-t border-bone/15 pt-4">
              <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-bone/45">
                Monthly instalment
              </dt>
              <dd className="tnum mt-1.5 font-display text-[1.6rem] leading-none tracking-display text-gold sm:text-[1.8rem]">
                {formatTTD(payment)}
              </dd>
              <p className="mt-2 text-[0.74rem] leading-relaxed text-bone/40">
                {RATE}% over {YEARS} years, {DEPOSIT * 100}% down
              </p>
            </div>
            <div className="border-t border-bone/15 pt-4">
              <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-bone/45">
                Stamp duty
              </dt>
              <dd className="tnum mt-1.5 font-display text-[1.6rem] leading-none tracking-display text-bone sm:text-[1.8rem]">
                {formatTTD(duty)}
              </dd>
              <p className="mt-2 text-[0.74rem] leading-relaxed text-bone/40">
                {duty === 0
                  ? 'Below the $850,000 threshold'
                  : 'House and land, not a first-time buyer'}
              </p>
            </div>
          </dl>

          <p className="mt-6 border-t border-bone/15 pt-4 text-[0.76rem] leading-relaxed text-bone/40">
            Estimates for planning, not an offer of finance.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
