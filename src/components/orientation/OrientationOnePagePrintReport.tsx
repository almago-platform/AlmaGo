import { BrandLogo } from "@/components/brand/BrandLogo";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import {
  getAcademicAccessConclusion,
  getVerifiedAcademicOptions,
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
    languageText: (current: string, next: string | null) =>
      next
        ? `Allemand ${current} → ${next}, puis B2/C1 selon le programme et le certificat demandé.`
        : `Allemand ${current} : viser le certificat universitaire exigé par le programme choisi.`,
    languageChoice:
      "Vous pouvez progresser en Tunisie ou suivre une préparation linguistique en Allemagne. Une école ne sera appelée « partenaire Campus Allemagne » qu'après accord réel signé.",
    applicationText:
      "Campus Allemagne vous accompagne dans le choix des programmes, l'organisation du dossier et la procédure de candidature. Vous fournissez les documents personnels et effectuez les démarches qui doivent être faites en votre nom.",
    programmesTitle: "Pistes vérifiées à Aachen",
    noProgrammes:
      "Aucune piste V3 vérifiée n'est encore disponible pour cette combinaison de ville et domaine.",
    next: "Prochaine action",
    nextText: (current: string, next: string | null) =>
      next
        ? `Continuez votre allemand de ${current} vers ${next}. En parallèle, choisissez avec Campus Allemagne 2 ou 3 programmes parmi les pistes ci-dessous.`
        : "Choisissez avec Campus Allemagne 2 ou 3 programmes parmi les pistes ci-dessous et préparez le certificat de langue demandé.",
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
    languageText: (current: string, next: string | null) =>
      next
        ? `الألمانية ${current} ← ${next}، ثم B2/C1 حسب البرنامج والشهادة المطلوبة.`
        : `مستواك ${current} في الألمانية: الهدف الآن هو الشهادة الجامعية التي يطلبها البرنامج المختار.`,
    languageChoice:
      "يمكن تطوير اللغة في تونس أو عبر تحضير لغوي في ألمانيا. لا نصف أي مدرسة بأنها «شريك Campus Allemagne» إلا بعد اتفاق حقيقي وموقع.",
    applicationText:
      "يرافقك Campus Allemagne في اختيار البرامج وتنظيم الملف ومسار التقديم. أنت تقدم الوثائق الشخصية وتقوم بالإجراءات التي يجب أن تتم باسمك.",
    programmesTitle: "مسارات موثقة في آخن",
    noProgrammes:
      "لا توجد بعد مسارات V3 موثقة لهذه المدينة وهذا المجال.",
    next: "خطوتك التالية",
    nextText: (current: string, next: string | null) =>
      next
        ? `واصل الألمانية من ${current} إلى ${next}. وفي الوقت نفسه اختر مع Campus Allemagne برنامجين أو ثلاثة من الخيارات أدناه.`
        : "اختر مع Campus Allemagne برنامجين أو ثلاثة من الخيارات أدناه وجهّز شهادة اللغة المطلوبة.",
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
    languageText: (current: string, next: string | null) =>
      next
        ? `German ${current} → ${next}, then B2/C1 depending on the programme and accepted certificate.`
        : `German ${current}: target the university-entry certificate required by the chosen programme.`,
    languageChoice:
      "You can progress in Tunisia or take language preparation in Germany. A school is only described as a Campus Allemagne partner after a real signed agreement.",
    applicationText:
      "Campus Allemagne supports programme choice, file organisation and the application route. You provide personal documents and complete actions that legally must be done in your own name.",
    programmesTitle: "Verified options in Aachen",
    noProgrammes:
      "No V3-verified option is available yet for this city and field combination.",
    next: "Next action",
    nextText: (current: string, next: string | null) =>
      next
        ? `Continue German from ${current} toward ${next}. In parallel, choose 2 or 3 programmes below with Campus Allemagne.`
        : "Choose 2 or 3 programmes below with Campus Allemagne and prepare the required language certificate.",
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
    languageText: (current: string, next: string | null) =>
      next
        ? `Deutsch ${current} → ${next}, danach B2/C1 je nach Programm und akzeptiertem Zertifikat.`
        : `Deutsch ${current}: Ziel ist der für das gewählte Programm verlangte Hochschul-Sprachnachweis.`,
    languageChoice:
      "Du kannst die Sprache in Tunesien verbessern oder eine Sprachvorbereitung in Deutschland wählen. Eine Schule wird erst nach einer echten unterschriebenen Vereinbarung als Campus-Allemagne-Partner bezeichnet.",
    applicationText:
      "Campus Allemagne begleitet Programmauswahl, Dossier und Bewerbungsweg. Du stellst persönliche Unterlagen bereit und erledigst Schritte, die rechtlich in deinem Namen erfolgen müssen.",
    programmesTitle: "Verifizierte Optionen in Aachen",
    noProgrammes:
      "Für diese Kombination aus Stadt und Fach gibt es noch keine V3-verifizierte Option.",
    next: "Nächste Aktion",
    nextText: (current: string, next: string | null) =>
      next
        ? `Verbessere dein Deutsch von ${current} auf ${next}. Wähle parallel mit Campus Allemagne 2 oder 3 Programme aus den Optionen unten.`
        : "Wähle mit Campus Allemagne 2 oder 3 Programme unten aus und bereite den verlangten Sprachnachweis vor.",
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
  const options = getVerifiedAcademicOptions(answers);
  const cities = answers.preferredCities.length
    ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
    : "—";
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
              <td>{access.short}. {access.status === "direct_subject_restricted" ? "Ingénierie compatible avec cette route." : access.detail}</td>
            </tr>
            <tr>
              <td>{copy.programmes}</td>
              <td>
                <strong>{copy.programmesTitle}</strong>
                {options.length ? (
                  <ul className="mt-1 space-y-0.5">
                    {options.map((option) => (
                      <li key={`${option.institution}-${option.programme}`}>
                        {option.institution} — {option.programme} {option.degree} · {option.teachingLanguage} · {option.languageRequirement}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>{copy.noProgrammes}</span>
                )}
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
        <p className="mt-1 text-[11px] font-semibold leading-[1.35]">{copy.nextText(german, nextGerman)}</p>
      </section>

      <footer className="orientation-one-page-footer">
        <div>
          <strong>{copy.sources}:</strong> DAAD/ZAB · RWTH Aachen · FH Aachen
          {options.length ? ` · ${copy.verified} 02/10/2026` : ""}
        </div>
        <p>{copy.disclaimer}</p>
      </footer>
    </section>
  );
}
