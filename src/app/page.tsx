import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getExhibitions, getExhibition, searchArtworks } from "@/lib/api/catalogue";

export const dynamic = "force-dynamic";

export default async function Home() {
  // The current exhibition leads when there is one — the curator decides what
  // is on the wall, not a flag on an artwork.
  const exhibitions = await getExhibitions();
  const current = exhibitions[0] ? await getExhibition(exhibitions[0].slug) : null;

  const all = await searchArtworks({ pageSize: 8 });
  const hero = current?.artworks.length ? current.artworks.slice(0, 5) : all.items.slice(0, 5);
  const rest = all.items.slice(0, 8);

  return (
    <main>
      {hero.length > 0 && (
        <HeroCarousel artworks={hero} exhibitionTitle={current?.title ?? null} />
      )}

      {/* An empty catalogue should say so rather than render an empty grid. */}
      {hero.length === 0 && (
        <section className="mx-auto max-w-[900px] px-5 py-32 text-center sm:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
            The walls are bare
          </h1>
          <p className="mt-5 text-[var(--color-text-muted)]">
            No work has been published yet. Add the first piece from the Studio.
          </p>
          <Button href="/admin/artworks" className="mt-8">Open the Studio</Button>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">
                The collection
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
                {current?.title ?? "Selected works"}
              </h2>
              {current?.description && (
                <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">
                  {current.description}
                </p>
              )}
            </div>

            <Link
              href="/gallery"
              className="hidden shrink-0 items-center gap-2 text-sm text-[var(--color-light)] hover:underline sm:flex"
            >
              All {all.totalCount} works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4">
            {rest.map((artwork, i) => (
              <Reveal key={artwork.id} index={i}>
                <ArtworkCard artwork={artwork} />
              </Reveal>
            ))}
          </div>

          <div className="mt-16 sm:hidden">
            <Button href="/gallery" variant="secondary" className="w-full">
              All {all.totalCount} works
            </Button>
          </div>
        </section>
      )}

      {/* Says plainly what the buyer gets — the thing most art sites leave you
          guessing about. */}
      <section className="border-t border-[var(--color-hairline)]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            {
              title: "Originals",
              body: "One of one. Shipped insured and tracked, with a certificate of authenticity.",
            },
            {
              title: "Limited prints",
              body: "Archival paper, numbered within a stated edition. The edition never grows.",
            },
            {
              title: "Digital licences",
              body: "The full-resolution file, released on purchase. Everything shown on this site is watermarked.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-[family-name:var(--font-display)] text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
