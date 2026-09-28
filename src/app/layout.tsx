import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getNativeCopy } from "@/content/native-copy";
import {
  LOCALE_COOKIE,
  localeDirection,
  localeOpenGraph,
  normalizeLocale,
} from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

async function requestLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const { metadata } = getNativeCopy(locale);

  return {
    title: {
      default: metadata.title,
      template: "%s | AlmaGo",
    },
    description: metadata.description,
    applicationName: "AlmaGo",
    keywords: [...metadata.keywords],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph(locale),
      siteName: "AlmaGo",
      title: metadata.title,
      description: metadata.description,
    },
    icons: {
      icon: [{ url: "/brand/almago-symbol.svg", type: "image/svg+xml" }],
    },
    twitter: {
      card: "summary",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
