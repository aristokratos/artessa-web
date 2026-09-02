import Link from "next/link";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/gallery", label: "Gallery" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-hairline)] bg-[var(--color-ink)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight"
        >
          Artessa
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart is visible to everyone; the auth prompt fires on add, not
              here, so browsing never hits a wall (CAT-01, CART-01). */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="grid h-11 w-11 place-items-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3h2l2.4 12.6a2 2 0 0 0 2 1.4h7.7a2 2 0 0 0 2-1.6L21 7H6" />
              <circle cx="10" cy="20" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
