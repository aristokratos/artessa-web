import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { getExhibition } from "@/lib/api/catalogue";

export const dynamic = "force-dynamic";
export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const show = await getExhibition((await params).slug); if (!show) notFound();
  return <main><header className="relative min-h-[62vh] overflow-hidden border-b border-[var(--color-hairline)] bg-[radial-gradient(ellipse_at_65%_30%,#725942_0%,#221c1a_32%,#0a0a0b_70%)]"><div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent"/><div className="relative mx-auto flex min-h-[62vh] max-w-[1400px] flex-col justify-end px-5 py-16 sm:px-8"><Link href="/exhibitions" className="mb-auto text-sm text-white/60">← Exhibitions</Link><p className="text-xs uppercase tracking-[.22em] text-[var(--color-light)]">Now showing · {show.artworks.length} works</p><h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--text-display-lg)] leading-none text-white">{show.title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">{show.description}</p></div></header><section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8"><div className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-3 xl:grid-cols-4">{show.artworks.map(a => <ArtworkCard key={a.id} artwork={a}/>)}</div></section></main>;
}
