import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

// Editorial serif for the art, grotesque for the interface (design-system §2).
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Artessa — Contemporary Art Gallery",
    template: "%s · Artessa",
  },
  description:
    "A curated gallery of contemporary art. Originals, limited prints, and digital works.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Artessa" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
  // The 3D surfaces need the full viewport, including behind the notch.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
