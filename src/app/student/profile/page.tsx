import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader badge="Mon profil" title="Informations du dossier" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-semibold text-slate-950">Profil temporairement indisponible</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Impossible de charger votre profil pour le moment. Aucune modification n’a été effectuée. Vous pouvez relancer le chargement ou revenir à votre dossier.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/student/profile">Réessayer</ButtonLink>
            <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Mon profil"
        title="Informations du dossier"
        description="Mettez à jour les données utilisées pour comprendre votre parcours et préparer des recommandations cohérentes."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(15rem,0.35fr)_minmax(0,1fr)] lg:gap-6">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Repères du profil">
          <Card>
            <Badge variant="success">Profil étudiant</Badge>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">Données à vérifier</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les champs marqués d’un astérisque sont nécessaires pour garder le dossier exploitable par AlmaGo.
            </p>
          </Card>
          <Card className="shadow-none">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Conseil</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Si une ancienne valeur apparaît avec “à mettre à jour”, choisissez une valeur proposée avant d’enregistrer.
            </p>
          </Card>
        </aside>

        <Card as="div">
          <ProfileForm profile={profile} />
        </Card>
      </div>
    </main>
  );
}
