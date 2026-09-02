import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getArtists } from "@/lib/api/catalogue";

export const metadata: Metadata = { title: "Artists", description: "Meet the artists shaping the Artessa collection." };
export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const artists = await getArtists();
  return (
    <main>
      <header className="border-b border-[var(--color-hairline)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[11px] uppercase tracking-[.22em] text-[var(--color-light)]">The programme</p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--text-display-lg)] leading-[.95]">Artists defining a new visual language.</h1>
        </div>
      </header>
      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-20">
        <div className="grid gap-px bg-[var(--color-hairline)] md:grid-cols-2 xl:grid-cols-3">
          {artists.map((artist, index) => (
            <Link key={artist.id} href={`/artists/${artist.slug}`} className="group relative min-h-72 overflow-hidden bg-[var(--color-surface)] p-8 transition-colors hover:bg-[var(--color-surface-raised)]">
              <span className="text-xs text-[var(--color-text-subtle)]">{String(index + 1).padStart(2, "0")}</span>
              <div className="absolute inset-x-8 bottom-8">
                <p className="text-xs uppercase tracking-[.16em] text-[var(--color-text-subtle)]">{artist.countryCode ?? "Artessa artist"} · {artist.artworkCount} {artist.artworkCount === 1 ? "work" : "works"}</p>
                <div className="mt-3 flex items-end justify-between gap-6"><h2 className="font-[family-name:var(--font-display)] text-3xl">{artist.name}</h2><ArrowUpRight className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={22}/></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
