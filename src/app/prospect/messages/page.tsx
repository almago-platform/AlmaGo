import { redirect } from "next/navigation";
import { DossierMessageThread, type DossierMessageItem } from "@/components/product/DossierMessageThread";
import { Badge } from "@/components/ui/Badge";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { getProvisionalIdentity } from "@/lib/prospect/provisional-auth";

export const dynamic = "force-dynamic";

const copy = {
  fr: {
    eyebrow: "Communication dossier",
    title: "Messages avec Campus Allemagne",
    description: "Posez vos questions à l’équipe et envoyez, si nécessaire, un document ou une image directement dans ce fil.",
    note: "Les pièces jointes envoyées ici restent des éléments de conversation. Elles ne remplacent pas automatiquement les documents demandés dans « Mes documents ».",
  },
  ar: {
    eyebrow: "التواصل حول الملف",
    title: "الرسائل مع Campus Allemagne",
    description: "يمكنك طرح أسئلتك على الفريق وإرسال وثيقة أو صورة مباشرة داخل هذه المحادثة عند الحاجة.",
    note: "المرفقات المرسلة هنا تبقى ضمن المحادثة ولا تُعتبر تلقائيًا بديلاً عن الوثائق المطلوبة في قسم «مستنداتي».",
  },
  en: {
    eyebrow: "Dossier communication",
    title: "Messages with Campus Allemagne",
    description: "Ask the team questions and, when needed, send a document or image directly in this conversation.",
    note: "Attachments sent here remain conversation items. They do not automatically replace documents requested in “My documents”.",
  },
  de: {
    eyebrow: "Dossier-Kommunikation",
    title: "Nachrichten mit Campus Allemagne",
    description: "Stellen Sie dem Team Fragen und senden Sie bei Bedarf ein Dokument oder Bild direkt in diesem Chat.",
    note: "Anhänge in diesem Chat bleiben Kommunikationsinhalte und ersetzen nicht automatisch angeforderte Unterlagen unter „Meine Dokumente“.",
  },
} as const;

export default async function ProspectMessagesPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  const provisional = !access.user ? await getProvisionalIdentity() : null;
  if (!access.user && !provisional) redirect("/login");
  if (access.user && !access.isStudent) redirect("/unauthorized");
  if (access.user && (!access.phase2Enabled || access.canUseClientFeatures)) redirect("/student/messages");

  const t = copy[locale];
  // Pending identities are not Supabase-authenticated principals. Do not
  // expose any other student's message thread through a privileged client.
  const { data, error } = provisional
    ? { data: [] as DossierMessageItem[], error: null }
    : await access.supabase
        .from("student_dossier_messages")
        .select("id,sender_role,body,student_read_at,admin_read_at,created_at,attachment_name,attachment_mime_type,attachment_size_bytes")
        .eq("student_id", access.user!.id)
        .order("created_at", { ascending: true })
        .limit(200);

  const messages = (data || []) as DossierMessageItem[];
  const unread = messages.filter((item) =>
    item.sender_role === "admin" && !item.student_read_at
  ).length;

  return (
    <main className="space-y-6">
      <header className="rounded-[var(--radius-panel)] bg-[#17191b] px-5 py-6 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">{t.eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{t.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">{t.description}</p>
          </div>
          <Badge variant={unread ? "warning" : "success"}>
            {unread ? unread + " non lu" + (unread > 1 ? "s" : "") : "À jour"}
          </Badge>
        </div>
      </header>

      {error ? (
        <section className="rounded-[var(--radius-panel)] border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-900">Messages temporairement indisponibles</p>
          <p className="mt-1 text-sm text-red-800">Aucun message n’a été modifié.</p>
        </section>
      ) : (
        <DossierMessageThread
          messages={messages}
          endpoint="/api/prospect/messages"
          viewerRole="student"
          allowCompose={!provisional}
          title={t.title}
          description={t.description}
        />
      )}

      <p className="text-xs leading-5 text-[var(--muted)]">{t.note}</p>
    </main>
  );
}
