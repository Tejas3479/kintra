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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "KINTRA — Causal Brand Decision Engine",
    description: "Transform unshaped ideas into verifiable, contradiction-free brand systems backed by market evidence and causal DAGs.",
    type: "website",
    locale: "en_US",
    siteName: "KINTRA",
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'KINTRA Monolith Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KINTRA — Causal Brand Decision Engine",
    description: "Transform unshaped ideas into verifiable, contradiction-free brand systems.",
    images: ['/og-image.png'],
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
        <div className="universe-texture-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
