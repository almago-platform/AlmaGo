import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationMissingInformationItem,
  OrientationProgrammeEvaluation,
  OrientationRefinementQuestion,
  OrientationRefinementState,
} from "@/lib/orientation-engine/types";

const engineeringChoices = [
  "computer_engineering",
  "electrical_electronics",
  "mechanical",
  "mechatronics_robotics",
  "civil",
  "industrial_production",
  "automotive",
  "aerospace",
  "energy",
] as const;

function uniqueIds(evaluations: OrientationProgrammeEvaluation[]) {
  return [...new Set(evaluations.map((evaluation) => evaluation.programme.id))];
}

function preferredCityValue(city: string) {
  if (city === "Saarbrücken") return "Sarrebruck";
  return city;
}

function item(
  field: OrientationMissingInformationItem["field"],
  reason: OrientationMissingInformationItem["reason"],
  evaluations: OrientationProgrammeEvaluation[],
): OrientationMissingInformationItem {
  return {
    field,
    reason,
    affectedRecommendationIds: uniqueIds(evaluations),
  };
}

function question(
  missing: OrientationMissingInformationItem,
  choices: string[],
  details?: Pick<OrientationRefinementQuestion, "subjectKey" | "requiredEcts">,
): OrientationRefinementQuestion {
  return {
    ...missing,
    choices,
    ...details,
  };
}

export function buildOrientationRefinementState(
  profile: PublicOrientationAnswers,
  evaluations: OrientationProgrammeEvaluation[],
): OrientationRefinementState {
  const missing: OrientationMissingInformationItem[] = [];

  const plausibleCandidates = evaluations.filter((evaluation) => {
    const degreeRule = evaluation.rules.find((rule) => rule.code === "degree_match");
    const fieldRule = evaluation.rules.find((rule) => rule.code === "field_match");
    return degreeRule?.status === "eligible" && fieldRule?.status !== "not_eligible";
  });

  if (profile.targetDegree === "Master" && !profile.lastDiploma) {
    missing.push(item(
      "previous_diploma",
      "master_prior_degree_needed",
      plausibleCandidates,
    ));
  }

  const masterPrerequisiteGroups = new Map<string, {
    requiredEcts: number;
    evaluations: OrientationProgrammeEvaluation[];
  }>();

  if (profile.targetDegree === "Master" && profile.lastDiploma) {
    for (const evaluation of plausibleCandidates) {
      for (const prerequisite of evaluation.programme.masterAcademicPrerequisites || []) {
        if (profile.masterSubjectCredits?.[prerequisite.subject] !== undefined) continue;
        const current = masterPrerequisiteGroups.get(prerequisite.subject);
        if (current) {
          current.requiredEcts = Math.max(current.requiredEcts, prerequisite.ects);
          current.evaluations.push(evaluation);
        } else {
          masterPrerequisiteGroups.set(prerequisite.subject, {
            requiredEcts: prerequisite.ects,
            evaluations: [evaluation],
          });
        }
      }
    }
  }

  const nextMasterPrerequisite = [...masterPrerequisiteGroups.entries()]
    .sort((a, b) => {
      const impact = b[1].evaluations.length - a[1].evaluations.length;
      return impact !== 0 ? impact : a[0].localeCompare(b[0]);
    })[0] || null;

  if (nextMasterPrerequisite) {
    missing.push(item(
      "master_subject_credits",
      "master_subject_credits_needed",
      nextMasterPrerequisite[1].evaluations,
    ));
  }

  if (
    profile.targetField === "Ingénierie"
    && profile.engineeringSpecialty === "undecided"
  ) {
    missing.push(item(
      "engineering_specialty",
      "engineering_specialty_needed",
      plausibleCandidates,
    ));
  }

  const timingSensitive = plausibleCandidates.filter((evaluation) =>
    evaluation.programme.intakeTerms.length > 0
    || Boolean(evaluation.programme.winterDeadline || evaluation.programme.summerDeadline)
  );
  if (
    (!profile.targetIntakeSeason || !profile.targetIntakeYear)
    && timingSensitive.length > 0
  ) {
    missing.push(item(
      "target_intake",
      "deadline_evaluation_needs_intake",
      timingSensitive,
    ));
  }

  const languageSensitive = plausibleCandidates.filter((evaluation) =>
    Boolean(evaluation.programme.teachingLanguage)
  );
  if (profile.studyLanguage === "À définir" && languageSensitive.length > 0) {
    missing.push(item(
      "study_language",
      "teaching_language_choice_changes_options",
      languageSensitive,
    ));
  }

  const citySensitive = plausibleCandidates.filter((evaluation) =>
    Boolean(evaluation.programme.university.city)
  );
  const cityChoices = [...new Set(
    citySensitive
      .map((evaluation) => evaluation.programme.university.city)
      .filter((city): city is string => Boolean(city))
      .map(preferredCityValue),
  )];

  if (profile.preferredCities.length === 0 && cityChoices.length > 1) {
    missing.push(item(
      "preferred_city",
      "city_choice_changes_ranking",
      citySensitive,
    ));
  }

  const next = missing[0] || null;
  if (!next) {
    return {
      missing,
      nextQuestion: null,
    };
  }

  const choices = next.field === "previous_diploma"
    ? ["Licence", "Master", "Bac + 2", "Bac + 1", "Baccalauréat", "other"]
    : next.field === "master_subject_credits"
      ? []
      : next.field === "engineering_specialty"
        ? [...engineeringChoices]
        : next.field === "target_intake"
          ? ["winter", "summer"]
          : next.field === "study_language"
            ? ["Allemand", "Anglais", "Allemand et anglais"]
            : cityChoices;

  const masterDetails = next.field === "master_subject_credits" && nextMasterPrerequisite
    ? {
        subjectKey: nextMasterPrerequisite[0],
        requiredEcts: nextMasterPrerequisite[1].requiredEcts,
      }
    : undefined;

  return {
    missing,
    nextQuestion: question(next, choices, masterDetails),
  };
}
