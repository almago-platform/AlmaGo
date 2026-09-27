export const documentCategories = [
  { value: "passport", label: "Passeport" },
  { value: "baccalaureate", label: "Baccalauréat" },
  { value: "transcripts", label: "Relevés de notes" },
  { value: "language_certificate", label: "Certificat de langue" },
  { value: "university_attestation", label: "Attestation universitaire" },
  { value: "cv", label: "CV" },
  { value: "motivation_letter", label: "Lettre de motivation" },
  { value: "translation", label: "Traduction" },
  { value: "admission", label: "Admission" },
  { value: "other", label: "Autre" },
] as const;

export const reviewStatuses = ["approved", "rejected", "replace_required"] as const;
export const removableDocumentStatuses = ["pending", "rejected", "replace_required"] as const;
export const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"] as const;
export const maxDocumentBytes = 10 * 1024 * 1024;

export function categoryLabel(category: string) {
  return documentCategories.find((item) => item.value === category)?.label || "Autre";
}

export function statusLabel(status: string) {
  return ({ pending: "En attente de revue", approved: "Approuvé", rejected: "Rejeté", replace_required: "À remplacer", reviewed: "Revu", quarantined: "En quarantaine" } as Record<string, string>)[status] || status;
}

export function isDocumentCategory(value: unknown): value is (typeof documentCategories)[number]["value"] {
  return typeof value === "string" && documentCategories.some((item) => item.value === value);
}

export function isSafeDocumentFile(file: File) {
  const extension = file.name.toLowerCase().split(".").pop();
  const expectedExtension = ({ "application/pdf": "pdf", "image/jpeg": "jpeg", "image/png": "png" } as Record<string, string>)[file.type];
  const validExtension = extension === expectedExtension || (file.type === "image/jpeg" && extension === "jpg");
  return allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number]) && validExtension && file.size > 0 && file.size <= maxDocumentBytes;
}

export function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120) || "document";
}


export async function hasAllowedDocumentSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  if (file.type === "application/pdf") {
    const pdf = [0x25, 0x50, 0x44, 0x46, 0x2d];
    return pdf.every((value, index) => bytes[index] === value);
  }

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return png.every((value, index) => bytes[index] === value);
  }

  return false;
}
