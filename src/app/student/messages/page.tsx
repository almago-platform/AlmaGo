import { redirect } from "next/navigation";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { DossierMessageThread, type DossierMessageItem } from "@/components/product/DossierMessageThread";
import { Badge } from "@/components/ui/Badge";
import { getRequestLocale } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const copy = {
  fr: {
    eyebrow: "Communication dossier",
    title: "Messages avec Campus Allemagne",
    description: "Retrouvez ici les messages visibles liés à votre dossier, répondez directement à votre conseiller et joignez un document ou une image si nécessaire.",
    note: "Les pièces jointes envoyées ici restent des éléments de conversation et ne remplacent pas automatiquement les documents demandés dans « Mes documents ». Les décisions officielles restent communiquées par leurs propres canaux.",
  },
  ar: {
    eyebrow: "التواصل حول الملف",
    title: "الرسائل مع Campus Allemagne",
    description: "ستجد هنا الرسائل المرتبطة بملفك ويمكنك الرد مباشرة على مستشارك.",
    note: "تبقى القرارات الرسمية للجامعات والسفارات والسلطات عبر قنواتها الرسمية الخاصة.",
  },
  en: {
    eyebrow: "Dossier communication",
    title: "Messages with Campus Allemagne",
    description: "See the messages linked to your dossier and reply directly to your adviser.",
    note: "Official decisions from universities, embassies and authorities remain communicated through their own official channels.",
  },
  de: {
    eyebrow: "Dossier-Kommunikation",
    title: "Nachrichten mit Campus Allemagne",
    description: "Hier finden Sie Nachrichten zu Ihrem Dossier und können Ihrem Berater direkt antworten.",
    note: "Offizielle Entscheidungen von Hochschulen, Botschaften und Behörden werden weiterhin über deren eigene offizielle Kanäle mitgeteilt.",
  },
} as const;

export default async function StudentMessagesPage() {
  const locale = await getRequestLocale();
  const t = copy[locale];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("student_dossier_messages")
    .select("id,sender_role,body,student_read_at,admin_read_at,created_at,attachment_name,attachment_mime_type,attachment_size_bytes")
    .eq("student_id", user.id)
    .order("created_at", { ascending: true })
    .limit(200);

  const messages = (data || []) as DossierMessageItem[];
  const unread = messages.filter((item) => item.sender_role === "admin" && !item.student_read_at).length;

  return (
    <StudentPageFrame className="space-y-6">
      <header className="rounded-[var(--radius-panel)] bg-slate-950 px-5 py-6 text-white sm:px-6">
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
          endpoint="/api/student/messages"
          viewerRole="student"
          title={t.title}
          description={t.description}
        />
      )}

      <p className="text-xs leading-5 text-slate-600">{t.note}</p>
    </StudentPageFrame>
  );
}
