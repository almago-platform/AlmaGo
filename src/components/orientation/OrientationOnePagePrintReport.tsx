import { BrandLogo } from "@/components/brand/BrandLogo";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import {
  getAcademicAccessConclusion,
  getVerifiedProgrammeSet,
} from "@/lib/orientation/verified-academic-options";
import {
  localizePreferredCity,
  localizeProfileOptions,
} from "@/content/student-profile-copy";
import {
  degreeOptions,
  studyFieldOptions,
} from "@/lib/student/profile-options";

const nextGermanLevel: Record<string, string | null> = {
  none: "A1",
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: "C1",
  C1: null,
  C2: null,
};

const labels = {
  fr: {
    title: "Mon orientation Allemagne",
    subtitle: "Une route académique claire, construite à partir de votre profil.",
    profile: "Profil",
    conclusion: "Conclusion",
    route: "Votre route",
    step: "Étape",
    direction: "Route recommandée",
    language: "Langue",
    access: "Accès académique",
    programmes: "Programmes",
    application: "Candidature",
    languageText: (current: string, next: string | null) => {
      if (current === "none") {
        return "Vous débutez l'allemand : A1 → A2 → B1, puis B2/C1 selon le programme et le certificat demandé.";
      }
      return next
        ? `Votre niveau ${current} est un bon point de départ : visez ${next}, puis B2/C1 selon le programme et le certificat demandé.`
        : `Votre niveau ${current} est déjà avancé : l'objectif devient le certificat universitaire accepté par le programme choisi.`;
    },
    languageChoice:
      "Vous pouvez progresser en Tunisie ou en Allemagne. Selon les disponibilités de votre parcours, Campus Allemagne peut vous orienter vers une école partenaire validée en Tunisie ou en Allemagne.",
    applicationText:
      "Campus Allemagne prend en charge l'accompagnement opérationnel de votre projet : confirmation de la route, sélection des programmes, calendrier, préparation et contrôle du dossier, organisation et suivi des candidatures, puis préparation de votre arrivée en Allemagne. Les décisions officielles et les démarches qui exigent votre signature restent faites en votre nom. Après l'arrivée, les services d'intégration et de carrière disponibles peuvent prolonger cet accompagnement.",
    programmesTitlePreferred: (city: string) => `Pistes vérifiées à ${city}`,
    programmesTitleRecommended: (city: string) => `Suggestion Campus Allemagne : ${city}`,
    noProgrammes:
      "Campus Allemagne vous proposera 2 ou 3 programmes adaptés après confirmation de votre ville et de votre route académique.",
    next: "Prochaine étape avec Campus Allemagne",
    nextText: () =>
      "Si vous choisissez de continuer, Campus Allemagne vous contacte pour confirmer votre route, sélectionner avec vous 2 ou 3 programmes et vous présenter l'option d'accompagnement adaptée pour la langue et la candidature.",
    sources: "Sources officielles",
    verified: "vérifiées le",
    disclaimer:
      "Orientation de préparation : la décision d'admission appartient à chaque université et la décision de visa aux autorités compétentes.",
  },
  ar: {
    title: "توجيهي للدراسة في ألمانيا",
    subtitle: "مسار أكاديمي واضح مبني على ملفك.",
    profile: "الملف",
    conclusion: "الخلاصة",
    route: "مسارك",
    step: "المرحلة",
    direction: "المسار المقترح",
    language: "اللغة",
    access: "الدخول الأكاديمي",
    programmes: "البرامج",
    application: "التقديم",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "أنت تبدأ الألمانية: A1 ← A2 ← B1، ثم B2/C1 حسب البرنامج والشهادة المطلوبة.";
      return next
        ? `مستواك ${current} نقطة بداية جيدة: الهدف التالي ${next}، ثم B2/C1 حسب البرنامج والشهادة المطلوبة.`
        : `مستواك ${current} متقدم؛ الهدف الآن هو شهادة اللغة الجامعية المقبولة في البرنامج المختار.`;
    },
    languageChoice:
      "يمكن تطوير اللغة في تونس أو ألمانيا. حسب الخيارات المتاحة لمسارك، يمكن لـ Campus Allemagne توجيهك إلى مدرسة شريكة معتمدة في تونس أو ألمانيا.",
    applicationText:
      "يتولى Campus Allemagne مرافقة مشروعك عمليًا: تأكيد المسار، اختيار البرامج، وضع الجدول، تجهيز ومراجعة الملف، تنظيم ومتابعة طلبات التقديم، ثم التحضير للوصول إلى ألمانيا. القرارات الرسمية والإجراءات التي تتطلب توقيعك تبقى باسمك، ويمكن أن تمتد المرافقة بعد الوصول إلى خدمات الاندماج والمسار المهني المتاحة.",
    programmesTitlePreferred: (city: string) => `مسارات موثقة في ${city}`,
    programmesTitleRecommended: (city: string) => `اقتراح Campus Allemagne: ${city}`,
    noProgrammes:
      "سيعرض عليك Campus Allemagne برنامجين أو ثلاثة بعد تأكيد المدينة والمسار الأكاديمي.",
    next: "الخطوة التالية مع Campus Allemagne",
    nextText: () =>
      "إذا اخترت المتابعة، سيتواصل معك Campus Allemagne لتأكيد المسار واختيار برنامجين أو ثلاثة معك وعرض خيار المرافقة المناسب للغة والتقديم.",
    sources: "المصادر الرسمية",
    verified: "تم التحقق في",
    disclaimer:
      "هذا توجيه للتحضير. قرار القبول يعود للجامعة وقرار التأشيرة للجهات المختصة.",
  },
  en: {
    title: "My Germany orientation",
    subtitle: "A clear academic route built from your profile.",
    profile: "Profile",
    conclusion: "Conclusion",
    route: "Your route",
    step: "Step",
    direction: "Recommended route",
    language: "Language",
    access: "Academic access",
    programmes: "Programmes",
    application: "Application",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "You are starting German: A1 → A2 → B1, then B2/C1 depending on the programme and accepted certificate.";
      return next
        ? `Your ${current} level is a good starting point: target ${next}, then B2/C1 depending on the programme and accepted certificate.`
        : `Your ${current} level is already advanced: the next target is the university language certificate accepted by the chosen programme.`;
    },
    languageChoice:
      "You can progress in Tunisia or Germany. Depending on the options available for your route, Campus Allemagne can direct you to a validated partner language school in Tunisia or Germany.",
    applicationText:
      "Campus Allemagne handles the operational support for your project: route confirmation, programme selection, timeline, application-file preparation and checking, application organisation and follow-up, then preparation for arrival in Germany. Official decisions and actions requiring your signature remain in your name; available integration and career services can continue the support after arrival.",
    programmesTitlePreferred: (city: string) => `Verified options in ${city}`,
    programmesTitleRecommended: (city: string) => `Campus Allemagne suggestion: ${city}`,
    noProgrammes:
      "Campus Allemagne will propose 2 or 3 suitable programmes after confirming your city and academic route.",
    next: "Next step with Campus Allemagne",
    nextText: () =>
      "If you choose to continue, Campus Allemagne will contact you to confirm the route, select 2 or 3 programmes with you and present the most suitable language and application support option.",
    sources: "Official sources",
    verified: "verified",
    disclaimer:
      "Preparation guidance only: admission decisions belong to each university and visa decisions to the competent authorities.",
  },
  de: {
    title: "Meine Deutschland-Orientierung",
    subtitle: "Eine klare akademische Route auf Basis deines Profils.",
    profile: "Profil",
    conclusion: "Fazit",
    route: "Deine Route",
    step: "Schritt",
    direction: "Empfohlene Route",
    language: "Sprache",
    access: "Hochschulzugang",
    programmes: "Programme",
    application: "Bewerbung",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "Du beginnst mit Deutsch: A1 → A2 → B1, danach B2/C1 je nach Programm und akzeptiertem Zertifikat.";
      return next
        ? `Dein Niveau ${current} ist ein guter Ausgangspunkt: nächstes Ziel ${next}, danach B2/C1 je nach Programm und akzeptiertem Zertifikat.`
        : `Dein Niveau ${current} ist bereits fortgeschritten: Ziel ist jetzt der vom Programm akzeptierte Hochschul-Sprachnachweis.`;
    },
    languageChoice:
      "Du kannst die Sprache in Tunesien oder Deutschland verbessern. Je nach verfügbarer Route kann Campus Allemagne dich an eine validierte Partnersprachschule in Tunesien oder Deutschland vermitteln.",
    applicationText:
      "Campus Allemagne übernimmt die operative Begleitung deines Projekts: Routenbestätigung, Programmauswahl, Zeitplan, Vorbereitung und Kontrolle des Dossiers, Organisation und Nachverfolgung der Bewerbungen sowie Vorbereitung auf die Ankunft in Deutschland. Offizielle Entscheidungen und Schritte mit deiner Unterschrift bleiben in deinem Namen; verfügbare Integrations- und Karriereservices können die Begleitung nach der Ankunft fortsetzen.",
    programmesTitlePreferred: (city: string) => `Verifizierte Optionen in ${city}`,
    programmesTitleRecommended: (city: string) => `Vorschlag von Campus Allemagne: ${city}`,
    noProgrammes:
      "Campus Allemagne schlägt dir nach Bestätigung von Stadt und akademischer Route 2 oder 3 passende Programme vor.",
    next: "Nächster Schritt mit Campus Allemagne",
    nextText: () =>
      "Wenn du weitermachen möchtest, kontaktiert dich Campus Allemagne, bestätigt deine Route, wählt mit dir 2 oder 3 Programme aus und stellt dir die passende Sprach- und Bewerbungsbegleitung vor.",
    sources: "Offizielle Quellen",
    verified: "geprüft am",
    disclaimer:
      "Nur Vorbereitungshilfe: Über die Zulassung entscheidet die Hochschule, über das Visum die zuständige Behörde.",
  },
} satisfies Record<Locale, unknown>;

