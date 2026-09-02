import Image from "next/image";
import { ArtworkPlate } from "./ArtworkPlate";

interface Props {
  slug: string;
  title: string;
  artistName: string;
  /** Watermarked rendition from the API. Null until photography is uploaded. */
  url?: string | null;
  alt?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * One place that decides how an artwork is pictured.
 *
 * Real photography when it exists, the generated plate when it does not — so a
 * half-populated catalogue never shows broken images or empty boxes, and the
 * grid keeps its rhythm while a curator is still uploading.
 *
 * Every URL this renders is a WATERMARKED rendition. The unwatermarked master
 * is not served from the public root at all; it is released only against a
 * purchase.
 */
export function ArtworkImage({
  slug,
  title,
  artistName,
  url,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: Props) {
  if (!url) {
    return (
      <ArtworkPlate slug={slug} title={title} artistName={artistName} className={className} />
    );
  }

  return (
    <Image
      src={url}
      alt={alt?.trim() || `${title} by ${artistName}`}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      // Uploads are arbitrary aspect ratios; the frame is fixed, so fill the
      // frame and crop rather than letterboxing every card differently.
      style={{ objectFit: "cover" }}
      // A right-click block is theatre — the watermark is the actual defence —
      // but it does stop the most casual "save image as".
      draggable={false}
    />
  );
}
