import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

const publicTitle = "AlmaGo | Études en Allemagne";
const publicDescription =
  "Préparez votre dossier d’études en Allemagne avec AlmaGo : profil, documents, orientation, candidatures et suivi dans un espace structuré.";

export const metadata: Metadata = {
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
    locale: "fr_FR",
    siteName: "AlmaGo",
    title: publicTitle,
    description: publicDescription,
  },
  icons: {
    icon: [{ url: "/brand/almago-symbol.svg", type: "image/svg+xml" }],
  },
  twitter: {
    card: "summary",
    title: publicTitle,
    description: publicDescription,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
