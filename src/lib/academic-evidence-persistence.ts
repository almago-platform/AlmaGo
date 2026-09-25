import {
  academicEvidenceOrigins,
  academicEvidenceTypes,
  academicEvidenceVerificationStatuses,
  type AcademicEvidenceRecord,
} from "@/lib/academic-evidence";

export type AcademicEvidenceRow = {
  evidence_type: unknown;
  institution: unknown;
  evidence_date: unknown;
  verification_status: unknown;
  document_id: unknown;
  document_status?: unknown;
  verified_at: unknown;
};

export function academicEvidenceFromRow(row: AcademicEvidenceRow): AcademicEvidenceRecord | null {
  if (
    typeof row.evidence_type !== "string"
    || !academicEvidenceTypes.includes(row.evidence_type as (typeof academicEvidenceTypes)[number])
    || typeof row.institution !== "string"
    || !row.institution.trim()
    || typeof row.evidence_date !== "string"
    || typeof row.verification_status !== "string"
    || !academicEvidenceVerificationStatuses.includes(
      row.verification_status as (typeof academicEvidenceVerificationStatuses)[number],
    )
    || typeof row.document_id !== "string"
    || !row.document_id
  ) return null;

  const origin = academicEvidenceOrigins.find((item) => item === "official_document");
  if (!origin) return null;

  return {
    type: row.evidence_type as AcademicEvidenceRecord["type"],
    institution: row.institution.trim(),
    evidence_date: row.evidence_date,
    origin,
    verification_status: row.verification_status as AcademicEvidenceRecord["verification_status"],
    document_id: row.document_id,
    document_status: typeof row.document_status === "string" ? row.document_status : null,
    verified_at: typeof row.verified_at === "string" ? row.verified_at : null,
  };
}
