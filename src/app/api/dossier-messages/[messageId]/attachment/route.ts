import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { messageAttachmentBucket } from "@/lib/dossier-message-attachments";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { messageId } = await params;
  if (!UUID_RE.test(messageId)) {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }

  const { data: message, error } = await supabase
    .from("student_dossier_messages")
    .select("attachment_storage_path")
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Impossible de vérifier la pièce jointe." }, { status: 500 });
  }
  if (!message?.attachment_storage_path) {
    return NextResponse.json({ error: "Pièce jointe introuvable." }, { status: 404 });
  }

  const { data, error: signedError } = await supabase.storage
    .from(messageAttachmentBucket)
    .createSignedUrl(message.attachment_storage_path, 60);

  if (signedError || !data?.signedUrl) {
    return NextResponse.json({ error: "Impossible d’ouvrir la pièce jointe." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
