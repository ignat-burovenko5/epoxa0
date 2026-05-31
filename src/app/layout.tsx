import type { Metadata } from "next";
import { connection } from "next/server";
import { Cormorant_Garamond, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — антикварная мебель и предметы интерьера`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "антикварная мебель",
    "винтажная мебель",
    "антиквариат Москва",
    "редкая мебель",
    "люстра Baccarat",
    "комод Louis XVI",
    "доставка антиквариата по России",
  ],
  openGraph: {
    locale: "ru_RU",
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — антикварная галерея`,
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${inter.variable} antialiased h-full`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col selection:bg-accent-brass selection:text-luxury-base">
        {/* analytics: Yandex.Metrika counter ID — подключить при деплое */}
        <SiteHeader />
        <div className="flex-1 pt-[var(--site-header-offset)]">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
