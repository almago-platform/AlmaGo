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
