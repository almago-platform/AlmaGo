/**
 * Operator playbook for a Tunisia-based candidate considering higher education
 * in Germany. This is NOT a visa eligibility engine or a live official deadline
 * feed. Per-applicant assessment and consular re-verification are mandatory.
 *
 * Source links last manually reviewed on 2026-10-08.
 */
export const VISA_SOURCE_REVIEWED = "2026-10-08";
export const VISA_FINANCIAL_REFERENCE_YEAR = 2026;

export type CandidateJourneyPhase =
  | "orientation"
  | "qualification"
  | "academic_application"
  | "visa_preparation"
  | "departure"
  | "arrival";

export type OperatorMilestone = {
  id: CandidateJourneyPhase;
  title: string;
  owner: "Campus Allemagne" | "Candidat" | "Partagé";
  instruction: string;
  completionEvidence: string;
  where: string;
};

export const CANDIDATE_JOURNEY: readonly OperatorMilestone[] = [
  {
    id: "orientation",
    title: "1. Compte et orientation automatique",
    owner: "Partagé",
    instruction: "Retrouver le compte et l’orientation. Vérifier ce qui a réellement été déclaré, distinguer résultat automatique et validation humaine, demander l’accord du candidat avant le suivi.",
    completionEvidence: "Compte associé, orientation retrouvée, premier contact effectué avec l’accord de la personne.",
    where: "/admin/prospects",
  },
  {
    id: "qualification",
    title: "2. Qualification et parcours adapté",
    owner: "Campus Allemagne",
    instruction: "Vérifier diplôme, notes, langues, budget, rentrée, lieu de résidence et objectif. Comparer accès direct, études préparatoires, Studienkolleg ou recherche de place. Confirmer ce qui manque et la route proposée.",
    completionEvidence: "Profil vérifié, justificatifs initiaux revus, parcours motivé, proposition commerciale acceptée si applicable.",
    where: "/admin/intake",
  },
  {
    id: "academic_application",
    title: "3. Programmes et candidatures",
    owner: "Partagé",
    instruction: "Vérifier les critères sur le site de chaque université, choisir direct/uni-assist/VPD, enregistrer la deadline officielle sourcée et une cible interne distincte. Suivre chaque dossier jusqu’à la preuve de dépôt et la décision.",
    completionEvidence: "Programme et rentrée précis, admissibilité évaluée, documents conformes, dépôt confirmé et décision institutionnelle enregistrée.",
    where: "/admin/applications",
  },
  {
    id: "visa_preparation",
    title: "4. Visa : catégorie, dossier et dépôt",
    owner: "Partagé",
    instruction: "Vérifier nationalité, pays de résidence et autorité compétente. Choisir le motif exact, contrôler la checklist officielle, financement, couverture maladie, preuves linguistiques et académiques. Le candidat maîtrise son compte consulaire et sa demande.",
    completionEvidence: "Type de visa et mission vérifiés, checklist individualisée, soumission prouvée, convocation suivie et décision réelle enregistrée.",
    where: "/admin/documents",
  },
  {
    id: "departure",
    title: "5. Visa accordé et départ",
    owner: "Candidat",
    instruction: "Ne planifier le départ comme confirmé qu’après délivrance effective. Vérifier identité, passeport, validité, date d’entrée, logement, assurance, inscriptions et documents originaux.",
    completionEvidence: "Visa réel contrôlé par le candidat, voyage confirmé, contacts et pièces de départ prêts.",
    where: "/admin/people",
  },
  {
    id: "arrival",
    title: "6. Arrivée et relais en Allemagne",
    owner: "Candidat",
    instruction: "Confirmer l’arrivée, l’inscription domiciliaire (Anmeldung), l’immatriculation ou le début du cours et les démarches de titre de séjour local selon la situation. Clôturer uniquement après le relais convenu.",
    completionEvidence: "Confirmation d’arrivée et, selon le service convenu, preuves d’installation et dossier de séjour transmises.",
    where: "/admin/people",
  },
];

export type OfficialVisaTrack = {
  key: "studies" | "study_preparation" | "study_place_search";
  title: string;
  purpose: string;
  scope: string;
  financialNote: string;
  officialUrl: string;
  evidence: readonly string[];
  extraChecks: readonly string[];
};

