import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The single place a number becomes a currency string.
 *
 * The API speaks minor units end to end (PRD §6.3) — ₦450,000 travels as
 * 45_000_000 kobo. Formatting anywhere else risks a component dividing by 100
 * twice, which is the kind of bug that ships.
 */
export function formatPrice(minor: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
