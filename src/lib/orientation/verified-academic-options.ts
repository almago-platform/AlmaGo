import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export type VerifiedAcademicOption = {
  institution: string;
  programme: string;
  degree: string;
  city: string;
  teachingLanguage: string;
  languageRequirement: string;
  sourceUrl: string;
  verifiedAt: string;
  specialties: string[];
};

type TunisianBacAccessRule = {
  status: "verified" | "needs_human_verification";
  access:
    | "all_except_humanities"
    | "humanities_law_social_sciences"
    | "needs_verification";
  sourceUrl: string;
  verifiedAt: string;
};

const DAAD_TUNISIA_SCIENCE_SOURCE =
  "https://www.daad.de/en/studying-in-germany/requirements/admission-database/?ad-layer=4&ad-layerId=4640";
const DAAD_TUNISIA_LETTERS_SOURCE =
  "https://www.daad.de/en/studying-in-germany/requirements/admission-database/?ad-layer=4&ad-layerId=4016";
const DAAD_TUNISIA_ENTRY_SOURCE =
  "https://www.daad.de/en/studying-in-germany/requirements/admission-database/?ad-layer=3&ad-layerId=3009";

export const TUNISIAN_BAC_ACCESS_RULES: Record<string, TunisianBacAccessRule> = {
  "Sciences expérimentales": {
    status: "verified",
    access: "all_except_humanities",
    sourceUrl: DAAD_TUNISIA_SCIENCE_SOURCE,
    verifiedAt: "2026-10-02",
  },
  "Sciences techniques": {
    status: "verified",
    access: "all_except_humanities",
    sourceUrl: DAAD_TUNISIA_SCIENCE_SOURCE,
    verifiedAt: "2026-10-02",
  },
  Mathématiques: {
    status: "needs_human_verification",
    access: "needs_verification",
    sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
    verifiedAt: "2026-10-02",
  },
  "Économie et gestion": {
    status: "needs_human_verification",
    access: "needs_verification",
    sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
    verifiedAt: "2026-10-02",
  },
  Informatique: {
    status: "needs_human_verification",
    access: "needs_verification",
    sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
    verifiedAt: "2026-10-02",
  },
  Lettres: {
    status: "verified",
    access: "humanities_law_social_sciences",
    sourceUrl: DAAD_TUNISIA_LETTERS_SOURCE,
    verifiedAt: "2026-10-02",
  },
  Sport: {
    status: "needs_human_verification",
    access: "needs_verification",
    sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
    verifiedAt: "2026-10-02",
  },
  other: {
    status: "needs_human_verification",
    access: "needs_verification",
    sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
    verifiedAt: "2026-10-02",
  },
};

const AACHEN_ENGINEERING_OPTIONS: VerifiedAcademicOption[] = [
  {
    institution: "RWTH Aachen University",
    programme: "Elektrotechnik und Informationstechnik",
    degree: "B.Sc.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement: "TestDaF 4 dans les 4 épreuves, DSH-2/3 ou équivalent",
    sourceUrl:
      "https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/",
    verifiedAt: "2026-10-02",
    specialties: ["electrical_electronics"],
  },
  {
    institution: "FH Aachen",
    programme: "Elektrotechnik",
    degree: "B.Eng.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement:
      "B2 pour la candidature internationale ; preuve universitaire supérieure requise pour l'inscription selon le programme",
    sourceUrl:
      "https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng",
    verifiedAt: "2026-10-02",
    specialties: ["electrical_electronics"],
  },
  {
    institution: "FH Aachen",
    programme: "Maschinenbau",
    degree: "B.Eng.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement:
      "B2 pour la candidature internationale ; preuve universitaire supérieure requise pour l'inscription selon le programme",
    sourceUrl:
      "https://www.fh-aachen.de/studium/studiengaenge/maschinenbau-beng-aachen/",
    verifiedAt: "2026-10-02",
    specialties: ["mechanical"],
  },
];

const MUNICH_ENGINEERING_OPTIONS: VerifiedAcademicOption[] = [
  {
    institution: "Technical University of Munich",
    programme: "Informatics",
    degree: "B.Sc.",
    city: "Munich",
    teachingLanguage: "Allemand",
    languageRequirement: "Preuve d'allemand reconnue par TUM ; niveau exact selon la preuve acceptée par le programme",
    sourceUrl:
      "https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc",
    verifiedAt: "2026-09-26",
    specialties: ["computer_engineering"],
  },
];

const SAARBRUECKEN_ENGINEERING_OPTIONS: VerifiedAcademicOption[] = [
  {
    institution: "Saarland University",
    programme: "Computer Science (English)",
    degree: "B.Sc.",
    city: "Sarrebruck",
    teachingLanguage: "Anglais",
    languageRequirement: "Anglais B2 recommandé ; preuve acceptée selon la voie de candidature",
    sourceUrl:
      "https://www.uni-saarland.de/en/study/programmes/bachelor/computer-science.html",
    verifiedAt: "2026-09-26",
    specialties: ["computer_engineering"],
  },
];

const VERIFIED_ENGINEERING_CATALOGUE: Record<string, VerifiedAcademicOption[]> = {
  Aachen: AACHEN_ENGINEERING_OPTIONS,
  Munich: MUNICH_ENGINEERING_OPTIONS,
  Sarrebruck: SAARBRUECKEN_ENGINEERING_OPTIONS,
};

export type VerifiedProgrammeSet = {
  city: string;
  selectionReason: "preferred_city" | "recommended_city";
  options: VerifiedAcademicOption[];
  catalogueGap: boolean;
};

