import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KINTRA — Causal Brand Decision Engine",
    template: "%s | KINTRA",
  },
  description: "Autonomous causal brand intelligence engine. Transform unshaped ideas into verifiable, contradiction-free brand systems backed by market evidence and causal DAGs.",
  keywords: [
    "brand strategy",
    "causal decision graph",
    "brand positioning",
    "creative identity",
    "consistency guardian",
    "scenario lab",
    "launch kit",
  ],
  authors: [{ name: "Kintra Intelligence" }],
  openGraph: {
    title: "KINTRA — Causal Brand Decision Engine",
    description: "Transform unshaped ideas into verifiable, contradiction-free brand systems backed by market evidence and causal DAGs.",
    type: "website",
    locale: "en_US",
    siteName: "KINTRA",
  },
  twitter: {
    card: "summary_large_image",
    title: "KINTRA — Causal Brand Decision Engine",
    description: "Transform unshaped ideas into verifiable, contradiction-free brand systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-obsidian-950 text-zinc-100 min-h-screen selection:bg-champagne-500/20 selection:text-champagne-300`}
      >
        {children}
      </body>
    </html>
  );
}
