/**
 * Mirrors the DTOs in `Artessa.Application/Catalogue/CatalogueDtos.cs`.
 *
 * Hand-written for now. These are replaced by `npm run api:types`, which
 * generates `types/api.d.ts` from the backend's OpenAPI document — that is what
 * stops the contract drifting once the repos evolve independently.
 */

export type VariantKind = "OriginalPhysical" | "PrintPhysical" | "DigitalLicence";

export type LicenceType = "PersonalUse" | "Commercial" | "ExtendedCommercial";

export type MediaType = "Image" | "Model3D" | "Video";

export type ArtworkSort = "Curated" | "Newest" | "PriceAscending" | "PriceDescending";

export type AvailabilityFilter = "Any" | "Available" | "Sold";

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ArtworkSummary {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  year: number | null;
  medium: string | null;
  category: string | null;
  primaryImageStorageKey: string | null;
  primaryImageAlt: string | null;
  placeholder: string | null;
  /** Minor units (kobo). Null when nothing is purchasable. */
  fromPriceMinor: number | null;
  currency: string;
  isSoldOut: boolean;
}

export interface ArtworkVariant {
  id: string;
  kind: VariantKind;
  sku: string;
  label: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  editionSize: number | null;
  editionsSold: number;
  requiresShipping: boolean;
  licenceType: LicenceType | null;
  isAvailable: boolean;
}

export interface ArtworkMedia {
  id: string;
  type: MediaType;
  storageKey: string;
  altText: string;
  placeholder: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ArtworkDetail {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  description: string | null;
  medium: string | null;
  category: string | null;
  year: number | null;
  provenance: string | null;
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  tags: string[];
  media: ArtworkMedia[];
  variants: ArtworkVariant[];
}

export interface ArtistSummary {
  id: string;
  slug: string;
  name: string;
  countryCode: string | null;
  portraitUrl: string | null;
  artworkCount: number;
}

export interface ArtistDetail {
  id: string;
  slug: string;
  name: string;
  biography: string | null;
  countryCode: string | null;
  portraitUrl: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  artworks: ArtworkSummary[];
}

export interface ExhibitionSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroMediaStorageKey: string | null;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  artworkCount: number;
}

export interface ExhibitionDetail extends Omit<ExhibitionSummary, "artworkCount"> {
  artworks: ArtworkSummary[];
}
