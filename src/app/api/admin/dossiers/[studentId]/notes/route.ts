import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const kinds = new Set([
  "internal_note",
  "call",
  "email",
  "whatsapp",
  "meeting",
  "document_request",
  "university_contact",
]);

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

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

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const kind = cleanText(body.kind, 40);
  const content = cleanText(body.content, 4000);
  const occurredAtRaw = cleanText(body.occurred_at, 64);

  if (!kinds.has(kind)) {
    return NextResponse.json({ error: "Type de journal invalide." }, { status: 400 });
  }
  if (content.length < 2) {
    return NextResponse.json({ error: "Ajoutez une note utile avant d’enregistrer." }, { status: 400 });
  }

  let occurredAt = new Date().toISOString();
  if (occurredAtRaw) {
    const parsed = Date.parse(occurredAtRaw);
    if (!Number.isFinite(parsed)) {
      return NextResponse.json({ error: "Date de contact invalide." }, { status: 400 });
    }
    if (parsed > Date.now() + 5 * 60 * 1000) {
      return NextResponse.json({ error: "La date ne peut pas être dans le futur." }, { status: 400 });
    }
    occurredAt = new Date(parsed).toISOString();
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
    return NextResponse.json({ error: "Personne introuvable." }, { status: 404 });
  }

  const { data: note, error } = await supabase
    .from("student_case_notes")
    .insert({
      student_id: studentId,
      author_id: user.id,
      kind,
      content,
      occurred_at: occurredAt,
    })
    .select("id,student_id,author_id,kind,content,occurred_at,created_at")
    .single();

  if (error || !note) {
    return NextResponse.json(
      { error: "Impossible d’enregistrer cette note interne." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, note });
}
