import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDeadline, isPastDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

type CalendarApplication = {
  id: string;
  status: string;
  deadline: string | null;
  next_action: string | null;
  programs: { name: string; universities: { name: string } | { name: string }[] | null } | { name: string; universities: { name: string } | { name: string }[] | null }[] | null;
};

function programOf(application: CalendarApplication) {
  return Array.isArray(application.programs) ? application.programs[0] : application.programs;
}

function universityOf(application: CalendarApplication) {
  const university = programOf(application)?.universities;
  return Array.isArray(university) ? university[0] : university;
}

function daysUntil(value: string) {
  const target = new Date(`${value}T12:00:00Z`).getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}

export default async function StudentCalendarPage() {
  const locale = await getRequestLocale();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,deadline,next_action,programs(name,universities(name))")
    .not("deadline", "is", null)
    .order("deadline", { ascending: true });

  const applications = (data || []) as CalendarApplication[];
  const upcoming = applications.filter((item) => item.deadline && !isPastDeadline(item.deadline));
  const overdue = applications.filter((item) => item.deadline && isPastDeadline(item.deadline));
  const next = upcoming[0];

  const fr = locale === "fr";
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="applications"
        eyebrow={fr ? "Calendrier" : "التقويم"}
        title={fr ? "Tes échéances importantes" : "مواعيدك المهمة"}
        description={fr ? "Une vue unique pour voir ce qui est urgent, ce qui arrive bientôt et ce qui demande ton attention." : "عرض واحد لمعرفة ما هو عاجل وما يقترب وما يحتاج إلى انتباهك."}
        actions={<ButtonLink href="/student/applications" variant="secondary">{fr ? "Voir mes candidatures" : "عرض ترشحاتي"}</ButtonLink>}
      />

      {error ? (
        <Card>
          <div role="alert">
            <h2 className="text-lg font-semibold text-slate-950">{fr ? "Impossible de charger les échéances" : "تعذر تحميل المواعيد"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{fr ? "Tes candidatures sont conservées. Réessaie dans quelques instants." : "ترشحاتك محفوظة. حاول مرة أخرى بعد قليل."}</p>
          </div>
          <div className="mt-5"><ButtonLink href="/student/calendar">{fr ? "Réessayer" : "إعادة المحاولة"}</ButtonLink></div>
        </Card>
      ) : applications.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <h2 className="text-xl font-semibold text-slate-950">{fr ? "Aucune deadline à suivre pour le moment" : "لا توجد مواعيد للمتابعة حاليًا"}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{fr ? "Quand une candidature aura une échéance confirmée, elle apparaîtra ici automatiquement." : "عندما يصبح لترشح موعد مؤكد سيظهر هنا تلقائيًا."}</p>
          <div className="mt-5"><ButtonLink href="/student/orientation">{fr ? "Explorer les programmes" : "استكشاف البرامج"}</ButtonLink></div>
        </Card>
      ) : (
        <div className="space-y-6">
          <section aria-label={fr ? "Résumé des échéances" : "ملخص المواعيد"} className="grid gap-4 md:grid-cols-3">
            <Summary label={fr ? "Prochaine deadline" : "الموعد التالي"} value={next?.deadline ? formatDeadline(next.deadline, locale) : "—"} detail={next ? programOf(next)?.name || "" : (fr ? "Aucune à venir" : "لا يوجد")} />
            <Summary label={fr ? "À venir" : "قادمة"} value={String(upcoming.length)} detail={fr ? "échéances confirmées" : "مواعيد مؤكدة"} />
            <Summary label={fr ? "Dépassées" : "منتهية"} value={String(overdue.length)} detail={overdue.length ? (fr ? "à vérifier" : "تحتاج إلى مراجعة") : (fr ? "rien à signaler" : "لا شيء")} />
          </section>

          <section aria-labelledby="deadline-list-title">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{fr ? "Vue liste" : "عرض القائمة"}</p>
              <h2 id="deadline-list-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{fr ? "Toutes les échéances" : "كل المواعيد"}</h2>
            </div>
            <div className="space-y-3">
              {applications.map((application) => {
                if (!application.deadline) return null;
                const days = daysUntil(application.deadline);
                const past = isPastDeadline(application.deadline);
                const urgent = !past && days <= 14;
                const soon = !past && days > 14 && days <= 45;
                const priority = past ? (fr ? "Dépassée" : "منتهية") : urgent ? (fr ? "Urgent" : "عاجل") : soon ? (fr ? "Bientôt" : "قريبًا") : (fr ? "À venir" : "قادم");
                const tone = past || urgent ? "warning" : soon ? "info" : "neutral";
                return (
                  <Card as="article" key={application.id} className="shadow-none">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><Badge variant={tone}>{priority}</Badge><span className="text-xs font-semibold text-slate-500">{formatDeadline(application.deadline, locale)}</span></div>
                        <h3 className="mt-2 font-bold text-slate-950"><bdi dir="auto">{programOf(application)?.name || (fr ? "Candidature" : "ترشح")}</bdi></h3>
                        <p className="mt-1 text-sm text-slate-600"><bdi dir="auto">{universityOf(application)?.name || ""}</bdi></p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{application.next_action || (fr ? "Vérifie les prochaines étapes de cette candidature." : "تحقق من الخطوات التالية لهذا الترشح.")}</p>
                      </div>
                      <ButtonLink href="/student/applications" variant="secondary">{fr ? "Ouvrir la candidature" : "فتح الترشح"}</ButtonLink>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card className="shadow-none"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-600">{detail}</p></Card>;
}
