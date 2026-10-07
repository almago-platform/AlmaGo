import {
  hasAllowedDocumentSignature,
  isSafeDocumentFile,
  maxDocumentBytes,
  safeFilename,
} from "@/lib/documents";

export const messageAttachmentBucket = "dossier-message-attachments";
export const messageAttachmentMaxBytes = maxDocumentBytes;

export function isSafeMessageAttachment(file: File) {
  return isSafeDocumentFile(file);
}

export async function hasAllowedMessageAttachmentSignature(file: File) {
  return hasAllowedDocumentSignature(file);
}

export function messageAttachmentStoragePath(
  participantId: string,
  messageId: string,
  filename: string,
) {
  return `${participantId}/${messageId}/${safeFilename(filename)}`;
}


const cleanMessageText = (value: unknown) =>
  typeof value === "string" ? value.trim().slice(0, 4000) : "";

export async function parseDossierMessageRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const candidate = formData.get("file");
    return {
      message: cleanMessageText(formData.get("message")),
      file: candidate instanceof File ? candidate : null,
    };
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  return {
    message: cleanMessageText(body?.message),
    file: null as File | null,
  };
}
