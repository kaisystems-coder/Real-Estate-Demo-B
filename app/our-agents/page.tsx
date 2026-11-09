import { abs, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import AgentRoster from '@/components/AgentRoster';
import { getAgents } from '@/lib/agents';

export const metadata: Metadata = {
  title: 'Our agents',
  description:
    'The people who hold the files. Licensed agents covering Trinidad and Tobago, from Westmoorings to Scarborough.',
  alternates: { canonical: abs('/our-agents') },
  openGraph: {
    title: 'Our agents · ' + SITE_NAME,
    description:
      'The people who hold the files. Licensed agents covering Trinidad and Tobago, from Westmoorings to Scarborough.',
    url: abs('/our-agents'),
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function AgentsPage() {
  const agents = getAgents();

  return (
    <>
      <PageHeader
        eyebrow="Our agents"
        title="The people who hold the files"
        intro="Every listing on this site belongs to a named agent who has walked the property, measured it and priced it. Find the one who works your area."
        meta={agents.length + ' licensed agents across Trinidad & Tobago'}
      />

      <section className="mx-auto max-w-[82rem] px-5 py-12 sm:px-8 sm:py-16">
        <AgentRoster agents={agents} />
      </section>
    </>
  );
}
