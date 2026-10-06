import type { Locale } from "@/lib/i18n";

const fieldLabels: Record<string, Record<Locale, string>> = {
  "computer engineering": {
    fr: "Ingénierie informatique",
    ar: "هندسة الحاسوب",
    en: "Computer Engineering",
    de: "Computer Engineering",
  },
  "computer science": {
    fr: "Informatique",
    ar: "علوم الحاسوب",
    en: "Computer Science",
    de: "Informatik",
  },
  "electrical engineering": {
    fr: "Génie électrique",
    ar: "الهندسة الكهربائية",
    en: "Electrical Engineering",
    de: "Elektrotechnik",
  },
  "civil engineering": {
    fr: "Génie civil",
    ar: "الهندسة المدنية",
    en: "Civil Engineering",
    de: "Bauingenieurwesen",
  },
  "mechanical engineering": {
    fr: "Génie mécanique",
    ar: "الهندسة الميكانيكية",
    en: "Mechanical Engineering",
    de: "Maschinenbau",
  },
  "mechatronics": {
    fr: "Mécatronique",
    ar: "الميكاترونيك",
    en: "Mechatronics",
    de: "Mechatronik",
  },
  "mechatronics / robotics": {
    fr: "Mécatronique / robotique",
    ar: "الميكاترونيك / الروبوتات",
    en: "Mechatronics / Robotics",
    de: "Mechatronik / Robotik",
  },
  "industrial / production engineering": {
    fr: "Génie industriel / production",
    ar: "الهندسة الصناعية / الإنتاج",
    en: "Industrial / Production Engineering",
    de: "Industrie- / Produktionstechnik",
  },
  "automotive engineering": {
    fr: "Génie automobile",
    ar: "هندسة السيارات",
    en: "Automotive Engineering",
    de: "Fahrzeugtechnik",
  },
  "aerospace engineering": {
    fr: "Génie aérospatial",
    ar: "هندسة الطيران والفضاء",
    en: "Aerospace Engineering",
    de: "Luft- und Raumfahrttechnik",
  },
  "energy engineering": {
    fr: "Génie énergétique",
    ar: "هندسة الطاقة",
    en: "Energy Engineering",
    de: "Energietechnik",
  },
  "architecture": {
    fr: "Architecture",
    ar: "الهندسة المعمارية",
    en: "Architecture",
    de: "Architektur",
  },
  "business / economics": {
    fr: "Économie / gestion",
    ar: "الاقتصاد / إدارة الأعمال",
    en: "Business / Economics",
    de: "Wirtschaft / Ökonomie",
  },
  "biology / life sciences": {
    fr: "Biologie / sciences du vivant",
    ar: "الأحياء / علوم الحياة",
    en: "Biology / Life Sciences",
    de: "Biologie / Lebenswissenschaften",
  },
  "natural sciences": {
    fr: "Sciences naturelles",
    ar: "العلوم الطبيعية",
    en: "Natural Sciences",
    de: "Naturwissenschaften",
  },
  "chemistry": {
    fr: "Chimie",
    ar: "الكيمياء",
    en: "Chemistry",
    de: "Chemie",
  },
  "physics": {
    fr: "Physique",
    ar: "الفيزياء",
    en: "Physics",
    de: "Physik",
  },
};

export function localizedProgrammeField(value: string | null, locale: Locale) {
  if (!value) return null;
  const normalized = value.trim().toLocaleLowerCase("de").replace(/\s+/g, " ");
  return fieldLabels[normalized]?.[locale] || value;
}

export function localizedTeachingLanguage(value: string, locale: Locale) {
  const normalized = value.trim().toLocaleLowerCase("de").replace(/\s+/g, " ");
  const labels = {
    fr: { german: "Allemand", english: "Anglais", both: "Allemand / anglais" },
    ar: { german: "الألمانية", english: "الإنجليزية", both: "الألمانية / الإنجليزية" },
    en: { german: "German", english: "English", both: "German / English" },
    de: { german: "Deutsch", english: "Englisch", both: "Deutsch / Englisch" },
  } as const;

  if (["german / english", "german & english", "deutsch / englisch", "deutsch & englisch", "allemand / anglais", "allemand et anglais", "الألمانية / الإنجليزية"].includes(normalized)) {
    return labels[locale].both;
  }
  if (["german", "deutsch", "allemand", "الألمانية"].includes(normalized)) {
    return labels[locale].german;
  }
  if (["english", "englisch", "anglais", "الإنجليزية"].includes(normalized)) {
    return labels[locale].english;
  }
  return value;
}
