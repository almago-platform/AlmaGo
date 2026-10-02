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
};

const AACHEN_ENGINEERING_OPTIONS: VerifiedAcademicOption[] = [
  {
    institution: "RWTH Aachen University",
    programme: "Elektrotechnik und Informationstechnik",
    degree: "B.Sc.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement: "TestDaF 4 dans les 4 épreuves, DSH-2/3 ou équivalent",
    sourceUrl: "https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/",
    verifiedAt: "2026-10-02",
  },
  {
    institution: "FH Aachen",
    programme: "Elektrotechnik",
    degree: "B.Eng.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement: "B2 pour la candidature internationale ; preuve universitaire supérieure requise pour l'inscription selon le programme",
    sourceUrl: "https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng",
    verifiedAt: "2026-10-02",
  },
  {
    institution: "FH Aachen",
    programme: "Maschinenbau",
    degree: "B.Eng.",
    city: "Aachen",
    teachingLanguage: "Allemand",
    languageRequirement: "B2 pour la candidature internationale ; preuve universitaire supérieure requise pour l'inscription selon le programme",
    sourceUrl: "https://www.fh-aachen.de/studium/studiengaenge/maschinenbau-beng-aachen/",
    verifiedAt: "2026-10-02",
  },
];

export function getVerifiedAcademicOptions(
  answers: PublicOrientationAnswers,
): VerifiedAcademicOption[] {
  const wantsAachen = answers.preferredCities.includes("Aachen");
  const wantsBachelor = answers.targetDegree === "Bachelor";
  const wantsEngineering = answers.targetField === "Ingénierie";

  if (wantsAachen && wantsBachelor && wantsEngineering) {
    return AACHEN_ENGINEERING_OPTIONS;
  }

  return [];
}

export function getAcademicAccessConclusion(answers: PublicOrientationAnswers) {
  if (
    answers.targetDegree === "Bachelor"
    && answers.bacTrack === "Sciences techniques"
  ) {
    return {
      status: "direct_subject_restricted" as const,
      short: "Accès direct possible en ingénierie",
      detail:
        "Selon la base DAAD/ZAB, le Bac tunisien Sciences techniques ouvre un accès direct lié au domaine à tous les domaines sauf les sciences humaines. L'ingénierie entre donc dans la route académique possible ; la décision finale appartient à l'université.",
      sourceUrl:
        "https://www.daad.de/en/studying-in-germany/requirements/admission-database/?ad-layer=4&ad-layerId=4640",
      verifiedAt: "2026-10-02",
    };
  }

  return {
    status: "not_mapped" as const,
    short: "Accès académique à préciser",
    detail:
      "Le profil n'est pas encore couvert par la règle V3 dédiée. Campus Allemagne ne doit pas inventer une conclusion sans source officielle correspondante.",
    sourceUrl:
      "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    verifiedAt: "2026-10-02",
  };
}
