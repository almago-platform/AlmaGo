import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectJourneyProgress } from "@/components/prospect/ProspectJourneyProgress";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadProspectHubState } from "@/lib/prospect/hub";

type Step = {
  title: string;
  body: string;
  href: string;
};

function activeStepIndex(state: Awaited<ReturnType<typeof loadProspectHubState>>) {
  if (!state.current || !state.orientationConfirmed) return 0;
  const preBac = state.answers?.bacStatus === "preparing";

  if (preBac) {
    if (!state.intake || state.intake.status === "starter_documents") return 1;
    if (state.intake.status === "route_proposed" || state.intake.status === "student_question") return 5;
    if (state.intake.status === "payment_pending" || state.intake.status === "paid_pending_validation") return 6;
    if (state.intake.status === "procedure_created") return 7;
    return 1;
  }

  if (!state.intake || state.intake.status === "starter_documents") return 1;
  if (state.intake.status === "campus_review") return 2;
  if (state.intake.status === "route_proposed" || state.intake.status === "student_question") return 3;
  if (state.intake.status === "payment_pending" || state.intake.status === "paid_pending_validation") return 4;
  if (state.intake.status === "procedure_created") return 5;
  return 1;
}

function steps(locale: "fr" | "ar" | "en" | "de"): Step[] {
  const all = {
    fr: [
      ["Orientation", "Confirmer les informations qui servent de point de départ à votre projet.", "/prospect/orientation"],
      ["Documents", "Envoyer les pièces nécessaires pour que Campus Allemagne puisse vérifier votre situation.", "/prospect/documents"],
      ["Analyse Campus", "Campus Allemagne examine votre orientation et les pièces validées.", "/prospect/proposal"],
      ["Proposition", "Consulter le parcours proposé, l’accepter ou demander une modification.", "/prospect/proposal"],
      ["Paiement", "Après acceptation, finalisez le paiement. La phase suivante reste verrouillée jusqu’à sa validation par Campus Allemagne.", "/prospect/payment"],
      ["Procédure", "Après validation du paiement, votre procédure structurée est créée et l’espace client est activé.", "/prospect/roadmap"],
      ["Candidatures", "Les candidatures viennent après validation du parcours et des exigences de chaque programme.", "/prospect/catalogue"],
      ["Admission", "Une admission officielle appartient à l’université et ne peut jamais être garantie.", "/prospect/roadmap"],
      ["Visa & départ", "Après admission, préparez financement, assurance, compte bloqué, visa et départ selon les exigences applicables.", "/prospect/solutions"],
    ],
    en: [
      ["Orientation", "Confirm the information used as the starting point for your project.", "/prospect/orientation"],
      ["Documents", "Send the documents Campus Allemagne needs to review your situation.", "/prospect/documents"],
      ["Campus review", "Campus Allemagne reviews your orientation and approved documents.", "/prospect/proposal"],
      ["Proposal", "Review the proposed route, accept it or request a change.", "/prospect/proposal"],
      ["Payment", "After acceptance, complete payment. The next phase stays locked until Campus Allemagne validates it.", "/prospect/payment"],
      ["Procedure", "After payment validation, your structured procedure is created and client access is activated.", "/prospect/roadmap"],
      ["Applications", "Applications come after the route and each programme’s requirements have been checked.", "/prospect/catalogue"],
      ["Admission", "Official admission is decided by the university and can never be guaranteed.", "/prospect/roadmap"],
      ["Visa & departure", "After admission, prepare funding, insurance, blocked account, visa and departure as required.", "/prospect/solutions"],
    ],
    de: [
      ["Orientierung", "Bestätige die Angaben, die als Ausgangspunkt für dein Projekt dienen.", "/prospect/orientation"],
      ["Dokumente", "Sende die Unterlagen, die Campus Allemagne zur Prüfung braucht.", "/prospect/documents"],
      ["Campus-Prüfung", "Campus Allemagne prüft Orientierung und bestätigte Dokumente.", "/prospect/proposal"],
      ["Vorschlag", "Prüfe den vorgeschlagenen Weg, nimm ihn an oder bitte um Änderung.", "/prospect/proposal"],
      ["Zahlung", "Nach der Annahme schließt du die Zahlung ab. Die nächste Phase bleibt bis zur Prüfung durch Campus Allemagne gesperrt.", "/prospect/payment"],
      ["Verfahren", "Nach der Zahlungsprüfung wird dein Verfahren angelegt und der Kundenzugang aktiviert.", "/prospect/roadmap"],
      ["Bewerbungen", "Bewerbungen folgen nach Prüfung des Weges und der Programmbedingungen.", "/prospect/catalogue"],
      ["Zulassung", "Über die Zulassung entscheidet die Hochschule; sie kann nie garantiert werden.", "/prospect/roadmap"],
      ["Visum & Abreise", "Nach der Zulassung folgen Finanzierung, Versicherung, Sperrkonto, Visum und Abreise.", "/prospect/solutions"],
    ],
    ar: [
      ["التوجيه", "أكد المعلومات التي يعتمد عليها مشروعك.", "/prospect/orientation"],
      ["الوثائق", "أرسل الوثائق التي تحتاجها Campus Allemagne لمراجعة وضعك.", "/prospect/documents"],
      ["مراجعة Campus", "تراجع Campus Allemagne توجيهك والوثائق التي تمت المصادقة عليها.", "/prospect/proposal"],
      ["الاقتراح", "راجع المسار المقترح واقبله أو اطلب تعديله.", "/prospect/proposal"],
      ["الدفع", "بعد القبول أكمل الدفع. تبقى المرحلة التالية مقفلة إلى أن تتحقق Campus Allemagne من الدفع.", "/prospect/payment"],
      ["الإجراءات", "بعد التحقق من الدفع يتم إنشاء إجراءاتك وتفعيل مساحة العميل.", "/prospect/roadmap"],
      ["الترشحات", "تأتي الترشحات بعد التحقق من المسار وشروط كل برنامج.", "/prospect/catalogue"],
      ["القبول", "قرار القبول الرسمي يعود للجامعة ولا يمكن ضمانه.", "/prospect/roadmap"],
      ["التأشيرة والمغادرة", "بعد القبول حضّر التمويل والتأمين والحساب المغلق والتأشيرة والمغادرة.", "/prospect/solutions"],
    ],
  } as const;

  return all[locale].map(([title, body, href]) => ({ title, body, href }));
}

