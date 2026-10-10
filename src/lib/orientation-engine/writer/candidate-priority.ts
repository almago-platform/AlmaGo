/**
 * Candidate-facing preparation guidance, derived only from the declared
 * education/language profile. Never infers university eligibility, accepted
 * certificates, or a required language threshold.
 */
export type OrientationPriorityProfile = {
  bacStatus?: string | null;
  bacYear?: string | null;
  germanLevel?: string | null;
  studyLanguage?: string | null;
  targetDegree?: string | null;
};

export type OrientationCandidatePriority = {
  title: string;
  text: string;
  yourStep: string;
};

type OrientationPriorityLocale = "fr" | "ar" | "en" | "de";

function safeYear(value: string | null | undefined): string {
  return /^20\d{2}$/.test(value || "") ? ` ${value}` : "";
}

function safeLevel(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toUpperCase() || "";
  return /^(A1|A2|B1|B2|C1|C2)$/.test(trimmed) ? trimmed : null;
}

function wantsGerman(value: string | null | undefined) {
  return ["allemand", "deutsch", "german", "الألمانية"].includes((value || "").trim().toLowerCase());
}

export function orientationCandidatePriority(
  profile: OrientationPriorityProfile | null,
  locale: OrientationPriorityLocale,
): OrientationCandidatePriority | null {
  if (!profile || profile.targetDegree !== "Bachelor") return null;

  const year = safeYear(profile.bacYear);
  const level = safeLevel(profile.germanLevel);
  const german = wantsGerman(profile.studyLanguage);
  const translations = {
    fr: {
      preparing: {
        title: `Préparez sereinement votre Bac${year}`,
        text: german && level
          ? `Votre Bac est votre priorité. Continuez aussi votre allemand depuis le niveau ${level} que vous avez indiqué. Notre équipe étudie les formations et leurs exigences en parallèle.`
          : "Votre Bac est votre priorité. Notre équipe explore en parallèle les formations correspondant à votre projet en Allemagne.",
        yourStep: "Vous poursuivez votre préparation au Bac ; nous étudions les possibilités d'études en parallèle.",
      },
      noBac: {
        title: "Construisons votre prochaine étape d'études",
        text: "Votre parcours mérite une orientation adaptée. Notre équipe examinera avec vous les possibilités académiques correspondant à votre situation.",
        yourStep: "Vous nous partagez vos objectifs ; nous examinons les voies d'études possibles.",
      },
      language: {
        title: "Continuez votre progression en allemand",
        text: `Vous indiquez un niveau ${level} en allemand. Continuez à progresser à votre rythme ; notre équipe examinera les niveaux et les certificats demandés par chaque programme.`,
        yourStep: "Vous poursuivez votre apprentissage de l'allemand ; nous étudions les exigences officielles.",
      },
      obtained: {
        title: "Précisons les formations pour votre prochaine rentrée",
        text: "Votre Bac est acquis. Notre équipe analyse maintenant les programmes qui correspondent à votre domaine, à vos préférences et à votre budget.",
        yourStep: "Vous nous confiez vos préférences ; notre équipe affine les possibilités d'études.",
      },
    },
    ar: {
      preparing: {
        title: `واصل التحضير للبكالوريا${year} بثقة`,
        text: german && level
          ? `البكالوريا أولويتك الآن. يمكنك أيضًا مواصلة تعلم الألمانية انطلاقًا من المستوى ${level} الذي صرّحت به، بينما يدرس فريقنا البرامج وشروطها.`
          : "البكالوريا أولويتك الآن، بينما يدرس فريقنا البرامج المناسبة لمشروعك في ألمانيا.",
        yourStep: "تواصل التحضير للبكالوريا، ونحن ندرس فرص الدراسة بالتوازي.",
      },
      noBac: {
        title: "لنحدد معًا خطوتك الدراسية القادمة",
        text: "لكل مسار فرصه. سيدرس فريقنا معك الخيارات الأكاديمية المناسبة لوضعك.",
        yourStep: "تشاركنا أهدافك، ونحن نبحث الخيارات الأكاديمية المناسبة.",
      },
      language: {
        title: "واصل تطوير لغتك الألمانية",
        text: `أشرت إلى أن مستواك في الألمانية هو ${level}. واصل التقدم على وتيرتك، وسيتحقق فريقنا من المستوى والشهادات المطلوبة لكل برنامج.`,
        yourStep: "تواصل تعلم الألمانية، ونحن نراجع الشروط الرسمية.",
      },
      obtained: {
        title: "لنحدد برامج الدراسة المناسبة لخطوتك القادمة",
        text: "لقد حصلت على البكالوريا. يدرس فريقنا الآن البرامج المناسبة لمجالك وتفضيلاتك وميزانيتك.",
        yourStep: "تشاركنا تفضيلاتك، ونحن ندرس الخيارات الدراسية.",
      },
    },
    en: {
      preparing: {
        title: `Keep preparing for your Baccalaureate${year}`,
        text: german && level
          ? `Your Baccalaureate is your first priority. You can also keep building on your declared ${level} German level while our team reviews the programmes and their requirements.`
          : "Your Baccalaureate comes first. Our team is exploring degree programmes that match your plans in Germany.",
        yourStep: "You focus on your Baccalaureate while we research your study options.",
      },
      noBac: {
        title: "Let's explore your next study step",
        text: "Every educational background deserves a suitable pathway. Our team will explore the academic options for your situation.",
        yourStep: "You tell us your goals; we examine possible study pathways.",
      },
      language: {
        title: "Keep building your German skills",
        text: `You have declared a ${level} German level. Continue learning at your pace; our team will check each programme's language and certificate requirements.`,
        yourStep: "You keep learning German while we review official requirements.",
      },
      obtained: {
        title: "Let's narrow down the programmes for your next intake",
        text: "You have earned your Baccalaureate. Our team is now exploring programmes that fit your field, preferences and budget.",
        yourStep: "You share your preferences; we refine your study options.",
      },
    },
    de: {
      preparing: {
        title: `Bereite dich weiter auf dein Abitur${year} vor`,
        text: german && level
          ? `Dein Schulabschluss hat jetzt Vorrang. Du kannst auch mit deinem angegebenen Deutschniveau ${level} weiterlernen, während unser Team die Studiengänge und Anforderungen prüft.`
          : "Dein Schulabschluss hat jetzt Vorrang. Unser Team erkundet parallel passende Studiengänge in Deutschland.",
        yourStep: "Du bereitest deinen Schulabschluss vor, wir recherchieren parallel Studienmöglichkeiten.",
      },
      noBac: {
        title: "Lass uns deinen nächsten Bildungsweg finden",
        text: "Jeder Bildungsweg verdient eine passende Beratung. Unser Team prüft die möglichen akademischen Optionen für deine Situation.",
        yourStep: "Du teilst deine Ziele mit, wir prüfen die möglichen Studienwege.",
      },
      language: {
        title: "Baue deine Deutschkenntnisse weiter aus",
        text: `Du hast Deutschkenntnisse auf dem Niveau ${level} angegeben. Lerne in deinem Tempo weiter; unser Team prüft Sprach- und Zertifikatsanforderungen der Studiengänge.`,
        yourStep: "Du lernst weiter Deutsch, wir prüfen die offiziellen Anforderungen.",
      },
      obtained: {
        title: "Wir vergleichen Studiengänge für deinen nächsten Studienstart",
        text: "Du hast deinen Schulabschluss erreicht. Unser Team sucht passende Studiengänge nach Fach, Wünschen und Budget.",
        yourStep: "Du teilst deine Wünsche mit, wir vergleichen Studienmöglichkeiten.",
      },
    },
  } satisfies Record<OrientationPriorityLocale, Record<string, OrientationCandidatePriority>>;

  const messages = translations[locale];
  if (profile.bacStatus === "preparing") return messages.preparing;
  if (profile.bacStatus === "no_bac") return messages.noBac;
  if (profile.bacStatus === "obtained") {
    if (german && level && !["C1", "C2"].includes(level)) return messages.language;
    return messages.obtained;
  }
  return null;
}
