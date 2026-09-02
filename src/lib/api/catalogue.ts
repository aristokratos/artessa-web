import "server-only";
import { api } from "./client";
import type {
  ArtistDetail,
  ArtistSummary,
  ArtworkDetail,
  ArtworkSort,
  ArtworkSummary,
  AvailabilityFilter,
  ExhibitionDetail,
  ExhibitionSummary,
  PagedResult,
  VariantKind,
} from "@/types/catalogue";

export interface ArtworkSearchParams {
  q?: string;
  artistSlug?: string;
  category?: string;
  kind?: VariantKind;
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityFilter;
  sort?: ArtworkSort;
  page?: number;
  pageSize?: number;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

const EMPTY: PagedResult<ArtworkSummary> = {
  items: [],
  page: 1,
  pageSize: 0,
  totalCount: 0,
  totalPages: 0,
  hasMore: false,
};

export async function searchArtworks(
  params: ArtworkSearchParams = {},
): Promise<PagedResult<ArtworkSummary>> {
  const result = await api.request<PagedResult<ArtworkSummary>>(
    `/api/artworks${query({ ...params })}`,
  );
  return result ?? EMPTY;
}

export async function getArtwork(slug: string): Promise<ArtworkDetail | null> {
  return api.request<ArtworkDetail>(`/api/artworks/${encodeURIComponent(slug)}`);
}

export async function getCategories(): Promise<string[]> {
  return (await api.request<string[]>("/api/artworks/categories")) ?? [];
}

export async function getArtists(): Promise<ArtistSummary[]> {
  return (await api.request<ArtistSummary[]>("/api/artists")) ?? [];
}

export async function getArtist(slug: string): Promise<ArtistDetail | null> {
  return api.request<ArtistDetail>(`/api/artists/${encodeURIComponent(slug)}`);
}

export async function getExhibitions(): Promise<ExhibitionSummary[]> {
  return (await api.request<ExhibitionSummary[]>("/api/exhibitions")) ?? [];
}

export async function getExhibition(slug: string): Promise<ExhibitionDetail | null> {
  return api.request<ExhibitionDetail>(`/api/exhibitions/${encodeURIComponent(slug)}`);
}
