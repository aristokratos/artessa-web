# Artessa — Design System & Motion Language

Companion to the PRD (`artessa-api/docs/PRD.md`, §10). The PRD says *what* the
experience must do; this document says *how it looks and moves*.

---

## 1. The brief

**A museum after dark.**

Near-black ground. Warm gallery light. Generous negative space. The artwork is
always the brightest thing on screen, and the interface never competes with it.

Three rules that settle most arguments:

1. **The art is the hero.** If a UI element is drawing the eye away from an
   artwork, it is wrong — regardless of how good it looks in isolation.
2. **Negative space is the luxury signal.** Not gradients, not glass, not glow.
   Cheap sites are dense; galleries are empty.
3. **Money screens get zero novelty.** Everything ambitious lives on the
   browsing side of the add-to-cart line. Cart, checkout, and payment are flat,
   fast, and conventional on purpose.

---

## 2. Tokens

All tokens are defined in `src/app/globals.css` under `@theme` (Tailwind v4).
Never hard-code a hex value in a component — if a colour is missing, add a token.

### Colour

| Token | Dark | Light | Use |
|---|---|---|---|
| `--color-ink` | `#0a0a0b` | `#fbfbfa` | Page ground |
| `--color-surface` | `#141416` | `#ffffff` | Cards, sheets |
| `--color-surface-raised` | `#1c1c1f` | `#f4f4f2` | Menus, modals |
| `--color-hairline` | `#2a2a2e` | `#e4e4e2` | Dividers |
| `--color-text` | `#f4f4f5` | `#18181b` | Primary text |
| `--color-text-muted` | `#a1a1aa` | `#52525b` | Secondary |
| `--color-text-subtle` | `#71717a` | `#7a7a83` | Metadata, captions |
| `--color-light` | `#e8c77a` | `#a8791f` | **The** accent — warm gallery light |
| `--color-danger` | `#f87171` | — | Errors, destructive |

`--color-light` is the only accent and it is rationed: primary CTA, active
filter, focus ring, price emphasis. If it appears more than three times in a
viewport, something is wrong.

Light mode inverts the *values* but keeps every *role* identical, so no
component needs to know which mode it is in.

### Type

Editorial serif for the art (`--font-display`), grotesque for the interface
(`--font-sans`). Display sizes are fluid `clamp()` — no breakpoint jumps.

| Token | Use |
|---|---|
| `--text-display-lg` | Landing hero only |
| `--text-display` | Section and exhibition titles |
| `--text-title` | Artwork titles |

