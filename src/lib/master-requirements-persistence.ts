import type {
  ApplicationRoute,
  MasterRequirementProfile,
  VerifiedRequirement,
} from "@/lib/master-requirements";

export const masterRequirementsNamespace = "almago_master_requirements" as const;
export const masterRequirementsSchemaVersion = 1 as const;

type JsonRecord = Record<string, unknown>;

export type MasterRequirementsDocumentV1 = {
  schema_version: typeof masterRequirementsSchemaVersion;
  kind: "master_requirements";
  minimum_ects?: VerifiedRequirement<number>;
  subject_credits?: Array<VerifiedRequirement<number> & { subject: string }>;
  minimum_grade?: VerifiedRequirement<number>;
  prior_degree?: VerifiedRequirement<string>;
  languages?: Array<VerifiedRequirement<string> & { language: string }>;
  intake?: VerifiedRequirement<string>;
  deadline?: VerifiedRequirement<string>;
  application_route?: VerifiedRequirement<ApplicationRoute>;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function copyEvidence<T>(value: VerifiedRequirement<T> | undefined) {
  if (!value) return undefined;
  return {
    value: value.value ?? null,
    free_text: value.free_text ?? null,
    source_url: value.source_url ?? null,
    verified_at: value.verified_at ?? null,
    review_due_at: value.review_due_at ?? null,
  };
}

export function masterRequirementsToDocument(
  profile: MasterRequirementProfile,
): MasterRequirementsDocumentV1 {
  return {
    schema_version: masterRequirementsSchemaVersion,
    kind: "master_requirements",
    minimum_ects: copyEvidence(profile.minimum_ects),
    subject_credits: (profile.subject_credits || []).map((item) => ({
      subject: item.subject,
      ...copyEvidence(item),
    })),
    minimum_grade: copyEvidence(profile.minimum_grade),
    prior_degree: copyEvidence(profile.prior_degree),
    languages: (profile.languages || []).map((item) => ({
      language: item.language,
      ...copyEvidence(item),
    })),
    intake: copyEvidence(profile.intake),
    deadline: copyEvidence(profile.deadline),
    application_route: copyEvidence(profile.application_route),
  };
}

function isNullableString(value: unknown) {
  return value === null || value === undefined || typeof value === "string";
}

function validEvidence(value: unknown) {
  if (!isRecord(value)) return false;
  if (!isNullableString(value.source_url)) return false;
  if (!isNullableString(value.verified_at)) return false;
  if (!isNullableString(value.review_due_at)) return false;
  if (!isNullableString(value.free_text)) return false;
  return true;
}

function validNumericEvidence(value: unknown) {
  return validEvidence(value) &&
    (value.value === null || value.value === undefined || typeof value.value === "number");
}

function validStringEvidence(value: unknown) {
  return validEvidence(value) &&
    (value.value === null || value.value === undefined || typeof value.value === "string");
}

function validRouteEvidence(value: unknown) {
  if (!validStringEvidence(value)) return false;
  if (value.value === null || value.value === undefined) return true;
  return ["direct", "uni_assist", "vpd", "unknown"].includes(value.value);
}

function parseDocument(value: unknown): MasterRequirementsDocumentV1 | null {
  if (!isRecord(value)) return null;
  if (value.schema_version !== masterRequirementsSchemaVersion) return null;
  if (value.kind !== "master_requirements") return null;

  if (value.minimum_ects !== undefined && !validNumericEvidence(value.minimum_ects)) return null;
  if (value.minimum_grade !== undefined && !validNumericEvidence(value.minimum_grade)) return null;
  if (value.prior_degree !== undefined && !validStringEvidence(value.prior_degree)) return null;
  if (value.intake !== undefined && !validStringEvidence(value.intake)) return null;
  if (value.deadline !== undefined && !validStringEvidence(value.deadline)) return null;
  if (value.application_route !== undefined && !validRouteEvidence(value.application_route)) return null;

  if (value.subject_credits !== undefined) {
    if (!Array.isArray(value.subject_credits)) return null;
    for (const item of value.subject_credits) {
      if (!isRecord(item) || typeof item.subject !== "string" || !validNumericEvidence(item)) return null;
    }
  }

  if (value.languages !== undefined) {
    if (!Array.isArray(value.languages)) return null;
    for (const item of value.languages) {
      if (!isRecord(item) || typeof item.language !== "string" || !validStringEvidence(item)) return null;
    }
  }

  return value as MasterRequirementsDocumentV1;
}

export function readMasterRequirementsDocument(
  requirements: unknown,
): MasterRequirementsDocumentV1 | null {
  if (!isRecord(requirements)) return null;
  return parseDocument(requirements[masterRequirementsNamespace]);
}

export function readMasterRequirementProfile(
  requirements: unknown,
): MasterRequirementProfile | null {
  const document = readMasterRequirementsDocument(requirements);
  if (!document) return null;

  const {
    schema_version: _schemaVersion,
    kind: _kind,
    ...profile
  } = document;

  return profile;
}

export function mergeMasterRequirementsIntoProgramRequirements(
  existingRequirements: unknown,
  profile: MasterRequirementProfile,
): JsonRecord {
  const existing = isRecord(existingRequirements) ? existingRequirements : {};
  return {
    ...existing,
    [masterRequirementsNamespace]: masterRequirementsToDocument(profile),
  };
}
