export type SelectOption = { value: string; label: string };

export const languageLevelOptions: readonly SelectOption[] = [
  { value: "none", label: "Aucun" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

export const certificateOptions: readonly SelectOption[] = [
  { value: "none", label: "Aucun" },
  { value: "Goethe", label: "Goethe" },
  { value: "telc", label: "telc" },
  { value: "TestDaF", label: "TestDaF" },
  { value: "DSH", label: "DSH" },
  { value: "IELTS", label: "IELTS" },
  { value: "TOEFL", label: "TOEFL" },
  { value: "other", label: "Autre" },
];

export const degreeOptions: readonly SelectOption[] = [
  { value: "Bachelor", label: "Bachelor" },
  { value: "Master", label: "Master" },
  { value: "other", label: "Autre" },
];

export const studyFieldOptions: readonly SelectOption[] = [
  { value: "Informatique", label: "Informatique" },
  { value: "Ingénierie", label: "Ingénierie" },
  { value: "Économie/Gestion", label: "Économie / gestion" },
  { value: "Architecture", label: "Architecture" },
  { value: "Sciences", label: "Sciences" },
  { value: "Médecine/Santé", label: "Médecine / santé" },
  { value: "Lettres/Langues", label: "Lettres / langues" },
  { value: "other", label: "Autre" },
];

export const engineeringSpecialtyOptions: readonly SelectOption[] = [
  { value: "computer_engineering", label: "Informatique / Computer Engineering" },
  { value: "electrical_electronics", label: "Électrotechnique / électronique" },
  { value: "mechanical", label: "Mécanique" },
  { value: "mechatronics_robotics", label: "Mécatronique / robotique" },
  { value: "civil", label: "Génie civil" },
  { value: "industrial_production", label: "Génie industriel / production" },
  { value: "automotive", label: "Automobile" },
  { value: "aerospace", label: "Aéronautique / spatial" },
  { value: "energy", label: "Énergie" },
  { value: "undecided", label: "Je ne sais pas encore" },
  { value: "other", label: "Autre spécialité" },
];

export const tunisianBacTrackOptions: readonly SelectOption[] = [
  { value: "Sciences expérimentales", label: "Sciences expérimentales" },
  { value: "Mathématiques", label: "Mathématiques" },
  { value: "Sciences techniques", label: "Sciences techniques" },
  { value: "Économie et gestion", label: "Économie et gestion" },
  { value: "Lettres", label: "Lettres" },
  { value: "Informatique", label: "Informatique" },
  { value: "Sport", label: "Sport" },
  { value: "other", label: "Autre" },
];

export const diplomaOptions: readonly SelectOption[] = [
  { value: "none", label: "Aucun diplôme" },
  { value: "secondary_other", label: "Diplôme secondaire autre que le Bac tunisien" },
  { value: "Baccalauréat", label: "Baccalauréat" },
  { value: "Bac + 1", label: "Bac + 1" },
  { value: "Bac + 2", label: "Bac + 2" },
  { value: "Licence", label: "Licence" },
  { value: "Master", label: "Master" },
  { value: "other", label: "Autre" },
];

export const higherEducationStatusOptions: readonly SelectOption[] = [
  { value: "not_started", label: "Je n’ai pas encore commencé l’université" },
  { value: "currently_enrolled", label: "J’étudie actuellement à l’université" },
  { value: "interrupted", label: "J’ai interrompu mes études universitaires" },
  { value: "completed", label: "J’ai terminé un diplôme universitaire" },
];

export const studyIntentOptions: readonly SelectOption[] = [
  { value: "continue_same_field", label: "Continuer dans le même domaine" },
  { value: "transfer_credits", label: "Étudier la possibilité de reprendre mes crédits" },
  { value: "restart_bachelor", label: "Recommencer un Bachelor" },
  { value: "switch_field", label: "Changer de domaine" },
  { value: "master_after_degree", label: "Préparer un Master après mon diplôme" },
  { value: "not_sure", label: "Je ne sais pas encore" },
];

export const studyLanguageOptions: readonly SelectOption[] = [
  { value: "Allemand", label: "Allemand" },
  { value: "Anglais", label: "Anglais" },
  { value: "Allemand et anglais", label: "Allemand et anglais" },
  { value: "À définir", label: "Je ne sais pas encore" },
];

export const budgetOptions: readonly SelectOption[] = [
  { value: "Moins de 800 € / mois", label: "Moins de 800 € / mois" },
  { value: "800–1 000 € / mois", label: "800–1 000 € / mois" },
  { value: "1 000–1 200 € / mois", label: "1 000–1 200 € / mois" },
  { value: "Plus de 1 200 € / mois", label: "Plus de 1 200 € / mois" },
  { value: "À définir", label: "À définir" },
];

export const nationalityOptions: readonly SelectOption[] = [
  { value: "Algérienne", label: "Algérienne" },
  { value: "Allemande", label: "Allemande" },
  { value: "Belge", label: "Belge" },
  { value: "Camerounaise", label: "Camerounaise" },
  { value: "Canadienne", label: "Canadienne" },
  { value: "Égyptienne", label: "Égyptienne" },
  { value: "Française", label: "Française" },
  { value: "Italienne", label: "Italienne" },
  { value: "Libyenne", label: "Libyenne" },
  { value: "Marocaine", label: "Marocaine" },
  { value: "Mauritanienne", label: "Mauritanienne" },
  { value: "Sénégalaise", label: "Sénégalaise" },
  { value: "Suisse", label: "Suisse" },
  { value: "Tunisienne", label: "Tunisienne" },
  { value: "Turque", label: "Turque" },
  { value: "Autre", label: "Autre" },
];

export const preferredCityOptions = [
  "Aachen", "Berlin", "Bielefeld", "Bochum", "Bonn", "Brême", "Cologne", "Darmstadt",
  "Dortmund", "Dresde", "Düsseldorf", "Erlangen", "Francfort", "Fribourg", "Hambourg",
  "Hanovre", "Heidelberg", "Iéna", "Karlsruhe", "Leipzig", "Mayence", "Munich", "Münster",
  "Nuremberg", "Potsdam", "Sarrebruck", "Stuttgart", "Tübingen", "Ulm",
] as const;

export function valuesOf(options: readonly SelectOption[]) {
  return options.map(({ value }) => value);
}
