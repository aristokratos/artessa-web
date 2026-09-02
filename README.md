# Artessa Web

Frontend for **Artessa**, an online art gallery and sales platform. Next.js
(App Router), TypeScript, Tailwind v4, React Three Fiber, installable PWA.

The backend lives in a separate repo: **[`artessa-api`](../artessa-api)** (.NET 10).

📄 **[Product Requirements Document](../artessa-api/docs/PRD.md)** — scope, domain
model, API surface, payment flow.
🎨 **[Design system & motion language](docs/design-system.md)** — tokens, the 3D
inventory, performance tiers, accessibility.

---

## Quick start

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

The API must be running at `NEXT_PUBLIC_API_URL` (default
`http://localhost:5080`) for anything past the landing page.

## Structure

```
src/
  app/
    (marketing)/       Landing, about, exhibitions
    (shop)/            gallery, artwork/[slug], artists/[slug], cart, checkout
    (auth)/            login, signup, oauth/callback
    account/           orders, downloads, profile, wishlist
    sw.ts              Serwist service worker source
  components/
    ui/                Design-system primitives — no business logic
    three/             R3F scenes. Every export is dynamic-imported
    motion/            Reveal, Stagger, SharedElement
    gallery/           ArtworkCard, FilterBar, GalleryGrid
    commerce/          Cart, variant picker, checkout steps, price display
    layout/            Header, footer, nav, theme toggle
    pwa/               Install prompt, offline banner, update toast
  lib/
    api/               Typed client over the backend's OpenAPI document
    auth/              Token handling, Google redirect, add-to-cart intent
    paystack/          Redirect + callback handling
    hooks/             useDeviceTier, useReducedMotion, …
    store/             Zustand — cart and UI state
    utils/             formatPrice and friends
  types/api.d.ts       Generated. Do not edit by hand
```

Server Components by default. `"use client"` only where interaction, animation,
or browser APIs require it — kept as small leaves so 3D and motion code never
drags a whole page subtree onto the client.

## API types are generated, not written

```bash
npm run api:types
```

Reads the backend's OpenAPI document and regenerates `src/types/api.d.ts`.
Because the repos are separate, this is what keeps the contract from drifting —
run it whenever the API changes, and in CI.

## Design skills

`.claude/skills/` carries 14 imported skills from
[freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills),
selected for this project:

`react-three-fiber` · `threejs-webgl` · `gsap-scrolltrigger` · `motion-framer` ·
`react-spring-physics` · `animated-component-libraries` ·
`scroll-reveal-libraries` · `lottie-animations` · `locomotive-scroll` ·
`spline-interactive` · `animejs` · `blender-web-pipeline` · `modern-web-design` ·
`web3d-integration-patterns`

They activate automatically when a task matches. The other eight from the
marketplace were left out deliberately — see
[docs/design-system.md §3](docs/design-system.md).

## Three things that will bite you

**Never static-import `three` or `@react-three/fiber`.** One static import in a
shared layout puts ~150 KB into every route, checkout included, and blows the
performance budget in a single line. Always `next/dynamic` with `ssr: false`.

**`prefers-reduced-motion` must be checked in JS too.** `globals.css` handles
transitions and animations, but CSS cannot stop a `requestAnimationFrame` render
loop — every 3D scene has to check and refuse to mount.

**`NEXT_PUBLIC_*` is public and baked in at build time.** It ends up in the
client bundle verbatim. The Google client secret and Paystack secret key live
only in the API and must never appear here.

## Deployment

Render blueprint in [`render.yaml`](render.yaml). `output: "standalone"` keeps
the image small.

```bash
docker build -t artessa-web .
```

`NEXT_PUBLIC_*` values are build arguments, not runtime env — they must be
present when the image is built.
