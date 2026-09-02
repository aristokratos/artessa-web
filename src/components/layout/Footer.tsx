import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--color-hairline)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="font-[family-name:var(--font-display)] text-lg">Artessa</div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">
            Contemporary art from across the continent. Originals, limited prints,
            and digital works.
          </p>
        </div>

        <div className="flex gap-14 text-sm">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
              Browse
            </span>
            <Link href="/gallery" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Gallery</Link>
            <Link href="/exhibitions" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Exhibitions</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
              Account
            </span>
            <Link href="/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Sign in</Link>
            <Link href="/account/orders" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Orders</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-hairline)] px-5 py-6 text-center text-xs text-[var(--color-text-subtle)] sm:px-8">
        © {new Date().getFullYear()} Artessa. Payments by Paystack.
      </div>
    </footer>
  );
}
