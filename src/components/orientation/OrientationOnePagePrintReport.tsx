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
  engineeringSpecialtyOptions,
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
    application: "Accompagnement",
    languageText: (current: string, next: string | null) => {
      if (current === "none") {
        return "Vous débutez l'allemand : A1 → A2 → B1, puis B2/C1 selon le programme et le certificat demandé.";
      }
      return next
        ? `Votre niveau ${current} est un bon point de départ : visez ${next}, puis B2/C1 selon le programme et le certificat demandé.`
        : `Votre niveau ${current} est déjà avancé : l'objectif devient le certificat universitaire accepté par le programme choisi.`;
    },
    languageChoice:
      "Nous pouvons vous aider à progresser vers B1, B2 puis C1 selon le programme. La préparation peut se faire en Tunisie ou en Allemagne ; si une école partenaire Campus Allemagne est disponible pour votre parcours, cette option pourra vous être proposée.",
    applicationText:
      "Langue → programmes → admission → visa → Allemagne. Campus Allemagne organise avec vous la sélection des programmes, le calendrier, la préparation et le contrôle du dossier, les candidatures et leur suivi. Après une admission, nous préparons avec vous les étapes et documents du visa puis votre arrivée en Allemagne. Les décisions restent celles des universités et des autorités.",
    programmesTitlePreferred: (city: string) => `Programmes vérifiés à ${city}`,
    programmesTitleRecommended: (city: string) => `Suggestion Campus Allemagne : ${city}`,
    noProgrammesPreferred: (city: string) =>
      `Votre ville choisie est ${city}. Notre catalogue vérifié ne contient pas encore assez de programmes correspondant exactement à cette spécialité ; Campus Allemagne complètera la sélection avant de vous proposer 2 ou 3 pistes.`,
    noProgrammesRecommended: (city: string) =>
      `Suggestion Campus Allemagne : ${city}. Notre catalogue vérifié ne contient pas encore assez de programmes correspondant exactement à cette spécialité ; Campus Allemagne complètera la sélection avant de vous proposer 2 ou 3 pistes.`,
    next: "Vous souhaitez continuer ?",
    nextText: () =>
      "Campus Allemagne vous contacte pour confirmer votre route, sélectionner vos programmes et organiser la première étape de votre accompagnement personnalisé.",
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
    application: "المرافقة",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "أنت تبدأ الألمانية: A1 ← A2 ← B1، ثم B2/C1 حسب البرنامج والشهادة المطلوبة.";
      return next
        ? `مستواك ${current} نقطة بداية جيدة: الهدف التالي ${next}، ثم B2/C1 حسب البرنامج والشهادة المطلوبة.`
        : `مستواك ${current} متقدم؛ الهدف الآن هو شهادة اللغة الجامعية المقبولة في البرنامج المختار.`;
    },
    languageChoice:
      "يمكن تطوير اللغة في تونس أو ألمانيا. حسب الخيارات المتاحة لمسارك، يمكن لـ Campus Allemagne توجيهك إلى مدرسة شريكة معتمدة في تونس أو ألمانيا.",
    applicationText:
      "اللغة ← البرامج ← القبول ← التأشيرة ← ألمانيا. ينظم Campus Allemagne معك اختيار البرامج والجدول وتجهيز ومراجعة الملف والتقديم ومتابعته. بعد الحصول على قبول، نجهز معك خطوات ووثائق التأشيرة ثم الوصول إلى ألمانيا. القرارات النهائية تبقى للجامعة والسلطات.",
    programmesTitlePreferred: (city: string) => `مسارات موثقة في ${city}`,
    programmesTitleRecommended: (city: string) => `اقتراح Campus Allemagne: ${city}`,
    noProgrammesPreferred: (city: string) =>
      `مدينتك المختارة هي ${city}. لا يحتوي دليلنا الموثق بعد على عدد كافٍ من البرامج المطابقة تمامًا لهذا التخصص؛ سيُكمل Campus Allemagne الاختيار قبل اقتراح برنامجين أو ثلاثة عليك.`,
    noProgrammesRecommended: (city: string) =>
      `اقتراح Campus Allemagne: ${city}. لا يحتوي دليلنا الموثق بعد على عدد كافٍ من البرامج المطابقة تمامًا لهذا التخصص؛ سيُكمل Campus Allemagne الاختيار قبل اقتراح برنامجين أو ثلاثة عليك.`,
    next: "هل تريد المتابعة؟",
    nextText: () =>
      "سيتواصل معك Campus Allemagne لتأكيد مسارك واختيار البرامج وتنظيم أول خطوة في المرافقة الشخصية.",
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
    application: "Support route",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "You are starting German: A1 → A2 → B1, then B2/C1 depending on the programme and accepted certificate.";
      return next
        ? `Your ${current} level is a good starting point: target ${next}, then B2/C1 depending on the programme and accepted certificate.`
        : `Your ${current} level is already advanced: the next target is the university language certificate accepted by the chosen programme.`;
    },
    languageChoice:
      "You can progress in Tunisia or Germany. Depending on the options available for your route, Campus Allemagne can direct you to a validated partner language school in Tunisia or Germany.",
    applicationText:
      "Language → programmes → admission → visa → Germany. Campus Allemagne organises programme selection, timeline, file preparation and checking, applications and follow-up with you. After an admission, we prepare the visa steps and documents with you, then your arrival in Germany. Universities and authorities keep the final decisions.",
    programmesTitlePreferred: (city: string) => `Verified options in ${city}`,
    programmesTitleRecommended: (city: string) => `Campus Allemagne suggestion: ${city}`,
    noProgrammesPreferred: (city: string) =>
      `Your selected city is ${city}. Our verified catalogue does not yet contain enough programmes that exactly match this specialisation; Campus Allemagne will complete the selection before proposing 2 or 3 options.`,
    noProgrammesRecommended: (city: string) =>
      `Campus Allemagne suggestion: ${city}. Our verified catalogue does not yet contain enough programmes that exactly match this specialisation; Campus Allemagne will complete the selection before proposing 2 or 3 options.`,
    next: "Would you like to continue?",
    nextText: () =>
      "Campus Allemagne will contact you to confirm your route, select your programmes and organise the first step of your personalised support.",
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
    application: "Begleitung",
    languageText: (current: string, next: string | null) => {
      if (current === "none") return "Du beginnst mit Deutsch: A1 → A2 → B1, danach B2/C1 je nach Programm und akzeptiertem Zertifikat.";
      return next
        ? `Dein Niveau ${current} ist ein guter Ausgangspunkt: nächstes Ziel ${next}, danach B2/C1 je nach Programm und akzeptiertem Zertifikat.`
        : `Dein Niveau ${current} ist bereits fortgeschritten: Ziel ist jetzt der vom Programm akzeptierte Hochschul-Sprachnachweis.`;
    },
    languageChoice:
      "Du kannst die Sprache in Tunesien oder Deutschland verbessern. Je nach verfügbarer Route kann Campus Allemagne dich an eine validierte Partnersprachschule in Tunesien oder Deutschland vermitteln.",
    applicationText:
      "Sprache → Programme → Zulassung → Visum → Deutschland. Campus Allemagne organisiert mit dir Programmauswahl, Zeitplan, Vorbereitung und Kontrolle des Dossiers, Bewerbungen und Nachverfolgung. Nach einer Zulassung bereiten wir mit dir die Visumschritte und Unterlagen sowie deine Ankunft in Deutschland vor. Hochschulen und Behörden treffen die endgültigen Entscheidungen.",
    programmesTitlePreferred: (city: string) => `Verifizierte Optionen in ${city}`,
    programmesTitleRecommended: (city: string) => `Vorschlag von Campus Allemagne: ${city}`,
    noProgrammesPreferred: (city: string) =>
      `Deine gewählte Stadt ist ${city}. Unser verifizierter Katalog enthält noch nicht genügend Programme, die genau zu dieser Fachrichtung passen; Campus Allemagne ergänzt die Auswahl, bevor wir dir 2 oder 3 Optionen vorschlagen.`,
    noProgrammesRecommended: (city: string) =>
      `Vorschlag von Campus Allemagne: ${city}. Unser verifizierter Katalog enthält noch nicht genügend Programme, die genau zu dieser Fachrichtung passen; Campus Allemagne ergänzt die Auswahl, bevor wir dir 2 oder 3 Optionen vorschlagen.`,
    next: "Möchtest du weitermachen?",
    nextText: () =>
      "Campus Allemagne kontaktiert dich, bestätigt deine Route, wählt deine Programme mit dir aus und organisiert den ersten Schritt deiner persönlichen Begleitung.",
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
  const specialty = answers.targetField === "Ingénierie" && answers.engineeringSpecialty
    ? localizedValue(answers.engineeringSpecialty, locale, engineeringSpecialtyOptions)
    : null;
  const german = answers.germanLevel || "—";
  const nextGerman = answers.germanLevel ? nextGermanLevel[answers.germanLevel] : null;
  const profileLine = [
    answers.bacYear ? `Bac ${answers.bacYear}` : "Bac",
    answers.bacTrack || "—",
    answers.generalAverage ? `${answers.generalAverage}/20` : null,
    `${degree} · ${field}`,
    specialty,
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
              <td><strong>{access.short}.</strong></td>
            </tr>
            <tr>
              <td>{copy.programmes}</td>
              <td>
                <strong>
                  {programmeSet
                    ? options.length
                      ? programmeSet.selectionReason === "preferred_city"
                        ? copy.programmesTitlePreferred(programmeSet.city)
                        : copy.programmesTitleRecommended(programmeSet.city)
                      : programmeSet.selectionReason === "preferred_city"
                        ? copy.noProgrammesPreferred(programmeSet.city)
                        : copy.noProgrammesRecommended(programmeSet.city)
                    : copy.noProgrammesRecommended(cities)}
                </strong>
                {options.length ? (
                  <div className="orientation-programme-list">
                    {options.map((option) => (
                      <div key={`${option.institution}-${option.programme}`} className="orientation-programme-item">
                        <strong>{option.institution}</strong>
                        <span>{option.programme} {option.degree}</span>
                        <span>{option.teachingLanguage} · {option.languageRequirement}</span>
                      </div>
                    ))}
                  </div>
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
