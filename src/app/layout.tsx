import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Noto_Kufi_Arabic, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { PartnerPrelaunchBanner } from "@/components/prelaunch/PartnerPrelaunchBanner";
import { getNativeCopy } from "@/content/native-copy";
import { BRAND_NAME, brandText, rebrandCopy } from "@/lib/brand";
import {
  LOCALE_COOKIE,
  localeDirection,
  localeOpenGraph,
  normalizeLocale,
} from "@/lib/i18n";
import { isPartnerPrelaunchModeEnabled } from "@/lib/prelaunch";
import { isPublicIndexingEnabled } from "@/lib/public-indexing";
import { getPublicOrigin } from "@/lib/public-origin";
import "./globals.css";
import "./design-system.css";
import "./student-v3.css";
import "./admin-v3.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});
const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-display",
  display: "swap",
  preload: false,
});

async function requestLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const [locale, publicOrigin] = await Promise.all([requestLocale(), getPublicOrigin()]);
  const { metadata } = getNativeCopy(locale);
  const indexingEnabled = isPublicIndexingEnabled();
  const homeUrl = new URL("/", publicOrigin).toString();
  const socialImageUrl = new URL("/opengraph-image", publicOrigin).toString();

  return {
    metadataBase: publicOrigin,
    title: {
      default: brandText(metadata.title),
      template: `%s | ${BRAND_NAME}`,
    },
    description: brandText(metadata.description),
    applicationName: BRAND_NAME,
    keywords: metadata.keywords.map(brandText),
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
    },
    alternates: {
      canonical: homeUrl,
    },
    openGraph: {
      type: "website",
      url: homeUrl,
      locale: localeOpenGraph(locale),
      siteName: BRAND_NAME,
      title: brandText(metadata.title),
      description: brandText(metadata.description),
      images: [{ url: socialImageUrl, width: 1200, height: 630, alt: BRAND_NAME }],
    },
    icons: {
      icon: [{ url: "/brand/campus-allemagne-favicon-v4.svg?v=4", type: "image/svg+xml", sizes: "any" }],
      shortcut: ["/brand/campus-allemagne-favicon-v4.svg?v=4"],
    },
    twitter: {
      card: "summary_large_image",
      title: brandText(metadata.title),
      description: brandText(metadata.description),
      images: [socialImageUrl],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();
  const copy = rebrandCopy(getNativeCopy(locale));
  const partnerPrelaunch = isPartnerPrelaunchModeEnabled();

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${inter.variable} ${notoSansArabic.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LocaleProvider initialLocale={locale} initialCopy={copy}>
          <PartnerPrelaunchBanner enabled={partnerPrelaunch} />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