function localizedValue(
  value: string,
  locale: Locale,
  options: readonly { value: string; label: string }[],
) {
  return localizeProfileOptions(locale, options).find((option) => option.value === value)?.label
    || value
    || "—";
}

export function OrientationOnePagePrintReport({
  answers,
  locale,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
}) {
  const copy = labels[locale] as (typeof labels)["fr"];
  const access = getAcademicAccessConclusion(answers);
  const programmeSet = getVerifiedProgrammeSet(answers);
  const options = programmeSet?.options || [];
  const cities = answers.preferredCities.length
    ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
    : locale === "ar"
      ? "المدينة لم تُحدد"
      : locale === "de"
        ? "Stadt noch offen"
        : locale === "en"
          ? "City not fixed"
          : "Ville à définir";
  const degree = localizedValue(answers.targetDegree, locale, degreeOptions);
  const field = localizedValue(answers.targetField, locale, studyFieldOptions);
  const german = answers.germanLevel || "—";
  const nextGerman = answers.germanLevel ? nextGermanLevel[answers.germanLevel] : null;
  const profileLine = [
    answers.bacYear ? `Bac ${answers.bacYear}` : "Bac",
    answers.bacTrack || "—",
    answers.generalAverage ? `${answers.generalAverage}/20` : null,
    `${degree} · ${field}`,
    `Allemand ${german}`,
    cities,
  ].filter(Boolean).join(" · ");

  return (
    <section className="orientation-one-page-print" aria-label={copy.title}>
      <header className="orientation-one-page-header">
        <BrandLogo className="h-8 w-auto" priority />
        <div className="text-end">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-strong)]">Campus Allemagne</p>
          <h1 className="mt-0.5 text-xl font-bold">{copy.title}</h1>
          <p className="mt-0.5 text-[10px] text-slate-600">{copy.subtitle}</p>
          <p className="mt-0.5 text-[9px] text-slate-500">
            {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}
          </p>
        </div>
      </header>

      <div className="orientation-one-page-profile">
        <b>{copy.profile}</b>
        <span>{profileLine}</span>
      </div>

      <section className="orientation-one-page-conclusion">
        <p className="orientation-one-page-label">{copy.conclusion}</p>
        <p className="mt-1 text-[11px] leading-[1.35]">
          <strong>{access.short}.</strong> {access.detail}
        </p>
      </section>

      <section className="mt-3">
        <p className="orientation-one-page-label">{copy.route}</p>
        <table className="orientation-one-page-table">
          <thead>
            <tr>
              <th>{copy.step}</th>
              <th>{copy.direction}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{copy.language}</td>
              <td>
                <strong>{copy.languageText(german, nextGerman)}</strong>
                <span>{copy.languageChoice}</span>
              </td>
            </tr>
            <tr>
              <td>{copy.access}</td>
              <td><strong>{access.short}.</strong> {access.detail}</td>
            </tr>
            <tr>
              <td>{copy.programmes}</td>
              <td>
                <strong>
                  {programmeSet
                    ? programmeSet.selectionReason === "preferred_city"
                      ? copy.programmesTitlePreferred(programmeSet.city)
                      : copy.programmesTitleRecommended(programmeSet.city)
                    : copy.noProgrammes}
                </strong>
                {options.length ? (
                  <ul className="mt-1 space-y-0.5">
                    {options.map((option) => (
                      <li key={`${option.institution}-${option.programme}`}>
                        {option.institution} — {option.programme} {option.degree} · {option.teachingLanguage} · {option.languageRequirement}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </td>
            </tr>
            <tr>
              <td>{copy.application}</td>
              <td>{copy.applicationText}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="orientation-one-page-next">
        <p className="orientation-one-page-label">{copy.next}</p>
        <p className="mt-1 text-[11px] font-semibold leading-[1.35]">{copy.nextText()}</p>
      </section>

      <footer className="orientation-one-page-footer">
        <div>
          <strong>{copy.sources}:</strong> DAAD/ZAB
          {options.length ? " · RWTH Aachen · FH Aachen" : ""}
          {options.length ? ` · ${copy.verified} 02/10/2026` : ` · ${copy.verified} ${access.verifiedAt}`}
        </div>
        <p>{copy.disclaimer}</p>
      </footer>
    </section>
  );
}
