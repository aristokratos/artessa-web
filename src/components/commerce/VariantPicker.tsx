"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import { cn, formatPrice } from "@/lib/utils";
import type { ArtworkVariant } from "@/types/catalogue";

const KIND_LABEL: Record<ArtworkVariant["kind"], string> = {
  OriginalPhysical: "One of one",
  PrintPhysical: "Limited edition",
  DigitalLicence: "Digital",
};

const LICENCE_LABEL: Record<NonNullable<ArtworkVariant["licenceType"]>, string> = {
  PersonalUse: "Personal use licence",
  Commercial: "Commercial licence",
  ExtendedCommercial: "Extended commercial licence",
};

/**
 * Lets the buyer choose what they are actually buying (ART-02).
 *
 * This is the variant model made visible (PRD §6.2): the same artwork offers an
 * original, a print run and a digital licence, and they differ in price, stock,
 * whether they ship, and what the buyer receives. Picking one updates all of
 * that in place rather than navigating.
 */
export function VariantPicker({ variants }: { variants: ArtworkVariant[] }) {
  const firstAvailable = variants.findIndex((v) => v.isAvailable);
  const [selected, setSelected] = useState(firstAvailable === -1 ? 0 : firstAvailable);

  const variant = variants[selected];
  if (!variant) return null;

  const remaining =
    variant.editionSize !== null ? variant.editionSize - variant.editionsSold : null;

  return (
    <div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Purchase options">
        {variants.map((v, i) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={selected === i}
            disabled={!v.isAvailable}
            onClick={() => setSelected(i)}
            className={cn(
              "flex items-center justify-between gap-4 rounded-sm border px-4 py-4 text-left transition-colors",
              selected === i
                ? "border-[var(--color-light)] bg-[var(--color-light)]/8"
                : "border-[var(--color-hairline)] hover:border-[var(--color-text-subtle)]",
              !v.isAvailable && "cursor-not-allowed opacity-45",
            )}
          >
            <span className="min-w-0">
              <span className="block text-sm text-[var(--color-text)]">
                {v.label ?? KIND_LABEL[v.kind]}
              </span>
              <span className="mt-1 block text-xs text-[var(--color-text-subtle)]">
                {KIND_LABEL[v.kind]}
                {v.editionSize ? ` · edition of ${v.editionSize}` : ""}
                {v.requiresShipping ? " · ships" : " · instant download"}
              </span>
            </span>
            <span className="shrink-0 text-sm">
              {v.isAvailable ? formatPrice(v.priceMinor, v.currency) : "Sold"}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 border-t border-[var(--color-hairline)] pt-7">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-[family-name:var(--font-display)] text-3xl">
            {variant.isAvailable ? formatPrice(variant.priceMinor, variant.currency) : "Sold"}
          </span>
          {remaining !== null && remaining > 0 && (
            <Badge tone="accent">
              {remaining} of {variant.editionSize} left
            </Badge>
          )}
        </div>

        {variant.licenceType && (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {LICENCE_LABEL[variant.licenceType]}. Full terms are shown before payment.
          </p>
        )}

        <AddToCartButton variant={variant} />

        <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-subtle)]">
          {variant.requiresShipping
            ? "Ships insured and tracked. Shipping is calculated at checkout."
            : "Delivered as a secure download link immediately after payment."}
        </p>
      </div>
    </div>
  );
}
