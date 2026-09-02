"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080").replace(/\/$/, "");
let sharedRate: number | null = null;
let pending: Promise<number | null> | null = null;

function getUsdNgnRate() {
  if (sharedRate) return Promise.resolve(sharedRate);
  pending ??= fetch(`${API}/api/exchange-rates/usd-ngn`)
    .then(response => response.ok ? response.json() : null)
    .then((value: { rate?: number } | null) => {
      sharedRate = value?.rate && value.rate > 0 ? value.rate : null;
      return sharedRate;
    })
    .catch(() => null);
  return pending;
}

export function Price({ minor, currency, compact = false }: {
  minor: number;
  currency: string;
  compact?: boolean;
}) {
  const [rate, setRate] = useState<number | null>(sharedRate);
  useEffect(() => { if (currency === "USD") void getUsdNgnRate().then(setRate); }, [currency]);

  return (
    <span className="inline-flex flex-col items-end">
      <span>{formatPrice(minor, currency)}</span>
      {currency === "USD" && rate && (
        <span className={`${compact ? "text-[9px]" : "text-xs"} font-normal text-[var(--color-text-subtle)]`}>
          ≈ {formatPrice(Math.round(minor * rate), "NGN")} at today&apos;s rate
        </span>
      )}
    </span>
  );
}
