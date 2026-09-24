import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Mon profil" title="Votre profil étudiant" />
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

  const requiredProfileKeys = [
    "first_name",
    "last_name",
    "nationality",
    "target_degree",
    "target_field",
    "study_language",
    "target_intake",
  ] as const;
  const completedRequiredFields = requiredProfileKeys.filter((key) => {
    const value = profile[key];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
  const profileCompletion = Math.round((completedRequiredFields / requiredProfileKeys.length) * 100);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Mon profil"
        title="Informations du dossier"
        description="Gardez vos informations personnelles, votre parcours, vos langues et votre projet d’études à jour pour que votre dossier reste cohérent et facile à suivre."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(15rem,0.35fr)_minmax(0,1fr)] lg:gap-6">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Repères du profil">
          <Card className="border-[var(--brand-border)] bg-white shadow-[0_20px_45px_-34px_rgba(41,48,139,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant={profileCompletion === 100 ? "success" : "info"}>Profil étudiant</Badge>
              <span className="text-sm font-bold text-[var(--brand)]">{profileCompletion}%</span>
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-[-0.02em] text-slate-950">Profil complété</h2>
            <div className="mt-4">
              <ProgressBar value={profileCompletion} label="Champs requis du profil complétés" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Ce pourcentage utilise uniquement les {requiredProfileKeys.length} champs marqués comme requis dans ce formulaire. Ce n’est pas un indicateur d’admission.
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Pourquoi ces informations ?</p>
            <h2 className="mt-3 text-lg font-bold text-slate-950">Un dossier plus cohérent</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ces données permettent à AlmaGo d’organiser votre dossier et de présenter des pistes cohérentes avec les informations enregistrées.
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">À vérifier</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Si une ancienne valeur apparaît avec “à mettre à jour”, choisissez une valeur proposée avant d’enregistrer.
            </p>
          </Card>
        </aside>

        <Card as="div" className="overflow-hidden border-[var(--border)] bg-white shadow-none">
          <ProfileForm profile={profile} />
        </Card>
      </div>
    </main>
  );
}
