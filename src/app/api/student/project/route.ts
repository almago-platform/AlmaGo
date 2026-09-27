import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { parseStudentProject, type StudentProjectInput } from "@/lib/student/project";

export async function PUT(request: Request) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });

  let input: StudentProjectInput;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }
  const parsed = parseStudentProject(input);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { error } = await supabase.from("student_projects").upsert(
    { student_id: user.id, ...parsed.data },
    { onConflict: "student_id" },
  );
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer votre projet." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
