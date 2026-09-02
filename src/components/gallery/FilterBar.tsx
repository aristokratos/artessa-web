"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "Curated", label: "Curator's order" },
  { value: "Newest", label: "Newest" },
  { value: "PriceAscending", label: "Price: low to high" },
  { value: "PriceDescending", label: "Price: high to low" },
];

/**
 * Category and sort controls (CAT-02, CAT-04).
 *
 * State lives in the URL, not in the component (CAT-03) — a filtered view is
 * shareable, the back button works, and the server component above re-fetches
 * from searchParams. useTransition keeps the current results on screen while
 * the new ones load instead of flashing an empty grid.
 */
export function FilterBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeCategory = params.get("category") ?? "";
  const activeSort = params.get("sort") ?? "Curated";

  function apply(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Any filter change invalidates the current page number.
    next.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-5 border-b border-[var(--color-hairline)] pb-6",
        "md:flex-row md:items-center md:justify-between",
        pending && "opacity-60 transition-opacity",
      )}
    >
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {[{ label: "All", value: "" }, ...categories.map((c) => ({ label: c, value: c }))].map(
          (c) => (
            <button
              key={c.value || "all"}
              type="button"
              onClick={() => apply("category", c.value)}
              aria-pressed={activeCategory === c.value}
              className={cn(
                "shrink-0 rounded-sm px-4 py-2 text-sm transition-colors",
                activeCategory === c.value
                  ? "bg-[var(--color-light)]/15 text-[var(--color-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
              )}
            >
              {c.label}
            </button>
          ),
        )}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <span className="text-[var(--color-text-subtle)]">Sort</span>
        <select
          value={activeSort}
          onChange={(e) => apply("sort", e.target.value)}
          className="min-h-11 cursor-pointer rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-[var(--color-text)]"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
