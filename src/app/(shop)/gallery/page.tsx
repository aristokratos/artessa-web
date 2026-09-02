import type { Metadata } from "next";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { FilterBar } from "@/components/gallery/FilterBar";
import { Reveal } from "@/components/motion/Reveal";
import { getCategories, searchArtworks } from "@/lib/api/catalogue";
import type { ArtworkSort } from "@/types/catalogue";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse every work in the Artessa collection.",
};

const SORTS: ArtworkSort[] = ["Curated", "Newest", "PriceAscending", "PriceDescending"];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams;

  const first = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // The sort arrives from the URL, so it is user input — validated against the
  // known set rather than passed through to the API.
  const requestedSort = first("sort");
  const sort = SORTS.includes(requestedSort as ArtworkSort)
    ? (requestedSort as ArtworkSort)
    : "Curated";

  const [result, categories] = await Promise.all([
    searchArtworks({
      category: first("category"),
      q: first("q"),
      sort,
      page: Number(first("page")) || 1,
      pageSize: 24,
    }),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
          Gallery
        </h1>
        <p className="mt-3 max-w-lg text-[var(--color-text-muted)]">
          Every work currently in the collection. Browse freely — an account is
          only needed when you are ready to buy.
        </p>
      </header>

      <FilterBar categories={categories} />

      <p className="mb-8 text-sm text-[var(--color-text-subtle)]">
        {result.totalCount} {result.totalCount === 1 ? "work" : "works"}
      </p>

      {result.items.length === 0 ? (
        <p className="py-20 text-center text-[var(--color-text-subtle)]">
          No works match those filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((artwork, i) => (
            <Reveal key={artwork.id} index={i}>
              <ArtworkCard artwork={artwork} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
