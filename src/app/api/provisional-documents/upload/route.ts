import { NextResponse } from "next/server";
import {
  hasAllowedDocumentSignature,
  isDocumentCategory,
  isSafeDocumentFile,
  safeFilename,
} from "@/lib/documents";
import { starterDocumentCategories } from "@/lib/campus-intake";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { getProvisionalIdentity, isTrustedProvisionalMutation } from "@/lib/prospect/provisional-auth";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

export const dynamic = "force-dynamic";
const allowed = new Set<string>(starterDocumentCategories.map((x) => x.category));

export async function POST(request: Request) {
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const identity = await getProvisionalIdentity();
  if (!identity) return NextResponse.json({ error: "Accès expiré ou absent." }, { status: 401 });
  const limited = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationAccountMutation, {
    accountId: identity.id,
  });
  if (limited) return limited;
  if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop grand." }, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const category = form?.get("category");
  if (!(file instanceof File) || !isDocumentCategory(category)
    || !allowed.has(category) || !isSafeDocumentFile(file)
    || !(await hasAllowedDocumentSignature(file))) {
    return NextResponse.json({ error: "PDF, JPEG ou PNG de 10 MiB maximum requis." }, { status: 400 });
  }

  const docId = crypto.randomUUID();
  const path = `${identity.id}/${docId}/${safeFilename(file.name)}`;
  const client = createPrivilegedSupabaseClient();
  const { error: insertError } = await client.from("provisional_candidate_documents").insert({
    id: docId,
    credential_id: identity.id,
    storage_path: path,
    category,
    original_filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });
  if (insertError) return NextResponse.json({ error: "Document non enregistré." }, { status: 500 });
  const { error: uploadError } = await client.storage.from("provisional-starter-documents")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    await client.from("provisional_candidate_documents").delete()
      .eq("id", docId).eq("credential_id", identity.id);
    return NextResponse.json({ error: "Échec d'envoi du document." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: docId }, {
    status: 201, headers: { "Cache-Control": "private, no-store" },
  });
}
