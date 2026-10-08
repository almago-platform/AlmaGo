import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const DOCUMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  // This admin-only route requires both the admin role and the configured MFA assurance.
  if (!isAdmin) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

  const { id } = await params;
  if (!DOCUMENT_ID.test(id)) {
    return NextResponse.json({ error: "Document invalide." }, { status: 400 });
  }

  const lookupStartedAt = performance.now();
  // Use the caller's RLS-scoped client, never a privileged storage key.
  const { data: document, error: lookupError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: "Impossible de vérifier le document." }, { status: 500 });
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const lookupMs = performance.now() - lookupStartedAt;
  const signingStartedAt = performance.now();
  const { data, error } = await supabase.storage
    .from("student-documents")
    .createSignedUrl(document.storage_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Impossible d’ouvrir le document." }, { status: 500 });
  }

  // Only timings, never document IDs, names, object paths or signed URLs.
  const signingMs = performance.now() - signingStartedAt;
  const response = NextResponse.redirect(data.signedUrl, { status: 302 });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set(
    "Server-Timing",
    `document-lookup;dur=${lookupMs.toFixed(1)},signed-url;dur=${signingMs.toFixed(1)}`,
  );
  return response;
}
