import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: "Artessa is a curated gallery of contemporary art from across the continent.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[760px] px-5 py-20 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        About Artessa
      </h1>

      <div className="mt-8 flex flex-col gap-6 leading-relaxed text-[var(--color-text-muted)]">
        <p>
          Artessa is a curated gallery of contemporary art from across the
          continent. Every work is catalogued, authenticated, and shipped by us.
        </p>
        <p>
          A piece may be offered three ways: as a physical original — one of one,
          shipped insured and tracked; as a limited edition print; or as a
          licensed digital file. What you are buying is always stated before you
          pay, along with what arrives and how.
        </p>
        <p>
          Browsing needs no account. One is only required when you are ready to
          buy, so that we can hold the work for you and get it to the right
          address.
        </p>
        <p className="text-[var(--color-text-subtle)]">
          Images shown in the gallery are watermarked and reduced in size. The
          full-resolution file is released only on purchase.
        </p>
      </div>

      <Button href="/gallery" className="mt-10">Enter the gallery</Button>
    </main>
  );
}
