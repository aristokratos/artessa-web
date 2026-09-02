import Link from "next/link";
import { getExhibitions } from "@/lib/api/catalogue";

export const dynamic = "force-dynamic";
export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions();
  return <main className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-24">
    <p className="text-[11px] uppercase tracking-[.22em] text-[var(--color-light)]">Curated perspectives</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display-lg)]">Exhibitions</h1>
    <div className="mt-16 space-y-5">{exhibitions.map((show, index) => <Link key={show.id} href={`/exhibitions/${show.slug}`} className="group grid min-h-72 overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-surface)] md:grid-cols-[.8fr_1.2fr]">
      <div className="relative min-h-56 bg-[radial-gradient(ellipse_at_35%_40%,#9b7952_0%,#392d26_30%,#101012_72%)]"><span className="absolute left-6 top-6 text-xs text-white/50">EXH · {String(index + 1).padStart(2,"0")}</span></div>
      <div className="flex flex-col justify-end p-8 sm:p-12"><p className="text-xs uppercase tracking-[.16em] text-[var(--color-text-subtle)]">{show.artworkCount} works</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl transition-colors group-hover:text-[var(--color-light)]">{show.title}</h2><p className="mt-4 max-w-xl text-[var(--color-text-muted)]">{show.description}</p></div>
    </Link>)}</div>
  </main>;
}
