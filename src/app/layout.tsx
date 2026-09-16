import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// Self-hosted (latin, variable) so the production build never depends on fonts.googleapis.com.
const inter = localFont({ src: "./fonts/inter-latin.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
const fraunces = localFont({ src: "./fonts/fraunces-latin.woff2", variable: "--font-fraunces", weight: "100 900", display: "swap" });
const jetbrains = localFont({ src: "./fonts/jetbrains-mono-latin.woff2", variable: "--font-jetbrains", weight: "100 800", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Raksha. the real-time scam-call shield", template: "%s · Raksha" },
  description:
    "Every scam follows a script. Raksha listens with you, recognises the script in about 10 milliseconds with Moss, and steps in before you share the OTP.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://raksha-app.web.app"),
  openGraph: {
    title: "Raksha. the real-time scam-call shield",
    description: "Scam-script recognition in about 10 ms during a live call, powered by Moss.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#06080f", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
