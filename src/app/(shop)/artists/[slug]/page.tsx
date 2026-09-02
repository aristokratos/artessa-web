import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { getArtist } from "@/lib/api/catalogue";

export const dynamic = "force-dynamic";
export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const artist = await getArtist((await params).slug);
  if (!artist) notFound();
  return <main className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-20">
    <Link href="/artists" className="text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">← All artists</Link>
    <header className="mt-12 grid gap-10 border-b border-[var(--color-hairline)] pb-16 lg:grid-cols-[1fr_1.2fr]">
      <div><p className="text-[11px] uppercase tracking-[.2em] text-[var(--color-light)]">{artist.countryCode ?? "Artessa artist"}</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display-lg)] leading-none">{artist.name}</h1></div>
      <div className="self-end"><p className="max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">{artist.biography ?? "A distinct voice in the Artessa programme, exploring new ways of seeing and remembering."}</p>{artist.instagramHandle && <a className="mt-5 inline-block text-sm text-[var(--color-light)]" href={`https://instagram.com/${artist.instagramHandle.replace("@", "")}`}>Instagram ↗</a>}</div>
    </header>
    <section className="py-16"><div className="mb-10 flex items-end justify-between"><h2 className="font-[family-name:var(--font-display)] text-3xl">Selected works</h2><span className="text-sm text-[var(--color-text-subtle)]">{artist.artworks.length} in collection</span></div><div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">{artist.artworks.map(a => <ArtworkCard key={a.id} artwork={a}/>)}</div></section>
  </main>;
}