function preBacSteps(locale: "fr" | "ar" | "en" | "de"): Step[] {
  const all = {
    fr: [
      ["Orientation", "Confirmer le projet qui servira de point de départ avant le Bac.", "/prospect/orientation"],
      ["Préparation avant le Bac", "Progressez en langue, explorez les programmes et préparez votre projet. Aucun Bac ni relevé final n’est requis maintenant.", "/prospect/solutions"],
      ["Résultats du Bac", "Après les résultats, mettez votre orientation à jour avec le statut Bac obtenu, votre moyenne finale et les informations académiques définitives.", "/prospect/orientation"],
      ["Documents finaux", "Une fois le Bac obtenu, le parcours post-Bac demandera les pièces académiques nécessaires.", "/prospect/documents"],
      ["Analyse Campus", "Campus Allemagne vérifie votre profil mis à jour et les pièces finales utiles.", "/prospect/proposal"],
      ["Proposition", "Consultez le parcours de préparation proposé et discutez-le si nécessaire.", "/prospect/proposal"],
      ["Paiement", "Après acceptation, finalisez le paiement. Votre espace de préparation s’ouvre seulement après validation Campus.", "/prospect/payment"],
      ["Candidatures", "Les candidatures viennent après validation du parcours et des exigences de chaque programme.", "/prospect/catalogue"],
      ["Admission", "Une admission officielle appartient à l’université et ne peut jamais être garantie.", "/prospect/roadmap"],
      ["Visa & départ", "Après admission, préparez financement, assurance, compte bloqué, visa et départ selon les exigences applicables.", "/prospect/solutions"],
    ],
    en: [
      ["Orientation", "Confirm the project that will guide your preparation before the Bac.", "/prospect/orientation"],
      ["Pre-Bac preparation", "Improve your language, explore programmes and prepare your project. No final Bac or final transcript is required now.", "/prospect/solutions"],
      ["Bac results", "After the results, update your orientation with Bac obtained, your final average and final academic information.", "/prospect/orientation"],
      ["Final documents", "Once the Bac is obtained, the post-Bac flow will request the academic documents that are actually needed.", "/prospect/documents"],
      ["Campus review", "Campus Allemagne reviews your updated profile and useful final evidence.", "/prospect/proposal"],
      ["Proposal", "Review the proposed preparation route and discuss it if needed.", "/prospect/proposal"],
      ["Payment", "After acceptance, complete payment. Your preparation workspace opens only after Campus validation.", "/prospect/payment"],
      ["Applications", "Applications come after the route and each programme’s requirements have been checked.", "/prospect/catalogue"],
      ["Admission", "Official admission is decided by the university and can never be guaranteed.", "/prospect/roadmap"],
      ["Visa & departure", "After admission, prepare funding, insurance, blocked account, visa and departure as required.", "/prospect/solutions"],
    ],
    de: [
      ["Orientierung", "Bestätige das Projekt, das deine Vorbereitung vor dem Abitur leitet.", "/prospect/orientation"],
      ["Vorbereitung vor dem Abitur", "Verbessere deine Sprache, erkunde Studiengänge und bereite dein Projekt vor. Abiturzeugnis und Abschlussnoten sind jetzt noch nicht nötig.", "/prospect/solutions"],
      ["Abiturergebnisse", "Nach den Ergebnissen aktualisierst du dein Projekt mit bestandenem Abitur, Endnote und endgültigen akademischen Angaben.", "/prospect/orientation"],
      ["Endgültige Unterlagen", "Nach dem Abitur fordert der Post-Abitur-Weg die tatsächlich benötigten akademischen Unterlagen an.", "/prospect/documents"],
      ["Campus-Prüfung", "Campus Allemagne prüft dein aktualisiertes Profil und die relevanten endgültigen Nachweise.", "/prospect/proposal"],
      ["Vorschlag", "Prüfe den vorgeschlagenen Vorbereitungsweg und besprich ihn bei Bedarf.", "/prospect/proposal"],
      ["Zahlung", "Nach der Annahme schließt du die Zahlung ab. Dein Vorbereitungsbereich öffnet sich erst nach der Campus-Prüfung.", "/prospect/payment"],
      ["Bewerbungen", "Bewerbungen folgen nach Prüfung des Weges und der Programmbedingungen.", "/prospect/catalogue"],
      ["Zulassung", "Über die Zulassung entscheidet die Hochschule; sie kann nie garantiert werden.", "/prospect/roadmap"],
      ["Visum & Abreise", "Nach der Zulassung folgen Finanzierung, Versicherung, Sperrkonto, Visum und Abreise.", "/prospect/solutions"],
    ],
    ar: [
      ["التوجيه", "أكد المشروع الذي سيقود تحضيرك قبل البكالوريا.", "/prospect/orientation"],
      ["التحضير قبل البكالوريا", "طوّر لغتك واستكشف البرامج وجهّز مشروعك. لا نطلب الآن شهادة البكالوريا النهائية ولا كشف النقاط النهائي.", "/prospect/solutions"],
      ["نتائج البكالوريا", "بعد صدور النتائج حدّث مشروعك إلى بكالوريا متحصّل عليها وأضف المعدل والمعلومات الأكاديمية النهائية.", "/prospect/orientation"],
      ["الوثائق النهائية", "بعد الحصول على البكالوريا سيطلب مسار ما بعد البكالوريا الوثائق الأكاديمية اللازمة فقط.", "/prospect/documents"],
      ["مراجعة Campus", "تراجع Campus Allemagne ملفك المحدّث والوثائق النهائية المفيدة.", "/prospect/proposal"],
      ["الاقتراح", "راجع مسار التحضير المقترح وناقشه عند الحاجة.", "/prospect/proposal"],
      ["الدفع", "بعد القبول أكمل الدفع. لا تُفتح مساحة التحضير إلا بعد تحقق Campus من الدفع.", "/prospect/payment"],
      ["الترشحات", "تأتي الترشحات بعد التحقق من المسار وشروط كل برنامج.", "/prospect/catalogue"],
      ["القبول", "قرار القبول الرسمي يعود للجامعة ولا يمكن ضمانه.", "/prospect/roadmap"],
      ["التأشيرة والمغادرة", "بعد القبول حضّر التمويل والتأمين والحساب المغلق والتأشيرة والمغادرة.", "/prospect/solutions"],
    ],
  } as const;

  return all[locale].map(([title, body, href]) => ({ title, body, href }));
}

