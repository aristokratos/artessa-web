import Link from "next/link";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { ArtworkPlate } from "@/components/gallery/ArtworkPlate";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getExhibitions, getExhibition, searchArtworks } from "@/lib/api/catalogue";

// The catalogue API is an independently deployed Render service. Rendering
// this route at request time keeps a frontend build from depending on that
// service being configured and reachable from the Vercel build worker.
export const dynamic = "force-dynamic";

export default async function Home() {
  // The featured row is the current exhibition when there is one — the curator
  // decides what leads, not a flag on the artwork.
  const exhibitions = await getExhibitions();
  const current = exhibitions[0] ? await getExhibition(exhibitions[0].slug) : null;

  const all = await searchArtworks({ pageSize: 4 });
  const featured = current?.artworks.length ? current.artworks.slice(0, 4) : all.items;
  const hero = featured[0];

  return (
    <main>
      {/* Placeholder for the scroll-driven 3D gallery corridor (design-system
          §3 surface 1) — deliberately static until the R3F scene is built, so
          the landing route stays inside its JS budget. */}
      <section className="relative overflow-hidden border-b border-[var(--color-hairline)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">
              {current ? `Now showing · ${current.title}` : "Now showing"}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display-lg)] leading-[0.95] tracking-tight">
              A museum
              <br />
              after dark
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-[var(--color-text-muted)]">
              Contemporary work from across the continent. Original paintings,
              limited edition prints, and licensed digital pieces — each one
              catalogued, authenticated, and shipped by us.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/gallery">Enter the gallery</Button>
              <Button href="/exhibitions" variant="secondary">
                Current exhibitions
              </Button>
            </div>
          </div>

          {hero && (
            <Link
              href={`/artwork/${hero.slug}`}
              className="group relative block aspect-4/5 overflow-hidden rounded-sm sm:aspect-3/2 lg:aspect-4/5"
            >
              <ArtworkPlate
                slug={hero.slug}
                title={hero.title}
                artistName={hero.artistName}
                className="h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-out-gallery)] group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/70 to-transparent p-6 pt-20">
                <h2 className="font-[family-name:var(--font-display)] text-2xl">{hero.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {hero.artistName}
                  {hero.medium ? ` · ${hero.medium}` : ""}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
              Selected works
            </h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              {current ? current.description : "Chosen by the curator this month."}
            </p>
          </div>
          <Link
            href="/gallery"
            className="hidden shrink-0 text-sm text-[var(--color-light)] hover:underline sm:block"
          >
            View all {all.totalCount} works →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {featured.map((artwork, i) => (
            <Reveal key={artwork.id} index={i}>
              <ArtworkCard artwork={artwork} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
