import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const methods = new Set(["direct", "uni_assist", "vpd_then_direct", "other_documented", "unknown"]);

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Candidature invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const mode = cleanText(body.mode, 20);
  const deadline = cleanText(body.deadline, 10);
  const sourceUrl = cleanText(body.source_url, 1000);
  const cycle = cleanText(body.cycle, 120);
  const applicationMethod = cleanText(body.application_method, 40) || "unknown";

  if (!["verify", "mark_to_verify"].includes(mode)) {
    return NextResponse.json({ error: "Action de deadline invalide." }, { status: 400 });
  }
  if (deadline && !DATE_RE.test(deadline)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  if (!methods.has(applicationMethod)) {
    return NextResponse.json({ error: "Méthode de candidature invalide." }, { status: 400 });
  }

  if (mode === "verify") {
    if (!deadline || !cycle || !sourceUrl) {
      return NextResponse.json(
        { error: "Date, cycle et source officielle sont obligatoires pour vérifier une deadline." },
        { status: 400 },
      );
    }
    if (!validHttpUrl(sourceUrl)) {
      return NextResponse.json({ error: "La source officielle doit être une URL http(s) valide." }, { status: 400 });
    }

    const { error } = await supabase.rpc("admin_set_application_deadline", {
      p_application_id: id,
      p_deadline: deadline,
      p_deadline_source_url: sourceUrl,
      p_deadline_verified_at: new Date().toISOString(),
      p_deadline_cycle: cycle,
      p_application_method: applicationMethod,
    });

    if (error) {
      const message = error.message || "";
      if (message.includes("application_not_found")) {
        return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
      }
      return NextResponse.json({ error: "Impossible de vérifier cette échéance." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, mode: "verified" });
  }

  const { error } = await supabase.rpc("admin_mark_application_deadline_to_verify", {
    p_application_id: id,
    p_deadline: deadline || null,
    p_deadline_cycle: cycle || null,
    p_application_method: applicationMethod,
  });

  if (error) {
    const message = error.message || "";
    if (message.includes("application_not_found")) {
      return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
    }
    return NextResponse.json({ error: "Impossible d’enregistrer cette date à vérifier." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "to_verify" });
}
