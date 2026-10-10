import { NextResponse } from "next/server";
import { getProvisionalIdentity } from "@/lib/prospect/provisional-auth";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getProvisionalIdentity();
  if (!identity) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  const client = createPrivilegedSupabaseClient();
  const { data: document } = await client.from("provisional_candidate_documents")
    .select("storage_path")
    .eq("id", id).eq("credential_id", identity.id)
    .eq("status", "pending").maybeSingle();
  if (!document?.storage_path) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  const { data, error } = await client.storage.from("provisional-starter-documents")
    .createSignedUrl(document.storage_path, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Document indisponible." }, { status: 503 });
  }
  return NextResponse.redirect(data.signedUrl, {
    status: 302, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
}
