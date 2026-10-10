import { NextResponse } from "next/server";
import { getProvisionalIdentity, isTrustedProvisionalMutation } from "@/lib/prospect/provisional-auth";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const identity = await getProvisionalIdentity();
  if (!identity) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  const client = createPrivilegedSupabaseClient();
  const { data: document } = await client.from("provisional_candidate_documents")
    .select("storage_path,status").eq("id", id)
    .eq("credential_id", identity.id).maybeSingle();
  if (!document || document.status !== "pending") {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  const { error: storageError } = await client.storage.from("provisional-starter-documents")
    .remove([document.storage_path]);
  if (storageError) return NextResponse.json({ error: "Suppression impossible." }, { status: 503 });
  const { error: dbError } = await client.from("provisional_candidate_documents").delete()
    .eq("id", id).eq("credential_id", identity.id);
  if (dbError) return NextResponse.json({ error: "Suppression à réessayer." }, { status: 503 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
