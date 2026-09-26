export const academicEvidenceTypes = [
  "definitive_admission",
  "conditional_admission",
  "bewerberbestaetigung",
  "admissible_university_correspondence",
] as const;

export type AcademicEvidenceType = (typeof academicEvidenceTypes)[number];

export const academicEvidenceVerificationStatuses = [
  "received",
  "needs_review",
  "accepted_for_pathway",
  "replace_required",
] as const;

export type AcademicEvidenceVerificationStatus =
  (typeof academicEvidenceVerificationStatuses)[number];

export const academicEvidenceOrigins = [
  "student_declared",
  "admin_verified_fact",
  "official_document",
] as const;

export type AcademicEvidenceOrigin = (typeof academicEvidenceOrigins)[number];

export type AcademicEvidenceRecord = {
  type: AcademicEvidenceType;
  institution: string | null;
  evidence_date: string | null;
  origin: AcademicEvidenceOrigin;
  verification_status: AcademicEvidenceVerificationStatus;
  document_id: string | null;
  document_status: string | null;
  verified_at: string | null;
};

export type AcademicEvidenceAssessmentStatus =
  | "accepted"
  | "needs_review"
  | "incomplete"
  | "replace_required";

export type AcademicEvidenceBasis =
  | "definitive_admission_basis"
  | "preparatory_academic_basis_candidate"
  | "none";

export type AcademicEvidenceAssessment = {
  status: AcademicEvidenceAssessmentStatus;
  basis: AcademicEvidenceBasis;
  can_support_pathway_decision: boolean;
  reason: string;
};

function validDateOnly(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function basisForType(type: AcademicEvidenceType): AcademicEvidenceBasis {
  return type === "definitive_admission"
    ? "definitive_admission_basis"
    : "preparatory_academic_basis_candidate";
}

export function assessAcademicEvidence(
  evidence: AcademicEvidenceRecord,
  now: Date = new Date(),
): AcademicEvidenceAssessment {
  const basis = basisForType(evidence.type);

  if (evidence.verification_status === "replace_required") {
    return {
      status: "replace_required",
      basis: "none",
      can_support_pathway_decision: false,
      reason: "Le document doit être remplacé avant de pouvoir servir de preuve académique.",
    };
  }

  if (
    !evidence.institution?.trim()
    || !validDateOnly(evidence.evidence_date)
    || (evidence.evidence_date && evidence.evidence_date > now.toISOString().slice(0, 10))
  ) {
    return {
      status: "incomplete",
      basis: "none",
      can_support_pathway_decision: false,
      reason: "Le type de preuve, l’établissement et une date valide doivent être confirmés.",
    };
  }

  if (evidence.origin !== "official_document") {
    return {
      status: "needs_review",
      basis,
      can_support_pathway_decision: false,
      reason: "Une information déclarée ou vérifiée sans document officiel ne suffit pas comme preuve de parcours.",
    };
  }

  if (!evidence.document_id || evidence.document_status !== "approved") {
    return {
      status: "needs_review",
      basis,
      can_support_pathway_decision: false,
      reason: "Le fichier officiel doit être présent et approuvé avant utilisation comme preuve de parcours.",
    };
  }

  if (evidence.verification_status !== "accepted_for_pathway") {
    return {
      status: "needs_review",
      basis,
      can_support_pathway_decision: false,
      reason: "Le document officiel doit encore être accepté explicitement comme preuve de parcours.",
    };
  }

  const verifiedAt = evidence.verified_at ? Date.parse(evidence.verified_at) : Number.NaN;
  if (!Number.isFinite(verifiedAt) || verifiedAt > now.getTime()) {
    return {
      status: "needs_review",
      basis,
      can_support_pathway_decision: false,
      reason: "La vérification administrative de cette preuve doit être datée et valide.",
    };
  }

  return {
    status: "accepted",
    basis,
    can_support_pathway_decision: true,
    reason: "Le document officiel a été vérifié et accepté comme preuve de parcours.",
  };
}

export type AcademicEvidenceSummary = {
  accepted_definitive_admission: boolean;
  accepted_preparatory_basis: boolean;
  has_pending_review: boolean;
  has_replacement_required: boolean;
  accepted_evidence_count: number;
};

export function summarizeAcademicEvidence(
  evidence: AcademicEvidenceRecord[],
  now: Date = new Date(),
): AcademicEvidenceSummary {
  const assessments = evidence.map((item) => assessAcademicEvidence(item, now));
  return {
    accepted_definitive_admission: assessments.some(
      (item) => item.status === "accepted" && item.basis === "definitive_admission_basis",
    ),
    accepted_preparatory_basis: assessments.some(
      (item) => item.status === "accepted" && item.basis === "preparatory_academic_basis_candidate",
    ),
    has_pending_review: assessments.some(
      (item) => item.status === "needs_review" || item.status === "incomplete",
    ),
    has_replacement_required: assessments.some((item) => item.status === "replace_required"),
    accepted_evidence_count: assessments.filter((item) => item.status === "accepted").length,
  };
}
