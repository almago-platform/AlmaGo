import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import {
  hasAllowedMessageAttachmentSignature,
  isSafeMessageAttachment,
  messageAttachmentBucket,
  messageAttachmentMaxBytes,
  messageAttachmentStoragePath,
  parseDossierMessageRequest,
} from "@/lib/dossier-message-attachments";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Impossible de vérifier le dossier." }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Candidat ou étudiant introuvable." }, { status: 404 });
  }

  const { message, file } = await parseDossierMessageRequest(request);
  if (message.length < 2 && !file) {
    return NextResponse.json({ error: "Ajoutez un message ou une pièce jointe." }, { status: 400 });
  }

  if (file) {
    if (!isSafeMessageAttachment(file)) {
      return NextResponse.json(
        { error: "Utilisez un PDF, JPEG ou PNG de 10 MiB maximum." },
        { status: 400 },
      );
    }
    if (!(await hasAllowedMessageAttachmentSignature(file))) {
      return NextResponse.json(
        { error: "Le contenu du fichier ne correspond pas au format déclaré." },
        { status: 400 },
      );
    }
  }

  const id = crypto.randomUUID();
  const attachmentStoragePath = file
    ? messageAttachmentStoragePath(studentId, id, file.name)
    : null;

  if (file && attachmentStoragePath) {
    const { error: uploadError } = await supabase.storage
      .from(messageAttachmentBucket)
      .upload(attachmentStoragePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Impossible d’envoyer la pièce jointe." },
        { status: 500 },
      );
    }
  }

  const { data: created, error } = await supabase
    .from("student_dossier_messages")
    .insert({
      id,
      student_id: studentId,
      sender_id: user.id,
      sender_role: "admin",
      body: message,
      attachment_storage_path: attachmentStoragePath,
      attachment_name: file?.name || null,
      attachment_mime_type: file?.type || null,
      attachment_size_bytes: file?.size || null,
    })
    .select("id,student_id,sender_id,sender_role,body,student_read_at,admin_read_at,created_at,attachment_name,attachment_mime_type,attachment_size_bytes")
    .single();

  if (error || !created) {
    if (attachmentStoragePath) {
      await supabase.storage.from(messageAttachmentBucket).remove([attachmentStoragePath]);
    }
    return NextResponse.json(
      { error: "Impossible d’envoyer le message dans l’espace de la personne." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: created,
    maxAttachmentSize: messageAttachmentMaxBytes,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as { operation?: unknown } | null;
  if (body?.operation !== "mark_read") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const readAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_dossier_messages")
    .update({ admin_read_at: readAt })
    .eq("student_id", studentId)
    .eq("sender_role", "student")
    .is("admin_read_at", null)
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: "Impossible de marquer les réponses comme lues." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, updated: data?.length || 0 });
}
