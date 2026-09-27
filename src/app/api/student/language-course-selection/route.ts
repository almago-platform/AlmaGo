import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { isPublishableLanguageCourse } from "@/lib/language-courses";
import { parseLanguageCourseSelectionInput } from "@/lib/language-course-selection";

const fields = "id,title,provider_name,city,language,purpose,level_from,level_to,hours_per_week,starts_on,ends_on,price_cents,currency,source_url,application_url,verified_at,is_active";

function accessError(auth: Awaited<ReturnType<typeof getStudentUser>>) {
  if (!auth.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!auth.isStudent) return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });
  return null;
}

export async function GET() {
  const auth = await getStudentUser();
  const denied = accessError(auth);
  if (denied || !auth.user) return denied!;

  const { data: selection, error } = await auth.supabase
    .from("student_language_course_selections")
    .select("id,language_course_id,created_at,updated_at")
    .eq("student_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Impossible de charger votre choix de cours." }, { status: 500 });
  }
  if (!selection) return NextResponse.json({ selection: null });

  const { data: course, error: courseError } = await auth.supabase
    .from("language_courses")
    .select(fields)
    .eq("id", selection.language_course_id)
    .maybeSingle();

  if (courseError) {
    return NextResponse.json({ error: "Impossible de charger votre choix de cours." }, { status: 500 });
  }

  const publishable = Boolean(course && isPublishableLanguageCourse(course));
  return NextResponse.json({
    selection: {
      id: selection.id,
      language_course_id: selection.language_course_id,
      created_at: selection.created_at,
      updated_at: selection.updated_at,
      publishable,
      course: publishable ? course : null,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await getStudentUser();
  const denied = accessError(auth);
  if (denied || !auth.user) return denied!;

  const parsed = parseLanguageCourseSelectionInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data: course, error: courseError } = await auth.supabase
    .from("language_courses")
    .select(fields)
    .eq("id", parsed.value.language_course_id)
    .maybeSingle();

  if (courseError) {
    return NextResponse.json({ error: "Impossible de vérifier ce cours." }, { status: 500 });
  }
  if (!course || !isPublishableLanguageCourse(course)) {
    return NextResponse.json({ error: "Ce cours n’est pas disponible comme fiche vérifiée." }, { status: 404 });
  }

  const { data: selection, error } = await auth.supabase
    .from("student_language_course_selections")
    .upsert(
      {
        student_id: auth.user.id,
        language_course_id: parsed.value.language_course_id,
      },
      { onConflict: "student_id" },
    )
    .select("id,language_course_id,created_at,updated_at")
    .single();

  if (error) {
    const conflict = String(error.message || "").includes("language_course_not_publishable");
    return NextResponse.json(
      { error: conflict ? "Ce cours doit être revalidé avant de pouvoir être sélectionné." : "Impossible d’enregistrer votre choix de cours." },
      { status: conflict ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, selection: { ...selection, publishable: true, course } });
}

export async function DELETE() {
  const auth = await getStudentUser();
  const denied = accessError(auth);
  if (denied || !auth.user) return denied!;

  const { error } = await auth.supabase
    .from("student_language_course_selections")
    .delete()
    .eq("student_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: "Impossible de retirer votre choix de cours." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
