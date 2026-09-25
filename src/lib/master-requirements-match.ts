import type { ApplicationRoute, MasterRequirementProfile, RequirementResolution } from "@/lib/master-requirements";
import {
  resolveApplicationRoute,
  resolvePositiveNumber,
  resolveVerifiedValue,
} from "@/lib/master-requirements";

export type RequirementMatchStatus =
  | "satisfied"
  | "not_satisfied"
  | "unknown"
  | "needs_manual_review";

export type StudentProjectForMasterMatch = {
  current_diploma?: string | null;
  current_german_level?: string | null;
  target_intake?: string | null;
};

export type RequirementMatchResult = {
  criterion: string;
  status: RequirementMatchStatus;
  student_value: string | number | null;
  required_value: string | number | null;
  reason: string;
};

export type MasterRequirementsMatch = {
  criteria: RequirementMatchResult[];
  application_route: ApplicationRoute;
  has_blocking_mismatch: boolean;
  has_unknowns: boolean;
  needs_manual_review: boolean;
};

function unavailable<T>(
  criterion: string,
  resolved: RequirementResolution<T>,
): RequirementMatchResult | null {
  if (resolved.status === "verified") return null;
  return {
    criterion,
    status: resolved.status === "unknown" ? "unknown" : "needs_manual_review",
    student_value: null,
    required_value: null,
    reason: resolved.reason,
  };
}

