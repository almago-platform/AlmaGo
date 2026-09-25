import type { ApplicationRoute, MasterRequirementProfile } from "@/lib/master-requirements";
import type { MasterRequirementsDocumentV1 } from "@/lib/master-requirements-persistence";

export type MasterRequirementsFormState = {
  minimum_ects: string;
  subject: string;
  subject_ects: string;
  minimum_grade: string;
  prior_degree: string;
  language: string;
  language_level: string;
  intake: string;
  deadline: string;
  application_route: ApplicationRoute;
  source_url: string;
  verified_at: string;
  review_due_at: string;
  evidence_conflict: boolean;
};

export const emptyMasterRequirementsForm: MasterRequirementsFormState = {
  minimum_ects: "", subject: "", subject_ects: "", minimum_grade: "", prior_degree: "",
  language: "", language_level: "", intake: "", deadline: "", application_route: "unknown",
  source_url: "", verified_at: "", review_due_at: "", evidence_conflict: false,
};

type Evidence = { source_url?: string | null; verified_at?: string | null; review_due_at?: string | null };

function evidenceSignature(value: Evidence | undefined) {
  if (!value) return "";
  return [value.source_url || "", value.verified_at || "", value.review_due_at || ""].join("|");
}

function commonEvidence(document: MasterRequirementsDocumentV1) {
  const values: Evidence[] = [
    document.minimum_ects, document.minimum_grade, document.prior_degree, document.intake,
    document.deadline, document.application_route, ...(document.subject_credits || []), ...(document.languages || []),
  ].filter((value): value is Evidence => Boolean(value));
  const signatures = [...new Set(values.map(evidenceSignature).filter(Boolean))];
  const first = values.find((value) => evidenceSignature(value));
  return { first, conflict: signatures.length > 1 };
}

export function masterRequirementsFormFromDocument(
  document: MasterRequirementsDocumentV1 | null | undefined,
): MasterRequirementsFormState {
  if (!document) return { ...emptyMasterRequirementsForm };
  const evidence = commonEvidence(document);
  const subject = document.subject_credits?.[0];
  const language = document.languages?.[0];
  return {
    minimum_ects: document.minimum_ects?.value == null ? "" : String(document.minimum_ects.value),
    subject: subject?.subject || "",
    subject_ects: subject?.value == null ? "" : String(subject.value),
    minimum_grade: document.minimum_grade?.value == null ? "" : String(document.minimum_grade.value),
    prior_degree: document.prior_degree?.free_text || document.prior_degree?.value || "",
    language: language?.language || "",
    language_level: language?.value || "",
    intake: document.intake?.value || "",
    deadline: document.deadline?.value || "",
    application_route: document.application_route?.value || "unknown",
    source_url: evidence.first?.source_url || "",
    verified_at: (evidence.first?.verified_at || "").slice(0, 10),
    review_due_at: (evidence.first?.review_due_at || "").slice(0, 10),
    evidence_conflict: evidence.conflict,
  };
}

function positiveNumber(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : Number.NaN;
}

function isHttps(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function buildMasterRequirementsDocument(
  form: MasterRequirementsFormState,
): { document?: MasterRequirementsDocumentV1; error?: string } {
  const ects = positiveNumber(form.minimum_ects);
  const subjectEcts = positiveNumber(form.subject_ects);
  const grade = positiveNumber(form.minimum_grade);
  if (Number.isNaN(ects) || Number.isNaN(subjectEcts) || Number.isNaN(grade)) {
    return { error: "Les valeurs numériques doivent être strictement positives." };
  }
  if (Boolean(form.subject.trim()) !== Boolean(form.subject_ects.trim())) {
    return { error: "Renseignez ensemble le domaine et les ECTS correspondants." };
  }
  if (Boolean(form.language.trim()) !== Boolean(form.language_level.trim())) {
    return { error: "Renseignez ensemble la langue et le niveau requis." };
  }

  const hasConfirmedValue = [
    form.minimum_ects, form.subject, form.minimum_grade, form.prior_degree, form.language,
    form.intake, form.deadline,
  ].some((value) => value.trim()) || form.application_route !== "unknown";
  if (!hasConfirmedValue) return {};

  if (!isHttps(form.source_url)) return { error: "Ajoutez une source officielle HTTPS valide." };
  const verified = Date.parse(form.verified_at);
  const review = Date.parse(form.review_due_at);
  const now = Date.now();
  if (!Number.isFinite(verified) || verified > now) return { error: "La date de vérification doit être valide et non future." };
  if (!Number.isFinite(review) || review <= now || review <= verified) {
    return { error: "La date de revue doit être future et postérieure à la vérification." };
  }

  const evidence = {
    source_url: form.source_url.trim(),
    verified_at: new Date(verified).toISOString(),
    review_due_at: new Date(review).toISOString(),
  };
  const profile: MasterRequirementProfile = {};
  if (ects !== null) profile.minimum_ects = { value: ects, ...evidence };
  if (subjectEcts !== null) profile.subject_credits = [{ subject: form.subject.trim(), value: subjectEcts, ...evidence }];
  if (grade !== null) profile.minimum_grade = { value: grade, ...evidence };
  if (form.prior_degree.trim()) profile.prior_degree = { value: null, free_text: form.prior_degree.trim(), ...evidence };
  if (form.language.trim()) profile.languages = [{ language: form.language.trim(), value: form.language_level.trim(), ...evidence }];
  if (form.intake.trim()) profile.intake = { value: form.intake.trim(), ...evidence };
  if (form.deadline.trim()) profile.deadline = { value: form.deadline.trim(), ...evidence };
  profile.application_route = form.application_route === "unknown"
    ? { value: "unknown" }
    : { value: form.application_route, ...evidence };

  return {
    document: {
      schema_version: 1,
      kind: "master_requirements",
      ...profile,
    },
  };
}
