import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const nullableText = (value: unknown, max: number) => {
  const text = cleanText(value, max);
  return text || null;
};

function cleanCities(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().slice(0, 100))
      .filter(Boolean),
  )].slice(0, 12);
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

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  let generalAverage: number | null = null;
  if (body.general_average !== null && body.general_average !== undefined && body.general_average !== "") {
    const parsed = Number(body.general_average);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 20) {
      return NextResponse.json({ error: "La moyenne doit être comprise entre 0 et 20." }, { status: 400 });
    }
    generalAverage = Math.round(parsed * 100) / 100;
  }

  const nextProject = {
    target_degree: nullableText(body.target_degree, 120),
    target_field: nullableText(body.target_field, 180),
    study_language: nullableText(body.study_language, 120),
    german_level: nullableText(body.german_level, 80),
    general_average: generalAverage,
    preferred_cities: cleanCities(body.preferred_cities),
    target_intake: nullableText(body.target_intake, 120),
    budget_range: nullableText(body.budget_range, 120),
  };

  const { data: current, error: loadError } = await supabase
    .from("profiles")
    .select("id,target_degree,target_field,study_language,german_level,general_average,preferred_cities,target_intake,budget_range")
    .eq("id", studentId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: "Impossible de charger le projet actuel." }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: "Profil étudiant introuvable." }, { status: 404 });
  }

  const changedFields = Object.entries(nextProject)
    .filter(([key, value]) => JSON.stringify(current[key as keyof typeof current] ?? null) !== JSON.stringify(value))
    .map(([key]) => key);

  if (!changedFields.length) {
    return NextResponse.json({ ok: true, changed_fields: [] });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(nextProject)
    .eq("id", studentId);

  if (updateError) {
    return NextResponse.json({ error: "Impossible d’enregistrer le projet étudiant." }, { status: 500 });
  }

  const { error: historyError } = await supabase.from("student_history").insert({
    student_id: studentId,
    actor_id: user.id,
    event_type: "admin_project_updated",
    message: "Le projet d’études enregistré dans le dossier a été mis à jour par Campus Allemagne.",
    metadata: {
      changed_fields: changedFields,
    },
  });

  if (historyError) {
    const rollback = {
      target_degree: current.target_degree,
      target_field: current.target_field,
      study_language: current.study_language,
      german_level: current.german_level,
      general_average: current.general_average,
      preferred_cities: current.preferred_cities,
      target_intake: current.target_intake,
      budget_range: current.budget_range,
    };
    await supabase.from("profiles").update(rollback).eq("id", studentId);
    return NextResponse.json(
      { error: "La modification a été annulée car son historique n’a pas pu être enregistré." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, changed_fields: changedFields });
}
