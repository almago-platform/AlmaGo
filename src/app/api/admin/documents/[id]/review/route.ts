import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { reviewStatuses } from "@/lib/documents";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const { id } = await params;
  let body: { status?: string; comment?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  if (!reviewStatuses.includes(body.status as (typeof reviewStatuses)[number])) return NextResponse.json({ error: "Statut de revue invalide." }, { status: 400 });
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) : "";
  if ((body.status === "rejected" || body.status === "replace_required") && !comment) return NextResponse.json({ error: "Un commentaire est obligatoire pour cette décision." }, { status: 400 });

  const { data: currentDocument, error: currentDocumentError } = await supabase
    .from("documents")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (currentDocumentError?.code === "22P02") {
    return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });
  }
  if (currentDocumentError) {
    return NextResponse.json({ error: "Impossible de vérifier le document." }, { status: 500 });
  }
  if (!currentDocument) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  if (!["pending", "replace_required"].includes(currentDocument.status)) {
    return NextResponse.json(
      { error: "Ce document n’est plus dans la file de revue active." },
      { status: 409 },
    );
  }

  const { error } = await supabase.rpc("admin_review_document", {
    target_document_id: id,
    target_status: body.status,
    target_comment: comment || null,
  });
  if (error?.message?.includes("document_not_found")) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer la revue." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
