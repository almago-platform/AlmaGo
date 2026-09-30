export type LegalDocumentKey = "imprint" | "privacy" | "terms";

export type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
};

type LegalDocument = {
  key: LegalDocumentKey;
  title: string;
  description: string;
  status: "draft" | "approved";
  sections: readonly LegalSection[];
};

export const a38ReviewReady = false;

export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
  imprint: {
    key: "imprint",
    title: "Mentions légales",
    description: "Informations relatives à l’éditeur de Campus Allemagne.",
    status: "draft",
    sections: [],
  },
  privacy: {
    key: "privacy",
    title: "Confidentialité",
    description: "Informations relatives au traitement des données personnelles.",
    status: "draft",
    sections: [],
  },
  terms: {
    key: "terms",
    title: "Conditions d’utilisation",
    description: "Conditions applicables à l’utilisation de Campus Allemagne.",
    status: "draft",
    sections: [],
  },
};

export function isLegalPublicationReady() {
  return (
    a38ReviewReady === true &&
    Object.values(legalDocuments).every(
      (document) => document.status === "approved" && document.sections.length > 0,
    )
  );
}
