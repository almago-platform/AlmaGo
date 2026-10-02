import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export const ORIENTATION_ENGINE_VERSION = "orientation-v4-bachelor-letter-scout-1";

export type OrientationRuleStatus =
  | "eligible"
  | "likely_eligible"
  | "conditional"
  | "missing_information"
  | "not_eligible"
  | "unknown";

export type OrientationInformationConfidence = "high" | "medium" | "incomplete";

export type OrientationSourceKind =
  | "university"
  | "daad_zab"
  | "uni_assist"
  | "hochschulkompass"
  | "anabin"
  | "authority"
  | "almago_verified";

export type OrientationSource = {
  kind: OrientationSourceKind;
  label: string;
  url: string;
  verifiedAt: string | null;
};

export type OrientationRuleCode =
  | "degree_match"
  | "field_match"
  | "language_satisfied"
  | "teaching_language_match"
  | "teaching_language_other"
  | "language_missing"
  | "language_insufficient"
  | "preferred_city"
  | "other_city"
  | "academic_access_supported"
  | "academic_access_review"
  | "master_subject_credits_satisfied"
  | "master_subject_credits_missing"
  | "master_subject_credits_insufficient"
  | "master_curriculum_unknown"
  | "intake_match"
  | "intake_unavailable"
  | "intake_unknown"
  | "deadline_open"
  | "deadline_closed"
  | "deadline_to_verify"
  | "deadline_unknown"
  | "studienkolleg_required"
  | "uni_assist_required"
  | "source_verified"
  | "source_incomplete"
  | "budget_not_verified";

export type OrientationRuleResult = {
  code: OrientationRuleCode;
  status: OrientationRuleStatus;
  value?: string | boolean | null;
  source?: OrientationSource;
};

export type OrientationProgrammeRecord = {
  id: string;
  name: string;
  degreeLevel: string;
  field: string | null;
  teachingLanguage: string | null;
  germanLevelRequired: string | null;
  englishLevelRequired: string | null;
  studienkollegRequired: boolean;
  uniAssistRequired: boolean;
  intakeTerms: string[];
  winterDeadline: string | null;
  summerDeadline: string | null;
  applicationUrl: string | null;
  programmeSourceUrl: string | null;
  programmeVerifiedAt: string | null;
  masterAcademicPrerequisites?: Array<{
    subject: string;
    ects: number;
  }>;
  university: {
    id: string;
    name: string;
    city: string | null;
    bundesland: string | null;
    universityType: string | null;
    isPublic: boolean;
    websiteUrl: string | null;
    sourceUrl: string | null;
    verifiedAt: string | null;
  };
};

export type OrientationRecommendationCategory =
  | "conditions_well_covered"
  | "fits_preferences"
  | "conditions_to_complete";

export type OrientationProgrammeEvaluation = {
  programme: OrientationProgrammeRecord;
  status: OrientationRuleStatus;
  category: OrientationRecommendationCategory;
  relevanceScore: number;
  rules: OrientationRuleResult[];
  why: OrientationRuleCode[];
  missingInformation: OrientationRuleCode[];
  warnings: OrientationRuleCode[];
  sources: OrientationSource[];
  informationConfidence: OrientationInformationConfidence;
};

export type OrientationActionCode =
  | "confirm_academic_access"
  | "improve_german"
  | "improve_english"
  | "verify_language_certificate"
  | "prepare_academic_documents"
  | "verify_programme_requirements"
  | "prepare_uni_assist"
  | "watch_deadline"
  | "prepare_financing"
  | "prepare_visa_after_admission";

export type OrientationActionItem = {
  code: OrientationActionCode;
  phase: "now" | "next" | "after_admission";
  programmeId?: string;
};

export type OrientationMissingFieldCode =
  | "previous_diploma"
  | "master_subject_credits"
  | "engineering_specialty"
  | "target_intake"
  | "study_language"
  | "preferred_city";

export type OrientationRefinementReasonCode =
  | "master_prior_degree_needed"
  | "master_subject_credits_needed"
  | "engineering_specialty_needed"
  | "deadline_evaluation_needs_intake"
  | "teaching_language_choice_changes_options"
  | "city_choice_changes_ranking";

export type OrientationMissingInformationItem = {
  field: OrientationMissingFieldCode;
  reason: OrientationRefinementReasonCode;
  affectedRecommendationIds: string[];
};

export type OrientationRefinementQuestion = OrientationMissingInformationItem & {
  choices: string[];
  subjectKey?: string;
  requiredEcts?: number;
};

export type OrientationRefinementState = {
  missing: OrientationMissingInformationItem[];
  nextQuestion: OrientationRefinementQuestion | null;
};


export type OrientationEngineResult = {
  engineVersion: string;
  profile: PublicOrientationAnswers;
  academicAccessStatus: OrientationRuleStatus;
  academicAccessSource: OrientationSource | null;
  recommendations: OrientationProgrammeEvaluation[];
  missingInformation: OrientationRuleCode[];
  refinement: OrientationRefinementState;
  actionPlan: OrientationActionItem[];
  warnings: OrientationRuleCode[];
  generatedFrom: "verified_catalogue";
};

export type OrientationAdvisorInput = {
  locale: "fr" | "ar" | "en" | "de";
  profile: PublicOrientationAnswers;
  engineResult: OrientationEngineResult;
};

export type OrientationAdvisorOutput = {
  provider: string;
  mode: "deterministic" | "llm";
  summaryCode:
    | "ready_to_compare"
    | "conditions_to_complete"
    | "academic_review_needed"
    | "catalogue_gap";
  priorityActionCodes: OrientationActionCode[];
};


export type OrientationScoutCandidate = {
  institution: string;
  programme: string;
  city: string | null;
  officialUrl: string;
  reason: string;
  verificationStatus: "research_candidate";
};

export type OrientationScoutResult = {
  provider: string;
  mode: "disabled" | "grounded_ai";
  status: "disabled" | "ready" | "unavailable";
  candidates: OrientationScoutCandidate[];
  citationUrls: string[];
};

export type OrientationLetterOutput = {
  provider: string;
  mode: "deterministic" | "grounded_ai";
  title: string;
  paragraphs: string[];
  closing: string;
  scoutUsed: boolean;
};
