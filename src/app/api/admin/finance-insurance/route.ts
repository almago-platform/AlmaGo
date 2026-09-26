import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { parseFinanceInsuranceAdminInput } from "@/lib/finance-insurance";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const parsed = parseFinanceInsuranceAdminInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("finance_insurance_catalog")
    .insert(parsed.value)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Impossible de créer cette option." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { id, ...option } = body as Record<string, unknown>;
  if (typeof id !== "string" || !uuidPattern.test(id)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const parsed = parseFinanceInsuranceAdminInput(option);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("finance_insurance_catalog")
    .update(parsed.value)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Impossible de modifier cette option." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Option introuvable." }, { status: 404 });

  return NextResponse.json({ ok: true, id: data.id });
}
