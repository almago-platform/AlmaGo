import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Mon profil"
        title="Informations du dossier"
        description="Mettez à jour les données utilisées pour comprendre votre parcours et préparer des recommandations cohérentes."
      />

      <div className="grid gap-6 lg:grid-cols-[0.35fr_1fr]">
        <aside className="space-y-4" aria-label="Repères du profil">
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
