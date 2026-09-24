import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultPublicLocale } from "@/lib/public-locales";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const publicTitle = "AlmaGo | Études en Allemagne";
const publicDescription =
  "Préparez votre dossier d’études en Allemagne avec AlmaGo : profil, documents, orientation, candidatures et suivi dans un espace structuré.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: publicTitle,
    template: "%s | AlmaGo",
  },
  description: publicDescription,
  applicationName: "AlmaGo",
  keywords: [
    "études en Allemagne",
    "dossier étudiant",
    "orientation universitaire",
    "candidatures Allemagne",
    "AlmaGo",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: defaultPublicLocale.openGraphLocale ?? undefined,
    siteName: "AlmaGo",
    title: publicTitle,
    description: publicDescription,
  },
  twitter: {
    card: "summary",
    title: publicTitle,
    description: publicDescription,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultPublicLocale.htmlLang} dir={defaultPublicLocale.direction} className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
