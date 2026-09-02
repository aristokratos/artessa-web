"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArtworkImage } from "./ArtworkImage";
import { Badge } from "@/components/ui/Badge";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn, formatPrice } from "@/lib/utils";
import type { ArtworkSummary } from "@/types/catalogue";

/**
 * Grid card with a tilt-on-hover (design-system §3 surface 3).
 *
 * The tilt is a CSS 3D transform driven by pointer position rather than a WebGL
 * scene — it reads as depth, costs nothing, and keeps `three` out of the
 * gallery route's bundle, which is where the 180 KB budget actually binds.
 */
export function ArtworkCard({ artwork }: { artwork: ArtworkSummary }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();

  function onPointerMove(event: React.PointerEvent) {
    if (reduced || !ref.current) return;
    // Coarse pointers get no tilt: on touch there is no hover state to reveal
    // it, and translating taps into rotation just feels broken.
    if (event.pointerType !== "mouse") return;

    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 7, y: px * 9 });
  }

  return (
    <Link
      ref={ref}
      href={`/artwork/${artwork.slug}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="group block [perspective:1200px]"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-sm bg-[var(--color-surface)]",
          "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-gallery)]",
          "will-change-transform",
        )}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* `relative` is required by next/image fill; the plate fallback is
            absolutely positioned by the same wrapper. */}
        <div className="relative aspect-4/5 overflow-hidden">
          <ArtworkImage
            slug={artwork.slug}
            title={artwork.title}
            artistName={artwork.artistName}
            url={artwork.primaryImageUrl}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-gallery)] group-hover:scale-[1.04]"
          />
        </div>

        {!reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%)",
            }}
          />
        )}

        {artwork.isSoldOut && (
          <div className="absolute left-3 top-3">
            {/* A word, not just a treatment — colour is never the only carrier
                of meaning (PRD §10.6). Sold works stay browsable (CAT-07). */}
            <Badge tone="muted" className="bg-[var(--color-ink)]/80">Sold</Badge>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-[family-name:var(--font-display)] text-base leading-snug">
            {artwork.title}
          </h3>
          <p className="mt-1 truncate text-sm text-[var(--color-text-subtle)]">
            {artwork.artistName}
            {artwork.year ? ` · ${artwork.year}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {artwork.fromPriceMinor === null ? (
            <span className="text-sm text-[var(--color-text-subtle)]">Sold</span>
          ) : (
            <>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-subtle)]">
                From
              </span>
              <span className="text-sm text-[var(--color-text)]">
                {formatPrice(artwork.fromPriceMinor, artwork.currency)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