export const TUNISIA_GERMANY_VISA_TRACKS: readonly OfficialVisaTrack[] = [
  {
    key: "studies",
    title: "Études universitaires",
    purpose: "Admission inconditionnelle à un établissement supérieur en Allemagne",
    scope: "Checklist publiée par l’ambassade à Tunis (25.07.2024), à revalider avant toute demande.",
    financialNote: "Référence 2026 : 11 904 € pour une année (992 €/mois), ou preuve de financement admissible. Vérifier l’année et le cas du demandeur.",
    officialUrl: "https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573172-2573172",
    evidence: [
      "Passeport valide, copie et photographies biométriques",
      "Formulaire consulaire et déclaration exigée pour la voie de dépôt applicable",
      "Lettre de motivation",
      "Admission universitaire inconditionnelle et preuve linguistique correspondant à la langue des études",
      "Baccalauréat légalisé et, le cas échéant, diplômes universitaires/relevés",
      "Preuve de financement adaptée et preuve d’assurance maladie",
    ],
    extraChecks: [
      "Couverture d’assurance avant immatriculation si arrivée anticipée",
      "Authentification/traduction conformément à la checklist actualisée et au canal de dépôt",
      "Source de la deadline de candidature propre à l’université, jamais une date générale",
    ],
  },
  {
    key: "study_preparation",
    title: "Préparation aux études",
    purpose: "Cours d’allemand préparatoire avec projet universitaire documenté",
    scope: "Checklist publiée par l’ambassade à Tunis (07.10.2025), à revalider avant toute demande.",
    financialNote: "La checklist de Tunis indique 11 904 € pour un an. Ne pas confondre avec les exigences de recherche de place ou de séjour linguistique autonome.",
    officialUrl: "https://tunis.diplo.de/tn-de/service/05-visaeinreise/2573166-2573166",
    evidence: [
      "Passeport valide, copie, photographies biométriques et documents de demande",
      "Lettre de motivation (une page maximum selon la checklist citée)",
      "Inscription à un cours d’allemand préparatoire d’au moins 20 heures/semaine",
      "Attestation de langue allemande d’au moins A2 émise par un organisme accepté",
      "Admission universitaire conditionnelle, confirmation de candidature ou correspondance universitaire équivalente",
      "Baccalauréat légalisé et éventuels diplômes/relevés universitaires",
      "Preuve de financement et assurance maladie privée adaptée à toute la durée du visa de préparation",
    ],
    extraChecks: [
      "Progression linguistique cohérente avec le niveau déjà attesté",
      "La checklist conseille que le cours commence au plus tôt deux mois après le dépôt, comme prudence de planification, pas comme délai garanti",
      "Une assurance limitée à 90 jours de séjour ne convient pas si le visa de préparation couvre une durée supérieure",
    ],
  },
  {
    key: "study_place_search",
    title: "Recherche de place universitaire",
    purpose: "Pas encore d’admission : demande évaluée sous §17(2) AufenthG",
    scope: "Information fédérale 2026 ; conditions et pièces locales à confirmer auprès de la mission allemande compétente.",
    financialNote: "Référence fédérale 2026 : au moins 1 091 € par mois pour cette catégorie ; ce montant n’est pas celui de la voie d’études avec admission.",
    officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/studying",
    evidence: [
      "Diplôme donnant accès aux études supérieures ou à une mesure préparatoire admissible",
      "Conditions linguistiques correspondant au programme recherché",
      "Preuve de moyens de subsistance pour toute la durée prévue",
      "Liste documentaire et modalité de dépôt confirmées par la représentation compétente",
    ],
    extraChecks: [
      "Durée de séjour possible jusqu’à neuf mois selon les conditions légales",
      "Ce visa ne doit pas être présenté comme une préparation aux études avec admission conditionnelle",
      "Aucun visa, ni admission, n’est garanti par AlmaGo",
    ],
  },
];

export const OFFICIAL_PROCESS_LINKS = {
  tunisVisa: "https://tunis.diplo.de/tn-fr/service/05-visaeinreise/1672716-1672716",
  consularPortal: "https://digital.diplo.de/",
  daadAdmission: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
  uniAssistDeadlines: "https://www.uni-assist.de/en/how-to-apply/plan-your-application/deadlines-processing-time/",
  federalVisa: "https://www.make-it-in-germany.com/en/visa-residence/types/studying",
} as const;

/** No stored visa result exists in the current lifecycle schema. */
export type CaseOperationalEvidence = {
  hasAccount: boolean;
  orientationCount: number;
  intakeStatus: string | null;
  recommendations: number;
  applications: number;
  currentProcedures: number;
  pendingDocuments: number;
  unreadStudentMessages: number;
  officialDeadlineRisk?: "overdue" | "within_7" | null;
};

export function firstKnownMilestone(e: CaseOperationalEvidence): CandidateJourneyPhase {
  // This is only a navigation cue, not a proof that any stage is completed.
  if (e.applications > 0) return "academic_application";
  if (e.currentProcedures > 0) return "qualification";
  if (e.intakeStatus) return "qualification";
  if (e.orientationCount > 0 || e.hasAccount) return "orientation";
  return "orientation";
}

export function recommendedOperatorAction(e: CaseOperationalEvidence): string {
  if (e.officialDeadlineRisk === "overdue") return "Escalader une deadline universitaire officielle vérifiée dépassée";
  if (e.officialDeadlineRisk === "within_7") return "Sécuriser le dépôt avant la deadline universitaire officielle vérifiée";
  if (e.unreadStudentMessages > 0) return "Répondre aux messages reçus";
  if (e.pendingDocuments > 0) return "Vérifier les documents reçus";
  if (e.currentProcedures > 0 && e.applications === 0) return "Vérifier la procédure et préparer la première candidature";
  if (e.applications > 0) return "Vérifier les échéances et les preuves de dépôt des candidatures";
  if (e.intakeStatus === "paid_pending_validation") return "Vérifier le paiement et valider selon la procédure interne";
  if (e.intakeStatus === "student_question") return "Répondre à la question du candidat";
  if (e.intakeStatus) return "Qualifier le parcours et la prochaine action du pré-dossier";
  if (e.orientationCount > 0) return "Revoir l’orientation automatique et contacter le prospect";
  return "Vérifier le compte et demander les informations nécessaires";
}

export function sourceIsValidForYear(referenceYear: number, currentYear: number) {
  return referenceYear === currentYear;
}
