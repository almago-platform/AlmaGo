import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminInboxPanel, type AdminInboxItem } from "@/components/admin/AdminInboxPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { getAdminUser } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const { supabase, user, isAdmin } = await getAdminUser();

  if (!user || !isAdmin) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminLoadError
          title="Boîte de réception indisponible"
          description="Votre session administrateur n’a pas pu être confirmée."
          retryHref="/admin"
        />
      </main>
    );
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,title,body,metadata,read_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminPageHeader
          section="Pilotage"
          title="Boîte de réception"
          description="Les événements opérationnels qui demandent votre attention."
        />
        <AdminLoadError
          title="Impossible de charger la boîte de réception"
          description="Aucune notification n’a été modifiée."
          retryHref="/admin/inbox"
        />
      </main>
    );
  }

  const notifications = (data || []) as AdminInboxItem[];
  const unread = notifications.filter((item) => !item.read_at).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
      <AdminPageHeader
        section="Pilotage"
        title="Boîte de réception"
        description="Réponses étudiantes, validations de paiement et autres événements d’équipe à traiter."
      />

      <AdminInboxPanel items={notifications} unreadCount={unread} />
    </main>
  );
}
