export const PUBLIC_ORIENTATION_SESSION_KEY = "almago_phase2_orientation_v1";

export type PublicOrientationBacStatus = "" | "obtained" | "preparing" | "no_bac";
export type PublicOrientationAverageType = "" | "official" | "current_estimate";
export type PublicOrientationIntakeSeason = "" | "winter" | "summer";
export type PublicOrientationHigherEducationStatus =
  | ""
  | "not_started"
  | "currently_enrolled"
  | "interrupted"
  | "completed";
export type PublicOrientationStudyIntent =
  | ""
  | "continue_same_field"
  | "transfer_credits"
  | "restart_bachelor"
  | "switch_field"
  | "master_after_degree"
  | "not_sure";
export type PublicOrientationMasterSubjectCredits = Record<string, string>;

export type PublicOrientationAnswers = {
  bacStatus: PublicOrientationBacStatus;
  bacYear: string;
  bacTrack: string;
  generalAverage: string;
  averageType: PublicOrientationAverageType;
  lastDiploma: string;
  higherEducationStatus: PublicOrientationHigherEducationStatus;
  currentStudyField: string;
  universitySemesters: string;
  studyIntent: PublicOrientationStudyIntent;
  targetSpecialization: string;
  targetDegree: string;
  targetField: string;
  engineeringSpecialty: string;
  germanLevel: string;
  englishLevel: string;
  studyLanguage: string;
  targetIntakeSeason: PublicOrientationIntakeSeason;
  targetIntakeYear: string;
  budgetRange: string;
  preferredCities: string[];
  masterSubjectCredits?: PublicOrientationMasterSubjectCredits;
};

export function createEmptyPublicOrientationAnswers(): PublicOrientationAnswers {
  return {
    bacStatus: "",
    bacYear: "",
    bacTrack: "",
    generalAverage: "",
    averageType: "",
    lastDiploma: "",
    higherEducationStatus: "",
    currentStudyField: "",
    universitySemesters: "",
    studyIntent: "",
    targetSpecialization: "",
    targetDegree: "",
    targetField: "",
    engineeringSpecialty: "",
    germanLevel: "",
    englishLevel: "",
    studyLanguage: "",
    targetIntakeSeason: "",
    targetIntakeYear: "",
    budgetRange: "",
    preferredCities: [],
    masterSubjectCredits: {},
  };
}

function readString(record: Record<string, unknown>, key: keyof PublicOrientationAnswers) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

export function normalizePublicOrientationAverageType({
  bacStatus,
  generalAverage,
  averageType,
}: {
  bacStatus: PublicOrientationBacStatus;
  generalAverage: string;
  averageType?: unknown;
}): PublicOrientationAverageType {
  if (!generalAverage) return "";

  if (bacStatus === "obtained") return "official";
  if (bacStatus === "preparing") return "current_estimate";

  return averageType === "official" || averageType === "current_estimate"
    ? averageType
    : "";
}

export function restorePublicOrientationAnswers(value: unknown): PublicOrientationAnswers {
  if (!value || typeof value !== "object") return createEmptyPublicOrientationAnswers();
  const record = value as Record<string, unknown>;
  const rawBacStatus = readString(record, "bacStatus");
  const bacStatus: PublicOrientationBacStatus =
    rawBacStatus === "obtained" || rawBacStatus === "preparing" || rawBacStatus === "no_bac"
      ? rawBacStatus
      : "";
  const generalAverage = readString(record, "generalAverage");
  const rawHigherEducationStatus = readString(record, "higherEducationStatus");
  const higherEducationStatus: PublicOrientationHigherEducationStatus =
    rawHigherEducationStatus === "not_started"
    || rawHigherEducationStatus === "currently_enrolled"
    || rawHigherEducationStatus === "interrupted"
    || rawHigherEducationStatus === "completed"
      ? rawHigherEducationStatus
      : "";
  const rawStudyIntent = readString(record, "studyIntent");
  const studyIntent: PublicOrientationStudyIntent =
    rawStudyIntent === "continue_same_field"
    || rawStudyIntent === "transfer_credits"
    || rawStudyIntent === "restart_bachelor"
    || rawStudyIntent === "switch_field"
    || rawStudyIntent === "master_after_degree"
    || rawStudyIntent === "not_sure"
      ? rawStudyIntent
      : "";
  const rawTargetIntakeSeason = readString(record, "targetIntakeSeason");
  const targetIntakeSeason: PublicOrientationIntakeSeason =
    rawTargetIntakeSeason === "winter" || rawTargetIntakeSeason === "summer"
      ? rawTargetIntakeSeason
      : "";
  const preferredCities = Array.isArray(record.preferredCities)
    ? record.preferredCities
        .filter(
          (city): city is string =>
            typeof city === "string"
            && city.trim().length > 0
            && city.length <= 80,
        )
        .slice(0, 3)
    : [];
  const rawMasterSubjectCredits =
    record.masterSubjectCredits
    && typeof record.masterSubjectCredits === "object"
    && !Array.isArray(record.masterSubjectCredits)
      ? record.masterSubjectCredits as Record<string, unknown>
      : {};
  const masterSubjectCredits = Object.fromEntries(
    Object.entries(rawMasterSubjectCredits)
      .filter(([key, credits]) =>
        /^[a-z0-9_]{1,80}$/.test(key)
        && (typeof credits === "string" || typeof credits === "number")
        && String(credits).trim().length <= 16
      )
      .slice(0, 24)
      .map(([key, credits]) => [key, String(credits).trim()]),
  );

  return {
    bacStatus,
    bacYear: readString(record, "bacYear"),
    bacTrack: readString(record, "bacTrack"),
    generalAverage,
    averageType: normalizePublicOrientationAverageType({
      bacStatus,
      generalAverage,
      averageType: record.averageType,
    }),
    lastDiploma: readString(record, "lastDiploma"),
    higherEducationStatus,
    currentStudyField: readString(record, "currentStudyField").slice(0, 120),
    universitySemesters: readString(record, "universitySemesters").slice(0, 3),
    studyIntent,
    targetSpecialization: readString(record, "targetSpecialization").slice(0, 120),
    targetDegree: readString(record, "targetDegree"),
    targetField: readString(record, "targetField"),
    engineeringSpecialty: readString(record, "engineeringSpecialty"),
    germanLevel: readString(record, "germanLevel"),
    englishLevel: readString(record, "englishLevel"),
    studyLanguage: readString(record, "studyLanguage"),
    targetIntakeSeason,
    targetIntakeYear: readString(record, "targetIntakeYear"),
    budgetRange: readString(record, "budgetRange"),
    preferredCities,
    masterSubjectCredits,
  };
}
