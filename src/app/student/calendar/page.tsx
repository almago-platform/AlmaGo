import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { DossierHeader } from "@/components/product/DossierHeader";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { StudentPageState } from "@/components/student/StudentPageState";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDeadline, isPastDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

type CalendarApplication = {
  id: string;
  status: string;
  deadline: string | null;
  next_action: string | null;
  programs:
    | { name: string; universities: { name: string } | { name: string }[] | null }
    | { name: string; universities: { name: string } | { name: string }[] | null }[]
    | null;
};

const calendarCopy = {
  fr: {
    eyebrow: "Calendrier",
    title: "Tes échéances importantes",
    description: "Une vue unique pour voir ce qui est urgent, ce qui arrive bientôt et ce qui demande ton attention.",
    applications: "Voir mes candidatures",
    loadError: "Impossible de charger les échéances",
    loadErrorText: "Tes candidatures sont conservées. Réessaie dans quelques instants.",
    retry: "Réessayer",
    empty: "Aucune deadline à suivre pour le moment",
    emptyText: "Quand une candidature aura une échéance confirmée, elle apparaîtra ici automatiquement.",
    explore: "Explorer les programmes",
    summaryAria: "Résumé des échéances",
    nextDeadline: "Prochaine deadline",
    noUpcoming: "Aucune à venir",
    upcoming: "À venir",
    confirmed: "échéances confirmées",
    overdue: "Dépassées",
    review: "à vérifier",
    clear: "rien à signaler",
    listEyebrow: "Vue liste",
    listTitle: "Toutes les échéances",
    overdueBadge: "Dépassée",
    urgent: "Urgent",
    soon: "Bientôt",
    upcomingBadge: "À venir",
    application: "Candidature",
    defaultAction: "Vérifie les prochaines étapes de cette candidature.",
    open: "Ouvrir la candidature",
  },
  ar: {
    eyebrow: "التقويم",
    title: "مواعيدك المهمة",
    description: "عرض واحد لمعرفة ما هو عاجل وما يقترب وما يحتاج إلى انتباهك.",
    applications: "عرض ترشحاتي",
    loadError: "تعذر تحميل المواعيد",
    loadErrorText: "ترشحاتك محفوظة. حاول مرة أخرى بعد قليل.",
    retry: "إعادة المحاولة",
    empty: "لا توجد مواعيد للمتابعة حاليًا",
    emptyText: "عندما يصبح لترشح موعد مؤكد سيظهر هنا تلقائيًا.",
    explore: "استكشاف البرامج",
    summaryAria: "ملخص المواعيد",
    nextDeadline: "الموعد التالي",
    noUpcoming: "لا يوجد",
    upcoming: "قادمة",
    confirmed: "مواعيد مؤكدة",
    overdue: "منتهية",
    review: "تحتاج إلى مراجعة",
    clear: "لا شيء",
    listEyebrow: "عرض القائمة",
    listTitle: "كل المواعيد",
    overdueBadge: "منتهية",
    urgent: "عاجل",
    soon: "قريبًا",
    upcomingBadge: "قادم",
    application: "ترشح",
    defaultAction: "تحقق من الخطوات التالية لهذا الترشح.",
    open: "فتح الترشح",
  },
  en: {
    eyebrow: "Calendar",
    title: "Your important deadlines",
    description: "One place to see what is urgent, what is coming soon and what needs your attention.",
    applications: "View my applications",
    loadError: "Unable to load deadlines",
    loadErrorText: "Your applications are safe. Try again in a moment.",
    retry: "Try again",
    empty: "No deadlines to track right now",
    emptyText: "When an application has a confirmed deadline, it will appear here automatically.",
    explore: "Explore programmes",
    summaryAria: "Deadline summary",
    nextDeadline: "Next deadline",
    noUpcoming: "None upcoming",
    upcoming: "Upcoming",
    confirmed: "confirmed deadlines",
    overdue: "Overdue",
    review: "to review",
    clear: "nothing to flag",
    listEyebrow: "List view",
    listTitle: "All deadlines",
    overdueBadge: "Overdue",
    urgent: "Urgent",
    soon: "Soon",
    upcomingBadge: "Upcoming",
    application: "Application",
    defaultAction: "Check the next steps for this application.",
    open: "Open application",
  },
  de: {
    eyebrow: "Kalender",
    title: "Deine wichtigen Fristen",
    description: "Eine zentrale Ansicht für dringende, bevorstehende und zu prüfende Termine.",
    applications: "Meine Bewerbungen",
    loadError: "Fristen konnten nicht geladen werden",
    loadErrorText: "Deine Bewerbungen bleiben gespeichert. Versuche es gleich noch einmal.",
    retry: "Erneut versuchen",
    empty: "Zurzeit gibt es keine Fristen zu verfolgen",
    emptyText: "Sobald eine Bewerbung eine bestätigte Frist hat, erscheint sie hier automatisch.",
    explore: "Studiengänge entdecken",
    summaryAria: "Fristenübersicht",
    nextDeadline: "Nächste Frist",
    noUpcoming: "Keine bevorstehend",
    upcoming: "Bevorstehend",
    confirmed: "bestätigte Fristen",
    overdue: "Abgelaufen",
    review: "zu prüfen",
    clear: "nichts auffällig",
    listEyebrow: "Listenansicht",
    listTitle: "Alle Fristen",
    overdueBadge: "Abgelaufen",
    urgent: "Dringend",
    soon: "Bald",
    upcomingBadge: "Bevorstehend",
    application: "Bewerbung",
    defaultAction: "Prüfe die nächsten Schritte dieser Bewerbung.",
    open: "Bewerbung öffnen",
  },
} as const;

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
  const t = calendarCopy[locale];
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

  return (
    <StudentPageFrame className="space-y-7">
      <DossierHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        status={error ? t.loadError : applications.length ? t.upcoming : t.empty}
        statusVariant={error ? "warning" : applications.length ? "info" : "neutral"}
        facts={
          error
            ? undefined
            : [
                { label: t.nextDeadline, value: next?.deadline ? formatDeadline(next.deadline, locale) : "—" },
                { label: t.upcoming, value: upcoming.length },
                { label: t.overdue, value: overdue.length },
              ]
        }
        actions={<ButtonLink href="/student/applications" variant="secondary">{t.applications}</ButtonLink>}
      />

      {error ? (
        <StudentPageState
          variant="warning"
          title={t.loadError}
          description={t.loadErrorText}
          actions={<ButtonLink href="/student/calendar">{t.retry}</ButtonLink>}
        />
      ) : applications.length === 0 ? (
        <StudentPageState
          centered
          title={t.empty}
          description={t.emptyText}
          actions={<ButtonLink href="/student/orientation">{t.explore}</ButtonLink>}
        />
      ) : (
        <>
          <section aria-label={t.summaryAria} className="grid gap-4 md:grid-cols-3">
            <Summary
              label={t.nextDeadline}
              value={next?.deadline ? formatDeadline(next.deadline, locale) : "—"}
              detail={next ? programOf(next)?.name || "" : t.noUpcoming}
            />
            <Summary label={t.upcoming} value={String(upcoming.length)} detail={t.confirmed} />
            <Summary
              label={t.overdue}
              value={String(overdue.length)}
              detail={overdue.length ? t.review : t.clear}
            />
          </section>

          <section aria-labelledby="deadline-list-title">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.listEyebrow}</p>
              <h2 id="deadline-list-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {t.listTitle}
              </h2>
            </div>

            <div className="space-y-3">
              {applications.map((application) => {
                if (!application.deadline) return null;
                const days = daysUntil(application.deadline);
                const past = isPastDeadline(application.deadline);
                const urgent = !past && days <= 14;
                const soon = !past && days > 14 && days <= 45;
                const priority = past
                  ? t.overdueBadge
                  : urgent
                    ? t.urgent
                    : soon
                      ? t.soon
                      : t.upcomingBadge;
                const tone = past || urgent ? "warning" : soon ? "info" : "neutral";

                return (
                  <Card as="article" key={application.id} className="shadow-none">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={tone}>{priority}</Badge>
                          <span className="text-xs font-semibold text-slate-500">
                            {formatDeadline(application.deadline, locale)}
                          </span>
                        </div>
                        <h3 className="mt-2 font-bold text-slate-950">
                          <bdi dir="auto">{programOf(application)?.name || t.application}</bdi>
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          <bdi dir="auto">{universityOf(application)?.name || ""}</bdi>
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {application.next_action || t.defaultAction}
                        </p>
                      </div>
                      <ButtonLink href="/student/applications" variant="secondary">
                        {t.open}
                      </ButtonLink>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      )}
    </StudentPageFrame>
  );
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="shadow-none">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </Card>
  );
}
