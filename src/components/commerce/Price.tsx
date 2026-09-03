"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080").replace(/\/$/, "");
let cachedRate: number | null = null;
let request: Promise<number | null> | null = null;

function usdNgnRate() {
  if (cachedRate) return Promise.resolve(cachedRate);
  request ??= fetch(`${API}/api/exchange-rates/usd-ngn`)
    .then(response => response.ok ? response.json() : null)
    .then((data: { rate?: number } | null) => {
      cachedRate = data?.rate && data.rate > 0 ? data.rate : null;
      return cachedRate;
    })
    .catch(() => null);
  return request;
}

export function Price({ minor, currency, compact = false }: {
  minor: number;
  currency: string;
  compact?: boolean;
}) {
  const [rate, setRate] = useState<number | null>(cachedRate);
  useEffect(() => {
    if (currency === "USD") void usdNgnRate().then(setRate);
  }, [currency]);

  return <span className="inline-flex flex-col items-end">
    <span>{formatPrice(minor, currency)}</span>
    {currency === "USD" && rate && <span className={`${compact ? "text-[9px]" : "text-xs"} font-normal text-[var(--color-text-subtle)]`}>
      ≈ {formatPrice(Math.round(minor * rate), "NGN")} at today&apos;s rate
    </span>}
  </span>;
}
