import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwitchAccountButton } from "@/components/auth/SwitchAccountButton";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let homeHref = "/";
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (role?.role === "admin") homeHref = "/admin";
  if (role?.role === "student") homeHref = "/student";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <Link href="/" className="mx-auto inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-left">
              <span className="block text-lg font-bold tracking-tight">AlmaGo</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Accès sécurisé
              </span>
            </span>
          </Link>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
            Autorisation requise
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Cet espace n’est pas accessible avec votre compte.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            Votre compte est connecté, mais il ne permet pas d’ouvrir cette zone.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
            >
              Retour à mon espace
            </Link>
            <SwitchAccountButton />
          </div>
        </section>
      </div>
    </main>
  );
}
