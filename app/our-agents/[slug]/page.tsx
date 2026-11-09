import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgentBySlug, getAgents } from '@/lib/agents';
import { BLUR_DATA_URL } from '@/lib/format';
import AgentEnquiry from '@/components/AgentEnquiry';
import {
  abs,
  agentSchema,
  breadcrumbSchema,
  jsonLd,
  ogImage,
  shareImage,
  SITE_NAME,
} from '@/lib/seo';

export function generateStaticParams() {
  return getAgents().map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) return { title: 'Agent not found' };
  const path = '/our-agents/' + agent.slug;
  const description =
    agent.role +
    ' at ' +
    SITE_NAME +
    ', covering ' +
    agent.territories.join(' and ') +
    '. ' +
    agent.bio.slice(0, 130);

  return {
    title: agent.name,
    description,
    alternates: { canonical: abs(path) },
    openGraph: {
      type: 'profile',
      title: agent.name + ' · ' + agent.role,
      description,
      url: abs(path),
      siteName: SITE_NAME,
      locale: 'en_TT',
      // Cropped on the face so the wide card does not cut the head off.
      images: [ogImage(shareImage(agent.image, { faces: true }), agent.name)],
    },
    twitter: {
      card: 'summary_large_image',
      title: agent.name + ' · ' + agent.role,
      description,
      images: [shareImage(agent.image, { faces: true })],
    },
  };
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  // The roster is static, so an unknown slug is a genuine 404 rather than a
  // listing that might have been added in the admin.
  if (!agent) notFound();

  const years = new Date().getFullYear() - agent.joined;
  const colleagues = getAgents()
    .filter((a) => a.id !== agent.id)
    .filter((a) => a.territories.some((t) => agent.territories.includes(t)))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(agentSchema(agent))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Our Agents', path: '/our-agents' },
            { name: agent.name, path: '/our-agents/' + agent.slug },
          ]),
        )}
      />
    <article className="mx-auto max-w-[82rem] px-5 pb-20 pt-[7.5rem] sm:px-8 sm:pt-[8.5rem]">
      <Link
        href="/our-agents"
        className="inline-flex min-h-11 items-center gap-2 text-[0.82rem] text-ink-mute transition-colors duration-200 ease-out hover:text-ink desk:min-h-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M8.5 3L4.5 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        All agents
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-14">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-bone-deep shadow-lift">
            <Image
              src={agent.image}
              alt={agent.name + ', ' + agent.role}
              fill
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(max-width: 1024px) 100vw, 20rem"
              className="object-cover [object-position:50%_18%]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gold/10 mix-blend-multiply"
            />
          </div>

          <dl className="ledger mt-4">
            <div className="flex-1 py-3">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">
                With us
              </dt>
              <dd className="tnum mt-0.5 text-[0.92rem] text-ink-soft">
                {years} {years === 1 ? 'year' : 'years'}
              </dd>
            </div>
            <div className="flex-1 py-3 pl-3">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint sm:text-[0.6rem]">
                Languages
              </dt>
              <dd className="mt-0.5 text-[0.92rem] text-ink-soft">
                {agent.languages.join(', ')}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={'tel:' + agent.phone.replace(/[^+\d]/g, '')}
              className="flex min-h-11 items-center justify-center rounded-sm bg-ink px-4 text-[0.88rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
            >
              {agent.phone}
            </a>
            <a
              href={'mailto:' + agent.email}
              className="flex min-h-11 items-center justify-center rounded-sm border border-bone-edge px-4 text-[0.88rem] text-ink transition-[background-color,border-color,transform] duration-200 ease-out hover:border-ink/25 hover:bg-bone-deep active:translate-y-px"
            >
              Email {agent.name.split(' ')[0]}
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep">
            {agent.role}
          </p>
          <h1 className="mt-3 font-display text-[2.2rem] leading-[1.06] tracking-display text-ink sm:text-[2.8rem]">
            {agent.name}
          </h1>
          {agent.credential && (
            <p className="mt-2.5 text-[0.85rem] text-ink-faint">{agent.credential}</p>
          )}

          <div aria-hidden className="mt-6 h-px w-16 bg-gold" />

          <p className="mt-6 max-w-[42rem] text-[1rem] leading-[1.75] text-ink-mute">
            {agent.bio}
          </p>

          <div className="mt-9 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-ink-faint">
                Areas covered
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {agent.territories.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[0.92rem] text-ink-soft">
                    <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[0.68rem] uppercase tracking-[0.18em] text-ink-faint">
                Known for
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {agent.specialties.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 text-[0.92rem] text-ink-soft">
                    <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-sage" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-sm border border-bone-edge bg-bone p-6 shadow-raise">
            <AgentEnquiry agent={agent} />
          </div>
        </div>
      </div>

      {colleagues.length > 0 && (
        <section className="mt-20 border-t border-bone-edge pt-10">
          <h2 className="font-display text-[1.5rem] tracking-display text-ink">
            Also covering {agent.territories[0]}
          </h2>
          <ul className="mt-6 grid gap-x-6 gap-y-8 xs:grid-cols-2 lg:grid-cols-3">
            {colleagues.map((c) => (
              <li key={c.id}>
                <Link href={'/our-agents/' + c.slug} className="group flex items-center gap-4">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-bone-deep">
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      sizes="64px"
                      className="object-cover [object-position:50%_18%]"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[1rem] tracking-display text-ink transition-colors duration-300 ease-out group-hover:text-gold-deep">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] text-ink-mute">
                      {c.role}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
    </>
  );
}