const normalized = (value: string | null | undefined) => (value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

function cefrRank(value: string | null | undefined) {
  const match = normalized(value).toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  return match ? ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(match[1]) : null;
}

function intakeFamily(value: string | null | undefined) {
  const text = normalized(value);
  if (!text) return null;
  if (text.includes("winter") || text.includes("hiver") || /(^|\s)ws(\s|$)/.test(text)) return "winter";
  if (text.includes("summer") || text.includes("sommer") || text.includes("ete") || /(^|\s)ss(\s|$)/.test(text)) return "summer";
  return null;
}

function unavailableStudent(
  criterion: string,
  required: string | number | null,
  reason: string,
): RequirementMatchResult {
  return { criterion, status: "unknown", student_value: null, required_value: required, reason };
}

export function matchMasterRequirements(
  project: StudentProjectForMasterMatch,
  profile: MasterRequirementProfile,
  now: Date = new Date(),
): MasterRequirementsMatch {
  const criteria: RequirementMatchResult[] = [];

  const ects = resolvePositiveNumber(profile.minimum_ects, now);
  const ectsUnavailable = unavailable("minimum_ects", ects);
  if (ectsUnavailable) criteria.push(ectsUnavailable);
  else if (ects.value !== null) {
    criteria.push(unavailableStudent(
      "minimum_ects",
      ects.value,
      "Les ECTS totaux de l’étudiant ne sont pas structurés dans le projet.",
    ));
  }

  for (const item of profile.subject_credits || []) {
    const required = resolvePositiveNumber(item, now);
    const criterion = `subject_credits:${item.subject}`;
    const ruleUnavailable = unavailable(criterion, required);
    criteria.push(ruleUnavailable || unavailableStudent(
      criterion,
      required.value,
      "Les crédits par matière de l’étudiant ne sont pas structurés dans le projet.",
    ));
  }

  const grade = resolvePositiveNumber(profile.minimum_grade, now);
  const gradeUnavailable = unavailable("minimum_grade", grade);
  if (gradeUnavailable) criteria.push(gradeUnavailable);
  else if (grade.value !== null) {
    criteria.push(unavailableStudent(
      "minimum_grade",
      grade.value,
      "Aucune note étudiante comparable et normalisée n’est disponible.",
    ));
  }

  if (profile.prior_degree) {
    const degree = resolveVerifiedValue(profile.prior_degree, now);
    const degreeUnavailable = unavailable("prior_degree", degree);
    if (degreeUnavailable) criteria.push(degreeUnavailable);
    else if (!project.current_diploma) {
      criteria.push(unavailableStudent("prior_degree", degree.value, "Diplôme actuel non renseigné."));
    } else {
      criteria.push({
        criterion: "prior_degree",
        status: "needs_manual_review",
        student_value: project.current_diploma,
        required_value: degree.value,
        reason: "La compatibilité du diplôme doit être confirmée manuellement.",
      });
    }
  }

  for (const item of profile.languages || []) {
    const required = resolveVerifiedValue(item, now);
    const criterion = `language:${item.language}`;
    const ruleUnavailable = unavailable(criterion, required);
    if (ruleUnavailable) {
      criteria.push(ruleUnavailable);
      continue;
    }

    if (normalized(item.language) !== "german" && normalized(item.language) !== "allemand" && normalized(item.language) !== "deutsch") {
      criteria.push(unavailableStudent(
        criterion,
        required.value,
        "Le niveau étudiant pour cette langue n’est pas structuré.",
      ));
      continue;
    }

    const studentRank = cefrRank(project.current_german_level);
    const requiredRank = cefrRank(String(required.value || ""));
    if (studentRank === null) {
      criteria.push(unavailableStudent(criterion, required.value, "Niveau d’allemand étudiant absent ou non comparable."));
    } else if (requiredRank === null) {
      criteria.push({
        criterion,
        status: "needs_manual_review",
        student_value: project.current_german_level || null,
        required_value: required.value,
        reason: "Le niveau requis n’est pas un niveau CEFR comparable.",
      });
    } else {
      criteria.push({
        criterion,
        status: studentRank >= requiredRank ? "satisfied" : "not_satisfied",
        student_value: project.current_german_level || null,
        required_value: required.value,
        reason: studentRank >= requiredRank
          ? "Le niveau d’allemand déclaré atteint le niveau requis."
          : "Le niveau d’allemand déclaré est inférieur au niveau requis.",
      });
    }
  }

  if (profile.intake) {
    const intake = resolveVerifiedValue(profile.intake, now);
    const ruleUnavailable = unavailable("intake", intake);
    if (ruleUnavailable) criteria.push(ruleUnavailable);
    else {
      const studentIntake = intakeFamily(project.target_intake);
      const requiredIntake = intakeFamily(String(intake.value || ""));
      if (!studentIntake) criteria.push(unavailableStudent("intake", intake.value, "Rentrée étudiante absente ou non structurée."));
      else if (!requiredIntake) {
        criteria.push({
          criterion: "intake",
          status: "needs_manual_review",
          student_value: project.target_intake || null,
          required_value: intake.value,
          reason: "La rentrée du programme n’est pas comparable automatiquement.",
        });
      } else {
        criteria.push({
          criterion: "intake",
          status: studentIntake === requiredIntake ? "satisfied" : "not_satisfied",
          student_value: project.target_intake || null,
          required_value: intake.value,
          reason: studentIntake === requiredIntake ? "La rentrée correspond au projet." : "La rentrée ne correspond pas au projet.",
        });
      }
    }
  }

  if (profile.deadline) {
    const deadline = resolveVerifiedValue(profile.deadline, now);
    const ruleUnavailable = unavailable("deadline", deadline);
    if (ruleUnavailable) criteria.push(ruleUnavailable);
    else {
      const value = String(deadline.value || "");
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
      criteria.push(valid
        ? {
            criterion: "deadline",
            status: value >= now.toISOString().slice(0, 10) ? "satisfied" : "not_satisfied",
            student_value: null,
            required_value: value,
            reason: value >= now.toISOString().slice(0, 10) ? "La deadline est encore ouverte." : "La deadline est dépassée.",
          }
        : {
            criterion: "deadline",
            status: "needs_manual_review",
            student_value: null,
            required_value: deadline.value,
            reason: "La deadline vérifiée n’est pas une date structurée comparable.",
          });
    }
  }

  const route = resolveApplicationRoute(profile.application_route, now);
  const applicationRoute: ApplicationRoute = route.status === "verified" && route.value ? route.value : "unknown";

  return {
    criteria,
    application_route: applicationRoute,
    has_blocking_mismatch: criteria.some((item) => item.status === "not_satisfied"),
    has_unknowns: criteria.some((item) => item.status === "unknown"),
    needs_manual_review: criteria.some((item) => item.status === "needs_manual_review"),
  };
}