Artwork titles are always serif and always italic-capable. Artist names are
serif. Everything else — prices, buttons, form labels, metadata — is sans.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out-gallery` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |
| `--ease-in-out-gallery` | `cubic-bezier(0.65, 0, 0.35, 1)` | Position changes |
| `--duration-fast` | 150ms | Hover, focus, toggles |
| `--duration-base` | 250ms | Cards, dropdowns |
| `--duration-slow` | 400ms | Page transitions, sheets |

Nothing bounces near money. Spring physics is for browsing delight; checkout
uses linear-feeling ease only.

---

## 3. Motion & 3D inventory

Each surface names the skill in `.claude/skills/` that carries the
implementation guidance. Ask for that skill by name when building the surface.

| # | Surface | Treatment | Skill |
|---|---|---|---|
| 1 | Landing hero | Scroll-driven camera move down a 3D gallery corridor; artworks resolve on the walls as you scroll | `react-three-fiber` + `gsap-scrolltrigger` |
| 2 | Gallery grid | Staggered reveal on enter; cursor-parallax depth on cards | `scroll-reveal-libraries`, `motion-framer` |
| 3 | Artwork card | Tilt-on-hover with spring return, light sweep across the canvas | `react-spring-physics` |
| 4 | Artwork detail | Lit, framed, orbitable 3D canvas with adjustable gallery lighting | `react-three-fiber`, `threejs-webgl` |
| 5 | Virtual exhibition | Guided-rail walk through a curated 3D room | `react-three-fiber`, `blender-web-pipeline` |
| 6 | AR on mobile | "See it on your wall" at true physical scale | `web3d-integration-patterns` |
| 7 | Page transitions | Shared-element morph from grid card to detail hero | `motion-framer` |
| 8 | Commerce micro-interactions | Add-to-cart flight, cart badge spring, checkout progress | `react-spring-physics`, `animejs` |
| 9 | Loading / empty states | Lottie marks and shader shimmer instead of spinners | `lottie-animations` |
| 10 | Curator's spotlight | Volumetric light shaft over the featured work | `threejs-webgl` |

### Pattern references

[motionsites.ai](https://motionsites.ai) is a library of ready-made prompts for
AI site builders, organised by design type and style. The categories worth
mining for Artessa are **3D Websites**, **Interactive**, **Portfolio**, and
**Ecommerce** — its 3D and animated-background patterns (e.g. "Pulse 3D",
"Interactive Discovery", "Golden Portal") map closely onto surfaces 1, 5 and 10
above.

Treat those prompts as *visual reference*, not as code to adopt. They target
one-shot generators building a whole page; here the composition, the token set,
and the tier system in §4 already exist, and a pasted prompt that ignores them
will produce something that looks right in isolation and wrong in the app.

### Skills not imported

Eight of the marketplace's 22 skills are deliberately absent —
`babylonjs-engine`, `pixijs-2d`, `aframe-webxr`, `playcanvas-engine`,
`barba-js`, `rive-interactive`, `substance-3d-texturing`,
`lightweight-3d-effects`. Add one only when a surface genuinely needs it:

```bash
/plugin marketplace add freshtechbro/claudedesignskills
```

`barba-js` in particular is redundant here — Next's App Router and View
Transitions already own page transitions.

---

## 4. Performance tiering

This is a requirement, not an optimisation. Capability is detected once at boot
(GPU renderer string, `deviceMemory`, `hardwareConcurrency`, `navigator.connection`)
and pinned for the session in `src/lib/hooks/useDeviceTier.ts`.

| Tier | Condition | Behaviour |
|---|---|---|
| **A** | Discrete/modern GPU, ≥ 8GB RAM, 4G+ | Full 3D: hero corridor, exhibition room, live-lit viewer |
| **B** | Mid-tier mobile | Static hero image; 3D viewer on demand only; reduced shadow and particle work |
| **C** | Low-end, `save-data`, or no WebGL | No 3D at all. Images and CSS motion. The full catalogue still works |
| **R** | `prefers-reduced-motion: reduce` | Overrides every tier. No parallax, no scroll-jacking, no autoplay. Cross-fades only |

Tier C and R are not degraded experiences to apologise for. They are the
guaranteed baseline, and the site should be genuinely good there first — the 3D
is what tier A gets *on top*.

`globals.css` handles the CSS half of tier R. Every 3D scene must **also**
check `prefers-reduced-motion` in JS and refuse to mount: CSS cannot stop a
`requestAnimationFrame` render loop.

## 5. Budgets

Enforced in CI. A PR that breaks one of these does not merge.

| Budget | Limit |
|---|---|
| Initial JS, gallery route, gzipped | ≤ 180 KB |
| Three.js / 3D scenes | Lazy, route-split, never in the initial bundle |
| Largest `.glb` per artwork | ≤ 3 MB, Draco or Meshopt compressed |
| Hero imagery | AVIF with WebP fallback, responsive `srcset` |
| LCP | ≤ 2.5s on mid-tier Android over 4G |
| CLS | < 0.1 |
| INP | < 200ms |
| Lighthouse accessibility | ≥ 95 |

`@react-three/fiber` and `three` must only ever be reached through
`next/dynamic` with `ssr: false`. A static import anywhere in a shared layout
puts ~150 KB into every route, including checkout, and blows the budget in one
line.

---

## 6. Accessibility

WCAG 2.2 AA, non-negotiable.

- Every 3D view has an equivalent 2D path. The 3D is an enhancement, never the
  only way to see something.
- Full keyboard operation — filters, variant picker, cart, and checkout
  included. Focus is always visible and never trapped.
- Alt text is a **required field** on artwork media in the admin UI. An image
  without a description is not publishable.
- Tap targets ≥ 44×44 px, primary actions within thumb reach.
- Colour is never the sole carrier of meaning — `Sold` is a word, not just a
  treatment.

---

## 7. Component conventions

```
src/components/
  ui/         Design-system primitives — Button, Input, Sheet, Dialog, Badge.
              No business logic, no data fetching.
  three/      R3F scenes and 3D primitives. Every export is dynamic-imported.
  motion/     Reusable motion primitives — Reveal, Stagger, SharedElement.
  gallery/    Catalogue surfaces — ArtworkCard, FilterBar, GalleryGrid.
  commerce/   Cart, variant picker, checkout steps, price display.
  layout/     Shell — header, footer, navigation, theme toggle.
  pwa/        Install prompt, offline banner, update-available toast.
```

Server Components by default. Reach for `"use client"` only where interaction,
animation, or browser APIs genuinely require it — and keep those components as
small leaves, so the 3D and motion code never drags a whole page subtree onto
the client.

Prices are formatted at the edge of the UI only. The API speaks minor units
(kobo) end to end; `formatPrice()` in `src/lib/utils` is the single place a
number becomes a currency string.
