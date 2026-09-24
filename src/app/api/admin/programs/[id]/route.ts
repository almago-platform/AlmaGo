import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { programPayload } from "@/app/api/admin/programs/route";
import { isHttpSourceUrl, sourceUrlsChanged } from "@/lib/source-verification";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const data = programPayload(body);
  if (!data.name || typeof data.university_id !== "string") return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });
  const programmeUrls = [data.source_url, data.application_url].filter(
    (value): value is string => typeof value === "string" && Boolean(value.trim()),
  );
  if (programmeUrls.some((value) => !isHttpSourceUrl(value))) {
    return NextResponse.json(
      { error: "Les liens de source et de candidature doivent être des URL http/https valides." },
      { status: 400 },
    );
  }
  if (
    body.mark_verified === true &&
    !isHttpSourceUrl(data.source_url) &&
    !isHttpSourceUrl(data.application_url)
  ) {
    return NextResponse.json(
      { error: "Ajoutez une URL officielle valide (http/https) avant de confirmer la vérification." },
      { status: 400 },
    );
  }
  const { id } = await params;
  const { data: existing, error: existingError } = await supabase
    .from("programs")
    .select("source_url,application_url")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Impossible de vérifier la source actuelle du programme." }, { status: 500 });
  }
  if (!existing) return NextResponse.json({ error: "Programme introuvable." }, { status: 404 });

  const sourceChanged = sourceUrlsChanged(
    [existing.source_url, existing.application_url],
    [data.source_url, data.application_url],
  );
  const verificationPatch =
    body.mark_verified === true || !sourceChanged ? {} : { verified_at: null };

  const { error } = await supabase.from("programs").update({ ...data, ...verificationPatch }).eq("id", id);
  if (error) return NextResponse.json({ error: "Impossible de modifier le programme." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
