import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { recommendationStatuses } from "@/lib/phase4";

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = body?.status as string;
  if (!body || typeof body.student_id !== "string" || typeof body.program_id !== "string" || !recommendationStatuses.includes(status as (typeof recommendationStatuses)[number])) return NextResponse.json({ error: "Étudiant, programme et statut obligatoires." }, { status: 400 });
  const { data, error } = await supabase.from("program_recommendations").upsert({ student_id: body.student_id, program_id: body.program_id, admin_id: user.id, note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : null, status }, { onConflict: "student_id,program_id" }).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer la recommandation." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
