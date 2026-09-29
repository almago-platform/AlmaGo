import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Noto_Kufi_Arabic, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getNativeCopy } from "@/content/native-copy";
import { BRAND_NAME, brandText } from "@/lib/brand";
import {
  LOCALE_COOKIE,
  localeDirection,
  localeOpenGraph,
  normalizeLocale,
} from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });
const notoKufiArabic = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-arabic-display", display: "swap" });

async function requestLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const { metadata } = getNativeCopy(locale);

  return {
    title: {
      default: brandText(metadata.title),
      template: `%s | ${BRAND_NAME}`,
    },
    description: brandText(metadata.description),
    applicationName: BRAND_NAME,
    keywords: metadata.keywords.map(brandText),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph(locale),
      siteName: BRAND_NAME,
      title: brandText(metadata.title),
      description: brandText(metadata.description),
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: BRAND_NAME }],
    },
    icons: {
      icon: [{ url: "/brand/campus-allemagne-symbol-approved.webp", type: "image/webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title: brandText(metadata.title),
      description: brandText(metadata.description),
      images: ["/opengraph-image"],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${inter.variable} ${notoSansArabic.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
