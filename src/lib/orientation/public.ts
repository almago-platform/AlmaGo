export const PUBLIC_ORIENTATION_SESSION_KEY = "almago_phase2_orientation_v1";

export type PublicOrientationBacStatus = "" | "obtained" | "preparing" | "no_bac";
export type PublicOrientationAverageType = "" | "official" | "current_estimate";

export type PublicOrientationAnswers = {
  bacStatus: PublicOrientationBacStatus;
  bacYear: string;
  bacTrack: string;
  generalAverage: string;
  averageType: PublicOrientationAverageType;
  lastDiploma: string;
  targetDegree: string;
  targetField: string;
  engineeringSpecialty: string;
  germanLevel: string;
  englishLevel: string;
  studyLanguage: string;
  budgetRange: string;
  preferredCities: string[];
};

export function createEmptyPublicOrientationAnswers(): PublicOrientationAnswers {
  return {
    bacStatus: "",
    bacYear: "",
    bacTrack: "",
    generalAverage: "",
    averageType: "",
    lastDiploma: "",
    targetDegree: "",
    targetField: "",
    engineeringSpecialty: "",
    germanLevel: "",
    englishLevel: "",
    studyLanguage: "",
    budgetRange: "",
    preferredCities: [],
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
    targetDegree: readString(record, "targetDegree"),
    targetField: readString(record, "targetField"),
    engineeringSpecialty: readString(record, "engineeringSpecialty"),
    germanLevel: readString(record, "germanLevel"),
    englishLevel: readString(record, "englishLevel"),
    studyLanguage: readString(record, "studyLanguage"),
    budgetRange: readString(record, "budgetRange"),
    preferredCities,
  };
}