function optionsForSpecialty(city: string, specialty: string) {
  const candidates = VERIFIED_ENGINEERING_CATALOGUE[city] || [];
  if (!specialty || specialty === "undecided") {
    return candidates.slice(0, 3);
  }
  if (specialty === "other") return [];
  return candidates
    .filter((option) => option.specialties.includes(specialty))
    .slice(0, 3);
}

function recommendedEngineeringCity(specialty: string) {
  if (specialty === "computer_engineering") return "Munich";
  return "Aachen";
}

export function getVerifiedProgrammeSet(
  answers: PublicOrientationAnswers,
): VerifiedProgrammeSet | null {
  const wantsBachelor = answers.targetDegree === "Bachelor";
  const wantsEngineering = answers.targetField === "Ingénierie";
  if (!wantsBachelor || !wantsEngineering) return null;

  const specialty = answers.engineeringSpecialty;

  if (answers.preferredCities.length > 0) {
    for (const city of answers.preferredCities) {
      const options = optionsForSpecialty(city, specialty);
      if (options.length > 0) {
        return {
          city,
          selectionReason: "preferred_city",
          options,
          catalogueGap: false,
        };
      }
    }

    return {
      city: answers.preferredCities[0],
      selectionReason: "preferred_city",
      options: [],
      catalogueGap: true,
    };
  }

  const city = recommendedEngineeringCity(specialty);
  const options = optionsForSpecialty(city, specialty);
  return {
    city,
    selectionReason: "recommended_city",
    options,
    catalogueGap: options.length === 0,
  };
}

export function getVerifiedAcademicOptions(
  answers: PublicOrientationAnswers,
): VerifiedAcademicOption[] {
  return getVerifiedProgrammeSet(answers)?.options || [];
}

function isHumanitiesTarget(targetField: string) {
  return targetField === "Lettres/Langues";
}

export function getAcademicAccessConclusion(answers: PublicOrientationAnswers) {
  if (answers.targetDegree !== "Bachelor") {
    return {
      status: "needs_human_verification" as const,
      short: "Accès académique à confirmer",
      detail:
        "Cette base couvre l'orientation Bachelor. Campus Allemagne vérifiera votre diplôme précédent et les conditions du programme visé avant de confirmer une route Master ou autre.",
      sourceUrl: DAAD_TUNISIA_ENTRY_SOURCE,
      verifiedAt: "2026-10-02",
    };
  }

  const rule = TUNISIAN_BAC_ACCESS_RULES[answers.bacTrack || "other"]
    || TUNISIAN_BAC_ACCESS_RULES.other;

  if (rule.status === "needs_human_verification") {
    return {
      status: "needs_human_verification" as const,
      short: "Campus Allemagne vérifie votre accès",
      detail:
        "Votre série de Bac est bien enregistrée, mais nous ne présentons pas de conclusion automatique tant qu'une règle officielle suffisamment précise n'est pas liée à ce profil. Campus Allemagne vérifiera cette étape avec la source officielle avant de confirmer votre route.",
      sourceUrl: rule.sourceUrl,
      verifiedAt: rule.verifiedAt,
    };
  }

  if (rule.access === "all_except_humanities") {
    if (isHumanitiesTarget(answers.targetField)) {
      return {
        status: "verified_subject_mismatch" as const,
        short: "Votre domaine demandé nécessite une autre vérification",
        detail:
          "La règle DAAD/ZAB vérifiée pour cette série donne un accès direct lié au domaine pour les matières hors sciences humaines. Comme votre objectif actuel est en lettres/langues, Campus Allemagne doit vérifier une route académique différente avant de confirmer ce choix.",
        sourceUrl: rule.sourceUrl,
        verifiedAt: rule.verifiedAt,
      };
    }

    return {
      status: "direct_subject_restricted" as const,
      short: "Accès direct possible dans votre domaine",
      detail:
        "Selon la base DAAD/ZAB vérifiée pour cette série tunisienne, un accès direct lié au domaine est possible pour les matières hors sciences humaines. Votre domaine déclaré entre dans cette route ; la décision finale appartient à l'université.",
      sourceUrl: rule.sourceUrl,
      verifiedAt: rule.verifiedAt,
    };
  }

  if (rule.access === "humanities_law_social_sciences") {
    if (answers.targetField === "Lettres/Langues") {
      return {
        status: "direct_subject_restricted" as const,
        short: "Accès direct possible dans votre domaine",
        detail:
          "Selon la base DAAD/ZAB, le Bac tunisien Lettres ouvre un accès direct lié au domaine en sciences humaines, droit et sciences sociales. Votre objectif lettres/langues entre dans cette route ; la décision finale appartient à l'université.",
        sourceUrl: rule.sourceUrl,
        verifiedAt: rule.verifiedAt,
      };
    }

    return {
      status: "verified_subject_mismatch" as const,
      short: "Le domaine demandé ne correspond pas à la route directe vérifiée",
      detail:
        "La règle DAAD/ZAB vérifiée pour le Bac Lettres couvre les sciences humaines, le droit et les sciences sociales. Campus Allemagne doit donc vérifier une autre route si vous souhaitez candidater dans le domaine actuellement sélectionné.",
      sourceUrl: rule.sourceUrl,
      verifiedAt: rule.verifiedAt,
    };
  }

  return {
    status: "needs_human_verification" as const,
    short: "Campus Allemagne vérifie votre accès",
    detail:
      "Nous avons enregistré votre série de Bac, mais une vérification officielle reste nécessaire avant de confirmer la route académique.",
    sourceUrl: rule.sourceUrl,
    verifiedAt: rule.verifiedAt,
  };
}
