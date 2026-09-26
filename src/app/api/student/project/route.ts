import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseStudentProject, type StudentProjectInput } from "@/lib/student/project";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

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
