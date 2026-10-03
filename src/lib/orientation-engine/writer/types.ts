import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationSelectionResult } from "@/lib/orientation-engine/selection/types";

export type OrientationWriterLocale = "fr" | "ar" | "en" | "de";

export type OrientationWriterCampusOption = {
  code: string;
  label: string;
  description: string;
};

export type OrientationWriterAvailableAction = {
  id: string;
  label: string;
  description: string;
};

export type OrientationWriterInput = {
  locale: OrientationWriterLocale;
  profile: PublicOrientationAnswers;
  selection: OrientationSelectionResult;
  academicAccessStatus?: string | null;
  campusOptions?: readonly OrientationWriterCampusOption[];
  availableActions?: readonly OrientationWriterAvailableAction[];
};

export type OrientationWriterPriority = {
  title: string;
  text: string;
  nextStep: string;
};

export type OrientationWriterLanguagePlan = {
  show: boolean;
  currentLevel: string | null;
  nextLevel: string | null;
  text: string;
  availablePaths: string[];
};

export type OrientationWriterStudyOption = {
  optionId: string;
  position: number;
  institution: string;
  programme: string;
  city: string | null;
  whyItFits: string;
  verificationNote: string;
};

export type OrientationWriterRoadmapItem = {
  id: string;
  label: string;
  text: string;
};

export type OrientationWriterCta = {
  actionId: string;
  label: string;
  text: string;
};

export type OrientationWriterContent = {
  opening: string;
  projectStatus: string;
  mainPriority: OrientationWriterPriority;
  languagePlan: OrientationWriterLanguagePlan;
  campusValue: string;
  studyOptions: OrientationWriterStudyOption[];
  roadmap: OrientationWriterRoadmapItem[];
  reassurance: string;
  cta: OrientationWriterCta;
};

export type OrientationWriterUsage = {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
};

export type OrientationWriterStatus = "ready" | "fallback";

export type OrientationWriterReason =
  | "feature_disabled"
  | "missing_credentials"
  | "no_selection"
  | "provider_error"
  | "invalid_output"
  | null;

export type OrientationWriterResult = {
  provider: "gemini" | "deterministic";
  model: string | null;
  status: OrientationWriterStatus;
  reason: OrientationWriterReason;
  content: OrientationWriterContent;
  usage: OrientationWriterUsage;
};
