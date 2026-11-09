# Prestige Properties — sales demo

A front-end demonstration of a property site plus listing manager, built to show
Trinidad & Tobago agencies what a custom site could do. Ten listings, priced in
TTD, across Trinidad and Tobago.

```bash
npm install
npm run dev        # http://localhost:5300
```

On Windows, if the project path contains spaces and the npm script fails, run
Next directly:

```bash
node node_modules/next/dist/bin/next dev -p 5300
```

## 1. This is a static demo with no backend

There is no backend and no database. The ten listings live in
`lib/mock-listings.ts` and are loaded into a Zustand store
(`lib/store.ts`) when the app boots.

The store is shared by all three surfaces, which is the point of the demo: add,
edit or delete a property in `/admin` and the change appears on the homepage and
the detail pages immediately, with no reload.

**There is no database.** The store is backed by `sessionStorage`, which is the
right lifetime for a pitch: changes survive a page reload or a pasted URL, so a
property added on screen doesn't vanish mid-demo, but closing the tab resets to
the seeded ten for the next prospect. The admin header says so, so nobody
mistakes it for a saved record.

Because the server prerenders from the seed data, components that depend on
restored listings wait one tick for `useStoreHydrated()` before rendering. That
avoids both a hydration mismatch and a false "no longer on the books" flash on
a listing that was added in the manager.

## 2. Where Supabase plugs in

All data access goes through `lib/listings.ts`. No component imports the store
or the mock array directly, so the swap is confined to five function bodies:

| Function | Replacement query |
| --- | --- |
| `getListings()` | `supabase.from('listings').select('*')` |
| `getListingBySlug(slug)` | `.select('*').eq('slug', slug).single()` |
| `createListing(draft)` | `.insert(draft).select().single()` |
| `updateListing(id, patch)` | `.update(patch).eq('id', id)` |
| `deleteListing(id)` | `.delete().eq('id', id)` |

Each carries a `// TODO: replace with Supabase query` comment with the exact
call. When these become async, the read functions are already called from
Server Components and the writes from event handlers, so the call sites take an
`await` and nothing restructures.

The `Listing` interface in `types/listing.ts` is the table schema: snake-case
the field names and it maps one to one.

## 3. Reskinning for a different prospect

Two files carry the entire brand:

**`components/Logo.tsx`** — the agency name, tagline, phone, email and office
address, all in one exported `BRAND` object.

**`tailwind.config.ts`** — six colour tokens. Nothing else in the codebase
references a raw hex value, so replacing these reskins every surface:

| Token | Current | Role |
| --- | --- | --- |
| `ink` | `#12130F` | Near-black charcoal — text, dark grounds |
| `bone` | `#FAF8F4` | Warm off-white — page ground |
| `bone.edge` | `#E7E2D8` | Stone — hairlines, the spec ledger rules |
| `gold` | `#B8934D` | Muted accent |
| `gold.deep` | `#8E6F36` | The accent at AA contrast on light grounds |
| `sage` | `#8C9284` | Secondary accent |

Fonts are set in `app/layout.tsx` (Fraunces for display, Outfit for UI).

## 4. Notes on the build

**Performance.** Everything is statically generated at build time — all 15
routes, including a prerendered page per listing. Filtering and sorting run
synchronously against the in-memory array with no debounce and no spinner,
because ten listings and seven predicates is microseconds of work.

**Images.** Sourced from Unsplash. Every photograph was downloaded and visually
checked before being assigned, because Unsplash returns HTTP 200 for IDs whose
image is missing or shows an unrelated subject. The image config serves WebP
only; AVIF encoding costs seconds per variant on a cold cache and this demo is
judged on how fast it feels.

**Motion.** Reveal animations are additive — every element's resting state is
visible, and animation only offsets it. If motion never runs, nothing is
invisible. `prefers-reduced-motion` is respected throughout.

**Dependencies.** `npm audit` reports zero vulnerabilities. The brief specified
Next 14, but that line no longer receives security patches and shipped an
unauthenticated RCE in the image optimizer, so this runs on Next 16. The App
Router structure the brief asked for is unchanged.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero, featured rail, sticky filters, listings grid |
| `/listings/[slug]` | Gallery, spec ledger, amenities, map plate, enquiry form |
| `/admin` | Table with search and status filter, add/edit/delete |

## Deploying

```bash
npm run build
vercel deploy
```
