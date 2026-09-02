"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArtworkImage } from "@/components/gallery/ArtworkImage";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { formatPrice } from "@/lib/utils";
import type { ArtworkSummary } from "@/types/catalogue";

const DURATION = 650;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Deep washes rather than the saturated brights a toy carousel would use.
 *
 * The rule the whole design follows: the artwork is the brightest thing on
 * screen. A vivid backdrop makes the room compete with what is hung in it, so
 * these sit dark enough to stay behind the work while still shifting
 * perceptibly as the carousel turns.
 */
const WASHES = [
  { base: "#1a1016", glow: "#7c2d4a" },
  { base: "#0f1714", glow: "#1f5f4a" },
  { base: "#0e1220", glow: "#2b3f7a" },
  { base: "#1a1410", glow: "#7a5423" },
  { base: "#160f1c", glow: "#553a7a" },
  { base: "#1a0f0f", glow: "#7a2f2f" },
] as const;

function washFor(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return WASHES[h % WASHES.length]!;
}

/** Where each artwork sits relative to the active one. */
type Role = "center" | "left" | "right" | "back" | "hidden";

interface Props {
  artworks: ArtworkSummary[];
  exhibitionTitle?: string | null;
}

export function HeroCarousel({ artworks, exhibitionTitle }: Props) {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const animating = useRef(false);
  const reduced = usePrefersReducedMotion();

  const count = artworks.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (count < 2) return;
      // The lock stops a fast double-click starting a second transition while
      // the first is mid-flight, which otherwise lands items in the wrong role.
      if (animating.current) return;

      animating.current = true;
      setActive((prev) => (direction === "next" ? (prev + 1) % count : (prev - 1 + count) % count));

      // Under reduced motion the change is instant, so the lock is too.
      window.setTimeout(() => {
        animating.current = false;
      }, reduced ? 0 : DURATION);
    },
    [count, reduced],
  );

  // Arrow keys, because a carousel that only responds to mouse clicks is not
  // keyboard operable (PRD §10.6).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigate("prev");
      if (event.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const roleOf = useCallback(
    (index: number): Role => {
      if (index === active) return "center";
      if (count < 2) return "hidden";
      if (index === (active + count - 1) % count) return "left";
      if (index === (active + 1) % count) return "right";
      if (count > 3 && index === (active + 2) % count) return "back";
      return "hidden";
    },
    [active, count],
  );

  const current = artworks[active];
  const wash = useMemo(() => washFor(current?.slug ?? "artessa"), [current?.slug]);

  if (!current) return null;

  const ghostWord = (current.category ?? "Artessa").toUpperCase();

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured works"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: wash.base,
        transition: reduced ? "none" : `background-color ${DURATION}ms ${EASE}`,
      }}
    >
      <div className="relative h-[100svh] w-full overflow-hidden">
        {/* A pool of light behind the work, the way a gallery lights a wall. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${wash.glow}55 0%, transparent 70%)`,
            transition: reduced ? "none" : `background ${DURATION}ms ${EASE}`,
            zIndex: 1,
          }}
        />

        {/* The ghost word. Anton is used ONLY here — as a graphic mass rather
            than as type to read. Real headings stay on the editorial serif. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 flex select-none items-center justify-center"
          style={{ top: "16%", zIndex: 2 }}
        >
          <span
            className="font-[family-name:var(--font-ghost)] whitespace-nowrap uppercase"
            style={{
              fontSize: "clamp(84px, 26vw, 360px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              opacity: 0.07,
              transition: reduced ? "none" : `opacity ${DURATION}ms ${EASE}`,
            }}
          >
            {ghostWord}
          </span>
        </div>

        {/* Stage. Framed works, not figurines: each sits in its own frame with a
            cast shadow so the depth reads as hanging rather than standing. */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {artworks.map((artwork, index) => {
            const role = roleOf(index);
            if (role === "hidden") return null;

            const style = frameStyle(role, isMobile);

            return (
              <div
                key={artwork.id}
                aria-hidden={role !== "center"}
                className="absolute"
                style={{
                  ...style,
                  transition: reduced
                    ? "none"
                    : `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}, height ${DURATION}ms ${EASE}, bottom ${DURATION}ms ${EASE}`,
                  willChange: "transform, filter, opacity",
                }}
              >
                <Link
                  href={`/artwork/${artwork.slug}`}
                  tabIndex={role === "center" ? 0 : -1}
                  className="block h-full w-full"
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-[2px]"
                    style={{
                      boxShadow:
                        role === "center"
                          ? "0 40px 90px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)"
                          : "0 20px 50px -20px rgba(0,0,0,0.6)",
                    }}
                  >
                    <ArtworkImage
                      slug={artwork.slug}
                      title={artwork.title}
                      artistName={artwork.artistName}
                      url={artwork.primaryImageUrl}
                      alt={artwork.title}
                      priority={role === "center"}
                      sizes="(max-width: 640px) 70vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Canvas tooth over the whole stage, so the composition reads as one
            printed surface rather than layered UI panels. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundSize: "200px 200px",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Caption and controls. */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-16 sm:left-12"
          style={{ zIndex: 60, maxWidth: 340 }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">
            {exhibitionTitle ? `Now showing · ${exhibitionTitle}` : "Now showing"}
          </p>

          {/* aria-live so the title is announced as the carousel turns —
              otherwise a screen reader user hears nothing change. */}
          <div aria-live="polite" aria-atomic="true">
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight text-white sm:text-[28px]">
              {current.title}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {current.artistName}
              {current.year ? ` · ${current.year}` : ""}
              {current.fromPriceMinor !== null
                ? ` · from ${formatPrice(current.fromPriceMinor, current.currency)}`
                : " · sold"}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <CarouselButton label="Previous work" onClick={() => navigate("prev")}>
              <ArrowLeft size={24} strokeWidth={2.25} />
            </CarouselButton>
            <CarouselButton label="Next work" onClick={() => navigate("next")}>
              <ArrowRight size={24} strokeWidth={2.25} />
            </CarouselButton>
            <span className="ml-2 text-xs tabular-nums text-white/50">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </div>
        </div>

        <Link
          href={`/artwork/${current.slug}`}
          className="group absolute bottom-6 right-4 flex items-center gap-3 text-white/90 transition-opacity duration-200 hover:opacity-100 sm:bottom-16 sm:right-12"
          style={{ zIndex: 60 }}
        >
          <span
            className="font-[family-name:var(--font-ghost)] uppercase"
            style={{
              fontSize: "clamp(20px, 3.4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            View the work
          </span>
          <ArrowRight
            className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 sm:h-8 sm:w-8"
            strokeWidth={2.25}
          />
        </Link>
      </div>
    </section>
  );
}

function CarouselButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/70 text-white transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white/12 focus-visible:scale-105 sm:h-14 sm:w-14"
    >
      {children}
    </button>
  );
}

/**
 * Position, scale and blur per role.
 *
 * Portrait-ish frames rather than the 0.6/1 figurine ratio, and anchored to the
 * vertical middle rather than the floor — these are works hung on a wall, not
 * objects standing on one.
 */
function frameStyle(role: Exclude<Role, "hidden">, isMobile: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    aspectRatio: "4 / 5",
    transform: "translate(-50%, -50%)",
    top: "48%",
  };

  switch (role) {
    case "center":
      return {
        ...base,
        left: "50%",
        height: isMobile ? "46%" : "68%",
        filter: "none",
        opacity: 1,
        zIndex: 20,
      };
    case "left":
      return {
        ...base,
        left: isMobile ? "12%" : "22%",
        height: isMobile ? "20%" : "34%",
        filter: "blur(2px)",
        opacity: 0.8,
        zIndex: 10,
      };
    case "right":
      return {
        ...base,
        left: isMobile ? "88%" : "78%",
        height: isMobile ? "20%" : "34%",
        filter: "blur(2px)",
        opacity: 0.8,
        zIndex: 10,
      };
    case "back":
      return {
        ...base,
        left: "50%",
        top: "40%",
        height: isMobile ? "16%" : "26%",
        filter: "blur(5px)",
        opacity: 0.55,
        zIndex: 5,
      };
  }
}
