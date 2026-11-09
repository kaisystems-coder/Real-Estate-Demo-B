import type { Agent } from '@/types/agent';

/**
 * The agency roster.
 *
 * Every portrait ID below was downloaded and visually inspected on a contact
 * sheet before it was assigned — an Unsplash ID returns 200 even when the
 * photo shows an unrelated subject, so a status code is not verification.
 *
 * Reskinning for a prospect: replace this array with the agency's real people.
 * Nothing else in the app hardcodes an agent.
 */
// Local copies in public/photos/, same 800x800 crop as the original CDN URL.
const portrait = (id: string) => '/photos/agent-' + id + '.jpg';

export const AGENTS: Agent[] = [
  {
    id: 'ag-01',
    slug: 'marcus-alleyne',
    name: 'Marcus Alleyne',
    role: 'Principal & Managing Director',
    territories: ['North-West Trinidad', 'Port of Spain'],
    specialties: ['Luxury residential', 'Waterfront', 'Investment portfolios'],
    bio: 'Marcus opened the Woodbrook office in 2009 after a decade valuing commercial property for a regional bank. He handles the agency\u2019s waterfront and gated-development work, and still personally walks every listing above four million before it goes on the books.',
    phone: '+1 (868) 622-4180',
    email: 'marcus@prestigeproperties.tt',
    image: portrait('photo-1507003211169-0a1dd7228f2d'),
    joined: 2009,
    languages: ['English'],
    credential: 'AREA (T&T) member',
  },
  {
    id: 'ag-02',
    slug: 'priya-ramnarine',
    name: 'Priya Ramnarine',
    role: 'Senior Sales Agent',
    territories: ['Central Trinidad', 'East Trinidad'],
    specialties: ['Family homes', 'New developments', 'First-time buyers'],
    bio: 'Priya covers the central belt from Chaguanas out to Trincity and has closed more first-time purchases than anyone else on the team. She is the agent to call if the stamp duty exemption and the mortgage pre-approval need to line up on the same closing date.',
    phone: '+1 (868) 622-4182',
    email: 'priya@prestigeproperties.tt',
    image: portrait('photo-1573496359142-b8d87734a5a2'),
    joined: 2014,
    languages: ['English', 'Hindi'],
    credential: 'Licensed valuator',
  },
  {
    id: 'ag-03',
    slug: 'dominic-charles',
    name: 'Dominic Charles',
    role: 'Commercial & Land Specialist',
    territories: ['South Trinidad', 'Central Trinidad'],
    specialties: ['Commercial leasing', 'Agricultural land', 'Industrial'],
    bio: 'Dominic works the San Fernando and Point Lisas corridor, where most of his business is warehouse space and undeveloped acreage. He reads a survey plan faster than he reads a listing sheet, which is why the land files land on his desk.',
    phone: '+1 (868) 622-4183',
    email: 'dominic@prestigeproperties.tt',
    image: portrait('photo-1607346256330-dee7af15f7c5'),
    joined: 2016,
    languages: ['English'],
  },
  {
    id: 'ag-04',
    slug: 'sarah-boodoo',
    name: 'Sarah Boodoo',
    role: 'Rentals Manager',
    territories: ['Port of Spain', 'North Trinidad'],
    specialties: ['Executive rentals', 'Corporate relocation', 'Short lease'],
    bio: 'Sarah runs the rental book, which in Port of Spain means diplomatic and energy-sector relocations on tight timelines. She keeps a standing shortlist of furnished units in Maraval and St Clair for tenants who land on a Friday and need keys by Monday.',
    phone: '+1 (868) 622-4184',
    email: 'sarah@prestigeproperties.tt',
    image: portrait('photo-1580489944761-15a19d654956'),
    joined: 2018,
    languages: ['English', 'Spanish'],
  },
  {
    id: 'ag-05',
    slug: 'andre-mohammed',
    name: 'Andre Mohammed',
    role: 'Sales Agent, Tobago',
    territories: ['Tobago'],
    specialties: ['Villas', 'Holiday lets', 'Sea-view land'],
    bio: 'Andre is the agency\u2019s Tobago desk, based in Scarborough and covering the island from Crown Point to Speyside. Most of his buyers are overseas, so he shoots his own walkthrough video for every listing before the photographer arrives.',
    phone: '+1 (868) 622-4185',
    email: 'andre@prestigeproperties.tt',
    image: portrait('photo-1500648767791-00dcc994a43e'),
    joined: 2019,
    languages: ['English'],
  },
  {
    id: 'ag-06',
    slug: 'kieron-baptiste',
    name: 'Kieron Baptiste',
    role: 'Mortgage & Finance Adviser',
    territories: ['North-West Trinidad', 'Port of Spain', 'Central Trinidad'],
    specialties: ['Mortgage structuring', 'Closing costs', 'Bank liaison'],
    bio: 'Kieron sits between the buyer and the bank. He came from the lending side, so he builds the affordability case before an offer goes in and tells clients what the settlement statement will actually say at closing.',
    phone: '+1 (868) 622-4186',
    email: 'kieron@prestigeproperties.tt',
    image: portrait('photo-1600180758890-6b94519a8ba6'),
    joined: 2021,
    languages: ['English', 'French'],
    credential: 'Certified mortgage adviser',
  },
];

export function getAgents(): Agent[] {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('agents').select('*').order('joined');
  return AGENTS;
}

export function getAgentBySlug(slug: string): Agent | undefined {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('agents').select('*').eq('slug', slug).single();
  return AGENTS.find((a) => a.slug === slug);
}

/** Every territory covered by at least one agent, in the roster's own order. */
export function allTerritories(agents: Agent[]): string[] {
  const order = [
    'North-West Trinidad',
    'North Trinidad',
    'Port of Spain',
    'East Trinidad',
    'Central Trinidad',
    'South Trinidad',
    'Tobago',
  ];
  const present = new Set(agents.flatMap((a) => a.territories));
  return order.filter((t) => present.has(t));
}
