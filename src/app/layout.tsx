import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { RuntimeBanner } from "@/components/RuntimeBanner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// Self-hosted (latin, variable) so the production build never depends on fonts.googleapis.com.
const inter = localFont({ src: "./fonts/inter-latin.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
const fraunces = localFont({ src: "./fonts/fraunces-latin.woff2", variable: "--font-fraunces", weight: "100 900", display: "swap" });
const jetbrains = localFont({ src: "./fonts/jetbrains-mono-latin.woff2", variable: "--font-jetbrains", weight: "100 800", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Raksha. the real-time scam-call shield", template: "%s · Raksha" },
  description:
    "A second listener for scam calls. Explore the guided demo or connect your own Moss project for live semantic retrieval.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://raksha-app.web.app"),
  openGraph: {
    title: "Raksha. the real-time scam-call shield",
    description: "Recognise pressure, pause and bring in someone you trust. Test live retrieval with your own Moss project.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#06080f", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <RuntimeBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