export const dynamic = "force-dynamic";

export default async function ProspectRoadmapPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const state = await loadProspectHubState({
    userId: access.user.id,
    email: access.user.email,
    emailConfirmed: Boolean(access.user.email_confirmed_at),
  });
  const t = prospectHubCopy[locale].roadmap;
  const preBac = state.answers?.bacStatus === "preparing";
  const current = activeStepIndex(state);
  const journey = preBac ? preBacSteps(locale) : steps(locale);
  const currentStep = journey[current] ?? journey[0];
  const nextStep = journey[current + 1] ?? null;
  const completedSteps = journey.slice(0, current);
  const futureSteps = journey.slice(current + 2);

  return (
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
      />

      <section className="rounded-[1.35rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)] backdrop-blur-sm sm:p-6">
        <ProspectJourneyProgress
          hasOrientation={Boolean(state.current)}
          orientationConfirmed={state.orientationConfirmed}
          intake={state.intake}
          starterSummary={state.starterSummary}
          locale={locale}
          preBac={preBac}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="relative overflow-hidden rounded-[1.4rem] border border-[var(--brand-border)]/70 bg-[linear-gradient(135deg,#fff0f2,#fffaf9)] p-5 shadow-[0_26px_70px_-44px_rgba(216,6,33,.34)] sm:p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
            {String(current + 1).padStart(2, "0")} · {t.current}
          </p>
          <h2 className="mt-2 text-[clamp(1.55rem,2.5vw,2.15rem)] font-semibold tracking-[-0.035em] text-[#1c1f21]">{currentStep.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{currentStep.body}</p>
          <Link
            href={currentStep.href}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
          >
            {t.current}
          </Link>
        </article>

        {nextStep ? (
          <article className="rounded-[1.35rem] border border-black/[.07] bg-white p-5 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)] sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#74797d]">
              {String(current + 2).padStart(2, "0")} · {t.next}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]">{nextStep.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{nextStep.body}</p>
            <Link
              href={nextStep.href}
              className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              {t.next}
            </Link>
          </article>
        ) : null}
      </section>

      {(completedSteps.length || futureSteps.length) ? (
        <section className="grid items-start gap-4 lg:grid-cols-2">
          {completedSteps.length ? (
            <details className="rounded-[1.25rem] border border-black/[.07] bg-white p-4 shadow-[0_18px_52px_-42px_rgba(0,0,0,.3)]">
              <summary className="cursor-pointer font-bold">{t.completedGroup}</summary>
              <div className="mt-3 grid gap-2">
                {completedSteps.map((step, index) => (
                  <div key={step.title} className="flex items-center gap-3 rounded-xl border border-[#b7dfcd] bg-[#edf8f3] px-3.5 py-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">✓</span>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")} · {t.done}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          {futureSteps.length ? (
            <details className="rounded-[1.25rem] border border-black/[.07] bg-white p-4 shadow-[0_18px_52px_-42px_rgba(0,0,0,.3)]">
              <summary className="cursor-pointer font-bold">{t.futureGroup}</summary>
              <div className="mt-3 grid gap-2">
                {futureSteps.map((step, index) => (
                  <Link
                    key={step.title}
                    href={step.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/[.05] bg-[#f6f3ed] px-3.5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-soft)]"
                  >
                    <span>{step.title}</span>
                    <span className="text-xs font-normal text-[var(--muted)]">
                      {String(current + index + 3).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
