"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export type VariantKind = "OriginalPhysical" | "PrintPhysical" | "DigitalLicence";

export interface VariantInput {
  kind: VariantKind;
  label?: string;
  /** MAJOR units — naira, as typed into the form. The API converts to kobo. */
  price: number;
  stockQuantity?: number;
  editionSize?: number;
}

export interface CreateArtworkRequest {
  title: string;
  artistId?: string;
  newArtistName?: string;
  description?: string;
  medium?: string;
  category?: string;
  year?: number;
  widthCm?: number;
  heightCm?: number;
  provenance?: string;
  variants: VariantInput[];
  publish: boolean;
}

export interface AdminArtwork {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  status: "Draft" | "Published" | "Archived";
  variantCount: number;
  mediaCount: number;
  hasPrimaryImage: boolean;
  primaryImageUrl: string | null;
  publishedAtUtc: string | null;
  createdAtUtc: string;
}

export class AdminApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AdminApiError";
  }
}

async function call<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new AdminApiError(
      body?.detail ?? body?.title ?? "Something went wrong.",
      response.status,
    );
  }

  return body as T;
}

export const adminApi = {
  list: (token: string) => call<AdminArtwork[]>("/api/admin/artworks", token),

  create: (token: string, request: CreateArtworkRequest) =>
    call<AdminArtwork>("/api/admin/artworks", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }),

  /**
   * Multipart, not JSON+base64: base64 inflates the payload by a third and
   * buffers the file twice. Content-Type is deliberately NOT set — the browser
   * has to add its own multipart boundary.
   */
  uploadImage: async (token: string, artworkId: string, file: File, altText: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("altText", altText);

    return call<{ id: string; url: string; altText: string; isPrimary: boolean }>(
      `/api/admin/artworks/${artworkId}/images`,
      token,
      { method: "POST", body: form },
    );
  },

  publish: (token: string, id: string) =>
    call<void>(`/api/admin/artworks/${id}/publish`, token, { method: "POST" }),

  unpublish: (token: string, id: string) =>
    call<void>(`/api/admin/artworks/${id}/unpublish`, token, { method: "POST" }),

  archive: (token: string, id: string) =>
    call<void>(`/api/admin/artworks/${id}`, token, { method: "DELETE" }),
};
