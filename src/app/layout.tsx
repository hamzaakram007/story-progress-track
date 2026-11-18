import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const SITE = "https://story-progress-track.vercel.app";

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Harbor Check — spoiler-safe progress tracker",
    template: "%s · Harbor Check",
  },
  description:
    "Installable PWA for spoiler-safe story and collectible checklists. Local-first progress, masked reveal tiers, category overview, JSON backup. Placeholder labels only — no real spoilers.",
  applicationName: "Harbor Check",
  authors: [{ name: "Harbor Check" }],
  creator: "Harbor Check",
  keywords: [
    "spoiler-safe checklist",
    "story progress tracker",
    "collectibles tracker",
    "PWA",
    "Harbor Check",
    "local-first",
  ],
  category: "utilities",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Harbor Check",
    title: "Harbor Check — spoiler-safe progress tracker",
    description:
      "Local-first checklist PWA with spoiler masking, six placeholder categories, install prompt, and a clearly labeled Pro stub.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harbor Check — spoiler-safe progress tracker",
    description:
      "Track placeholder story slots without leaking spoilers. Installable, localStorage-backed, Pro stub only.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Harbor Check",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#061018" },
    { media: "(prefers-color-scheme: light)", color: "#061018" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Harbor Check",
  url: SITE,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description:
    "Spoiler-safe story progress tracker PWA with local checklists and masked reveal tiers.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free local mode. Pro sync/PDF is a non-charging stub.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
