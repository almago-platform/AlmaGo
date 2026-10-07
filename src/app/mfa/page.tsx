import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMfaChallenge } from "@/components/auth/AdminMfaChallenge";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getAdminUser } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vérification administrateur",
  robots: { index: false, follow: false },
};

export default async function AdminMfaPage() {
  const { user, hasAdminRole, isAdmin } = await getAdminUser();

  if (!user) redirect("/login");
  if (!hasAdminRole) redirect("/unauthorized");
  if (isAdmin) redirect("/admin");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f1ece4_100%)] px-4 py-10 text-[var(--foreground)] sm:px-6">
      <section className="pc-panel mx-auto w-full max-w-xl rounded-[1rem] p-6 sm:p-8">
        <BrandLogo className="h-auto w-44" />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
          Sécurité administrateur
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Vérification en deux étapes
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          L’accès au cockpit AlmaGo exige un code temporaire provenant de votre
          application d’authentification.
        </p>
        <AdminMfaChallenge />
      </section>
    </main>
  );
}
