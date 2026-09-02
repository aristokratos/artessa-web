import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImage } from "@/components/gallery/ArtworkImage";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { VariantPicker } from "@/components/commerce/VariantPicker";
import { Badge } from "@/components/ui/Badge";
import { getArtwork, searchArtworks } from "@/lib/api/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};

  const title = `${artwork.title} — ${artwork.artistName}`;
  return {
    title,
    description: artwork.description ?? undefined,
    openGraph: { title, description: artwork.description ?? undefined, type: "article" },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) notFound();

  // More by the same artist, minus this one.
  const byArtist = await searchArtworks({ artistSlug: artwork.artistSlug, pageSize: 5 });
  const related = byArtist.items.filter((a) => a.slug !== artwork.slug).slice(0, 4);

  const dimensions =
    artwork.widthCm && artwork.heightCm
      ? `${artwork.heightCm} × ${artwork.widthCm} cm`
      : "Digital work — no physical dimensions";

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
      <nav className="mb-8 text-sm text-[var(--color-text-subtle)]">
        <Link href="/gallery" className="hover:text-[var(--color-text)]">
          Gallery
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text-muted)]">{artwork.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-[var(--color-surface)]">
            {/* The detail view uses the primary rendition — watermarked, like
                everything else served publicly. */}
            <ArtworkImage
              slug={artwork.slug}
              title={artwork.title}
              artistName={artwork.artistName}
              url={artwork.media.find((m) => m.isPrimary)?.url ?? artwork.media[0]?.url ?? null}
              alt={artwork.media.find((m) => m.isPrimary)?.altText}
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className="object-cover"
            />
          </div>
          {/* Deep zoom (ART-03) and the lit 3D view (ART-04) attach here once
              real media exists; the 2D plate stays as the guaranteed fallback
              (ART-08). */}
          <p className="mt-3 text-xs text-[var(--color-text-subtle)]">
            Catalogue image. Deep zoom and 3D view arrive with the photography.
          </p>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {artwork.category && <Badge tone="muted">{artwork.category}</Badge>}
            {artwork.tags.map((t) => (
              <Badge key={t} tone="muted">
                {t}
              </Badge>
            ))}
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-[1.05]">
            {artwork.title}
          </h1>

          <Link
            href={`/artists/${artwork.artistSlug}`}
            className="mt-3 inline-block text-lg text-[var(--color-text-muted)] hover:text-[var(--color-light)]"
          >
            {artwork.artistName}
          </Link>

          {artwork.description && (
            <p className="mt-7 leading-relaxed text-[var(--color-text-muted)]">
              {artwork.description}
            </p>
          )}

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-y border-[var(--color-hairline)] py-6 text-sm">
            {artwork.year && (
              <>
                <dt className="text-[var(--color-text-subtle)]">Year</dt>
                <dd>{artwork.year}</dd>
              </>
            )}
            {artwork.medium && (
              <>
                <dt className="text-[var(--color-text-subtle)]">Medium</dt>
                <dd>{artwork.medium}</dd>
              </>
            )}
            <dt className="text-[var(--color-text-subtle)]">Dimensions</dt>
            <dd>{dimensions}</dd>
          </dl>

          <div className="mt-9">
            <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
              Purchase options
            </h2>
            {artwork.variants.length > 0 ? (
              <VariantPicker variants={artwork.variants} />
            ) : (
              <p className="text-sm text-[var(--color-text-subtle)]">Not currently for sale.</p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="mb-10 font-[family-name:var(--font-display)] text-2xl">
            More from {artwork.artistName}
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {related.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
