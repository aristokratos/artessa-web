"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthProvider";
import { adminApi, AdminApiError, type AdminArtwork, type VariantInput } from "@/lib/api/admin";
import { cn, formatPrice } from "@/lib/utils";

/**
 * The curator's studio: upload a work, price it, publish it.
 *
 * Client-rendered because every call is authenticated with the in-memory access
 * token, which by design does not exist on the server. The API is role-gated
 * independently (ADM-08) — this page hiding itself is convenience, not security.
 */
export default function StudioPage() {
  const { user, loading, getAccessToken } = useAuth();

  const [artworks, setArtworks] = useState<AdminArtwork[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [medium, setMedium] = useState("");
  const [category, setCategory] = useState("Abstract");
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [description, setDescription] = useState("");

  const [originalPrice, setOriginalPrice] = useState("");
  const [printPrice, setPrintPrice] = useState("");
  const [printEdition, setPrintEdition] = useState("25");

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const isCurator = user?.role === "Curator" || user?.role === "Admin";

  const refresh = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    try {
      setArtworks(await adminApi.list(token));
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not load the catalogue.");
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (isCurator) void refresh();
  }, [isCurator, refresh]);

  if (loading) {
    return <Shell><p className="text-[var(--color-text-subtle)]">Checking your account…</p></Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <p className="text-[var(--color-text-muted)]">You need to sign in to reach the studio.</p>
        <Button href="/login?returnUrl=%2Fadmin%2Fartworks" className="mt-6">Sign in</Button>
      </Shell>
    );
  }

  if (!isCurator) {
    return (
      <Shell>
        <p className="text-[var(--color-text-muted)]">
          The Studio is reserved for the Artessa curatorial team.
        </p>
        <Button href="/gallery" className="mt-6">Return to the gallery</Button>
      </Shell>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!file) {
      setError("Choose an image — a work cannot be published without one.");
      return;
    }

    const variants: VariantInput[] = [];
    if (originalPrice.trim()) {
      variants.push({ kind: "OriginalPhysical", label: "Original", price: Number(originalPrice) });
    }
    if (printPrice.trim()) {
      variants.push({
        kind: "PrintPhysical",
        label: "A2 archival print",
        price: Number(printPrice),
        editionSize: Number(printEdition) || undefined,
        stockQuantity: Number(printEdition) || undefined,
      });
    }

    if (variants.length === 0) {
      setError("Give the work at least one price.");
      return;
    }

    setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new AdminApiError("Your session expired. Sign in again.", 401);

      const created = await adminApi.create(token, {
        title: title.trim(),
        newArtistName: artistName.trim(),
        description: description.trim() || undefined,
        medium: medium.trim() || undefined,
        category: category.trim() || undefined,
        year: Number(year) || undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        variants,
        publish: false,
      });

      // Upload before publishing: the API refuses to publish a work with no
      // image, so this order is the one that succeeds.
      await adminApi.uploadImage(token, created.id, file, altText.trim() || title.trim());
      await adminApi.publish(token, created.id);

      setNotice(`“${created.title}” is live in the gallery.`);
      setTitle(""); setArtistName(""); setMedium(""); setDescription("");
      setOriginalPrice(""); setPrintPrice(""); setWidthCm(""); setHeightCm("");
      setFile(null); setAltText("");
      if (fileInput.current) fileInput.current.value = "";

      await refresh();
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <p className="max-w-lg text-[var(--color-text-muted)]">
        Upload a work, price it, and it appears in the gallery. The image is
        watermarked and size-capped for display; the original you upload is kept
        private and is what a buyer receives.
      </p>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Title" value={title} onChange={setTitle} required />
          <Field label="Artist" value={artistName} onChange={setArtistName} required
            hint="A new name creates the artist; an existing one is reused." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Medium" value={medium} onChange={setMedium} placeholder="Oil on canvas" />
            <Field label="Category" value={category} onChange={setCategory} placeholder="Abstract" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Year" value={year} onChange={setYear} type="number" />
            <Field label="Width cm" value={widthCm} onChange={setWidthCm} type="number" />
            <Field label="Height cm" value={heightCm} onChange={setHeightCm} type="number" />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-light)] focus:outline-none"
            />
          </label>

          <fieldset className="mt-2 rounded-sm border border-[var(--color-hairline)] p-4">
            <legend className="px-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
              Pricing — naira
            </legend>
            <Field label="Original (one of one)" value={originalPrice} onChange={setOriginalPrice}
              type="number" placeholder="450000" />
            <div className="mt-4 grid grid-cols-[1fr_110px] gap-3">
              <Field label="A2 print" value={printPrice} onChange={setPrintPrice}
                type="number" placeholder="25000" />
              <Field label="Edition" value={printEdition} onChange={setPrintEdition} type="number" />
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-subtle)]">
              Leave a price blank to skip that option. At least one is required.
            </p>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Image</span>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-2 text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-[var(--color-light)] file:px-4 file:py-2 file:text-[#1a1206]"
            />
            <span className="text-xs text-[var(--color-text-subtle)]">
              JPEG, PNG, WebP or AVIF, up to 15 MB. Upload the highest resolution
              you have — it is what the buyer gets.
            </span>
          </label>

          <Field
            label="Image description"
            value={altText}
            onChange={setAltText}
            hint="Required for screen readers. Defaults to the title if left blank."
          />

          {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
          {notice && <p role="status" className="text-sm text-[var(--color-success)]">{notice}</p>}

          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {busy ? "Uploading…" : "Publish to the gallery"}
          </Button>
        </form>

        <section>
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
            In the catalogue ({artworks.length})
          </h2>

          {artworks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-subtle)]">Nothing uploaded yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-hairline)]">
              {artworks.map((a) => (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[var(--color-surface)]">
                    {a.primaryImageUrl && (
                      // Plain <img>: these are admin thumbnails on an
                      // authenticated page, not worth next/image's machinery.
                      <img src={a.primaryImageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/artwork/${a.slug}`} className="block truncate text-sm hover:text-[var(--color-light)]">
                      {a.title}
                    </Link>
                    <span className="text-xs text-[var(--color-text-subtle)]">
                      {a.artistName} · {a.variantCount} option{a.variantCount === 1 ? "" : "s"} · {a.mediaCount} image{a.mediaCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <Badge tone={a.status === "Published" ? "accent" : "muted"}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        Studio
      </h1>
      <div className="mt-4">{children}</div>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)]",
          "px-4 text-[var(--color-text)] transition-colors",
          "focus:border-[var(--color-light)] focus:outline-none",
        )}
      />
      {hint && <span className="text-xs text-[var(--color-text-subtle)]">{hint}</span>}
    </label>
  );
}
