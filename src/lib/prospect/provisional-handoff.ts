import "server-only";

import { safeFilename } from "@/lib/documents";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

/**
 * Called ONLY after the existing claim_phase2_orientation RPC has bound the
 * orientation to a Supabase authenticated, email-VERIFIED user. Never run from
 * an anonymous cookie, email-only lookup, or untrusted user ID.
 *
 * Retry-safe: old provisional objects are retained; verified docs use the
 * immutable provisional UUID as their ID. A failure leaves the credential
 * unconsumed so a later verified claim can resume the transfer.
 */
export async function handoffProvisionalDocuments({
  supabase,
  userId,
  verifiedEmail,
  orientationId,
}: {
  supabase: ReturnType<typeof createPrivilegedSupabaseClient>;
  userId: string;
  verifiedEmail: string;
  orientationId: string;
}): Promise<boolean> {
  const { data: credential, error: credentialError } = await supabase
    .from("provisional_candidate_credentials")
    .select("id,verified_user_id")
    .eq("orientation_id", orientationId)
    .eq("email", verifiedEmail.trim().toLowerCase())
    .maybeSingle();
  if (credentialError) return false;
  if (!credential) return true;
  if (credential.verified_user_id && credential.verified_user_id !== userId) return false;

  const { data: documents, error: readError } = await supabase
    .from("provisional_candidate_documents")
    .select("id,credential_id,category,storage_path,original_filename,mime_type,size_bytes,status")
    .eq("credential_id", credential.id)
    .order("created_at", { ascending: true });
  if (readError) return false;

  for (const doc of documents || []) {
    const targetPath = `${userId}/${doc.id}/${safeFilename(doc.original_filename)}`;
    const { data: already } = await supabase.from("documents")
      .select("id,student_id,storage_path").eq("id", doc.id).maybeSingle();
    if (already && (already.student_id !== userId || already.storage_path !== targetPath)) {
      return false;
    }

    if (!already) {
      const source = await supabase.storage.from("provisional-starter-documents")
        .download(doc.storage_path);
      if (source.error || !source.data) return false;

      const uploaded = await supabase.storage.from("student-documents")
        .upload(targetPath, source.data, {
          contentType: doc.mime_type,
          // Safe idempotent overwrite of only this deterministic UUID-owned
          // target while the new metadata row is not yet present.
          upsert: true,
        });
      if (uploaded.error) return false;

      const { error: insertError } = await supabase.from("documents").insert({
        id: doc.id,
        student_id: userId,
        uploaded_by: userId,
        category: doc.category,
        original_filename: doc.original_filename,
        mime_type: doc.mime_type,
        size_bytes: doc.size_bytes,
        storage_path: targetPath,
        status: "pending",
      });
      if (insertError) return false;
    }
    if (doc.status !== "migrated") {
      const { error: doneError } = await supabase.from("provisional_candidate_documents")
        .update({ status: "migrated", migrated_document_id: doc.id })
        .eq("id", doc.id).eq("credential_id", credential.id);
      if (doneError) return false;
    }
  }

  const { error: completedError } = await supabase
    .from("provisional_candidate_credentials")
    .update({ verified_user_id: userId })
    .eq("id", credential.id)
    .eq("email", verifiedEmail.trim().toLowerCase());
  if (completedError) return false;

  const { error: revokeError } = await supabase.from("provisional_candidate_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("credential_id", credential.id)
    .is("revoked_at", null);
  return !revokeError;
}
