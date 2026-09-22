import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";
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
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <PageHeader
        badge="Mon profil"
        title="Tes informations"
        description="Tu peux modifier les informations enregistrées dans ton dossier."
      />
      <Card as="div">
        <ProfileForm profile={profile} />
      </Card>
    </main>
  );
}
