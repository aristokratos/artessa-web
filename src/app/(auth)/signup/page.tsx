import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create an account",
  // A sign-in page has no business in search results.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-[1400px] items-center px-5 py-16 sm:px-8">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
