import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlmaGo",
  description: "Accompagnement transparent vers les études en Allemagne",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
