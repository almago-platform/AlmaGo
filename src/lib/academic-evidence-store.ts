import {
  assessAcademicEvidence,
  type AcademicEvidenceAssessment,
  type AcademicEvidenceOrigin,
  type AcademicEvidenceType,
  type AcademicEvidenceVerificationStatus,
} from "@/lib/academic-evidence";

export type AcademicEvidenceStoreRow = {
  id: string;
  student_id: string;
  evidence_type: AcademicEvidenceType;
  institution: string | null;
  evidence_date: string | null;
  origin: AcademicEvidenceOrigin;
  verification_status: AcademicEvidenceVerificationStatus;
  document_id: string | null;
  document_status: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentAcademicEvidenceView = {
  id: string;
  type: AcademicEvidenceType;
  institution: string | null;
  evidence_date: string | null;
  origin: AcademicEvidenceOrigin;
  verification_status: AcademicEvidenceVerificationStatus;
  document_id: string | null;
  document_status: string | null;
  verified_at: string | null;
  assessment: AcademicEvidenceAssessment;
};

export type AdminAcademicEvidenceView = StudentAcademicEvidenceView & {
  student_id: string;
  created_at: string;
  updated_at: string;
};

function assessmentInput(row: AcademicEvidenceStoreRow) {
  return {
    type: row.evidence_type,
    institution: row.institution,
    evidence_date: row.evidence_date,
    origin: row.origin,
    verification_status: row.verification_status,
    document_id: row.document_id,
    document_status: row.document_status,
    verified_at: row.verified_at,
  };
}

export function toStudentAcademicEvidenceView(
  row: AcademicEvidenceStoreRow,
  now: Date = new Date(),
): StudentAcademicEvidenceView {
  return {
    id: row.id,
    type: row.evidence_type,
    institution: row.institution,
    evidence_date: row.evidence_date,
    origin: row.origin,
    verification_status: row.verification_status,
    document_id: row.document_id,
    document_status: row.document_status,
    verified_at: row.verified_at,
    assessment: assessAcademicEvidence(assessmentInput(row), now),
  };
}

export function toAdminAcademicEvidenceView(
  row: AcademicEvidenceStoreRow,
  now: Date = new Date(),
): AdminAcademicEvidenceView {
  return {
    ...toStudentAcademicEvidenceView(row, now),
    student_id: row.student_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
