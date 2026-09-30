export const PUBLIC_ORIENTATION_SESSION_KEY = "almago_phase2_orientation_v1";

export type PublicOrientationBacStatus = "" | "obtained" | "preparing";

export type PublicOrientationAnswers = {
  bacStatus: PublicOrientationBacStatus;
  bacYear: string;
  bacTrack: string;
  generalAverage: string;
  lastDiploma: string;
  targetDegree: string;
  targetField: string;
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
    lastDiploma: "",
    targetDegree: "",
    targetField: "",
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

export function restorePublicOrientationAnswers(value: unknown): PublicOrientationAnswers {
  if (!value || typeof value !== "object") return createEmptyPublicOrientationAnswers();
  const record = value as Record<string, unknown>;
  const bacStatus = readString(record, "bacStatus");
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
    bacStatus: bacStatus === "obtained" || bacStatus === "preparing" ? bacStatus : "",
    bacYear: readString(record, "bacYear"),
    bacTrack: readString(record, "bacTrack"),
    generalAverage: readString(record, "generalAverage"),
    lastDiploma: readString(record, "lastDiploma"),
    targetDegree: readString(record, "targetDegree"),
    targetField: readString(record, "targetField"),
    germanLevel: readString(record, "germanLevel"),
    englishLevel: readString(record, "englishLevel"),
    studyLanguage: readString(record, "studyLanguage"),
    budgetRange: readString(record, "budgetRange"),
    preferredCities,
  };
}
