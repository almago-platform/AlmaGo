import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentNotificationsPanel } from "@/components/student/StudentNotificationsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,title,body,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Notifications" title="Mes notifications" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Notifications temporairement indisponibles</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les notifications de votre dossier pour le moment. Rien n’a été supprimé ni marqué comme lu.
            </p>
          </div>
          <div className="mt-5">
            <ButtonLink href="/student/notifications">Réessayer</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Notifications"
        title="Mes notifications"
        description="Retrouvez les mises à jour enregistrées pour votre dossier. Cette page ne remplace pas l’historique complet de vos documents et candidatures."
      />
      <StudentNotificationsPanel notifications={data || []} />
    </main>
  );
}
