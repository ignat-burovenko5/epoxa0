import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import SeoJsonLd from "@/components/SeoJsonLd";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0C0C0C" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0C" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  title: {
    default: `${siteConfig.name} — антикварная мебель на продажу, купить`,
    template: `%s | ${siteConfig.name}`,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.png", sizes: "512x512" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${inter.variable} antialiased h-full`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <SeoJsonLd />
      </head>
      <body className="min-h-full min-h-[100dvh] flex flex-col selection:bg-accent-brass selection:text-luxury-base">
        {/* analytics: Yandex.Metrika counter ID — подключить при деплое */}
        <SiteHeader />
        <div className="site-main relative z-0 flex-1 min-h-0 min-w-0 w-full pt-[var(--site-header-offset)]">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
