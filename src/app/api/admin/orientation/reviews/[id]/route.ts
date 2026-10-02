import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/auth/access";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const DECISIONS = new Set(["approved", "changes_requested", "rejected"]);

function boundedNote(value: unknown) {
  if (typeof value !== "string") return null;
  const note = value.trim();
  if (!note) return null;
  return note.slice(0, 2000);
}

function selectedKeys(value: unknown) {
  if (!Array.isArray(value)) return null;
  const keys = value.filter(
    (item): item is string =>
      typeof item === "string"
      && /^[0-9a-f]{64}$/i.test(item),
  );
  if (keys.length !== value.length || keys.length > 4) return null;
  if (new Set(keys).size !== keys.length) return null;
  return keys;
}

function keysFromBundle(bundle: unknown) {
  if (!bundle || typeof bundle !== "object") {
    return { allowed: new Set<string>(), current: [] as string[] };
  }

  const record = bundle as Record<string, unknown>;
  const verification =
    record.verification && typeof record.verification === "object"
      ? record.verification as Record<string, unknown>
      : {};
  const selection =
    record.selection && typeof record.selection === "object"
      ? record.selection as Record<string, unknown>
      : {};

  const allowed = new Set<string>();
  if (Array.isArray(verification.programmes)) {
    for (const item of verification.programmes) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const key = record.candidateKey;
      const verification =
        record.verification && typeof record.verification === "object"
          ? record.verification as Record<string, unknown>
          : {};
      if (
        typeof key === "string"
        && /^[0-9a-f]{64}$/i.test(key)
        && verification.overallStatus !== "unknown"
      ) {
        allowed.add(key);
      }
    }
  }

  const current = Array.isArray(selection.selected)
    ? selection.selected.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const key = (item as Record<string, unknown>).candidateKey;
        return typeof key === "string" && allowed.has(key) ? [key] : [];
      })
    : [];

  return { allowed, current };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Revue invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const decision = typeof body?.decision === "string" ? body.decision : "";
  if (!DECISIONS.has(decision)) {
    return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  }

  const { data: review, error: reviewError } = await supabase
    .from("orientation_human_reviews")
    .select("id,bundle")
    .eq("id", id)
    .maybeSingle();

  if (reviewError) {
    return NextResponse.json({ error: "Impossible de charger la revue." }, { status: 500 });
  }
  if (!review) {
    return NextResponse.json({ error: "Revue introuvable." }, { status: 404 });
  }

  const { allowed, current } = keysFromBundle(review.bundle);
  const requested = body?.selectedCandidateKeys === undefined
    ? null
    : selectedKeys(body.selectedCandidateKeys);
  if (body?.selectedCandidateKeys !== undefined && requested === null) {
    return NextResponse.json({ error: "Sélection de programmes invalide." }, { status: 400 });
  }

  let approvedSelection = requested ?? current;
  const note = boundedNote(body?.counselorNote);

  if (decision === "rejected") {
    approvedSelection = [];
    if (!note) {
      return NextResponse.json({ error: "Expliquez pourquoi cette revue est rejetée." }, { status: 400 });
    }
  }

  if (decision === "changes_requested" && !note) {
    return NextResponse.json({ error: "Décrivez les corrections demandées." }, { status: 400 });
  }

  if (decision === "approved") {
    if (approvedSelection.length < 1 || approvedSelection.length > 4) {
      return NextResponse.json(
        { error: "Validez entre 1 et 4 pistes déjà vérifiées par B." },
        { status: 400 },
      );
    }
  }

  if (approvedSelection.some((key) => !allowed.has(key))) {
    return NextResponse.json(
      { error: "Une piste choisie ne fait pas partie des programmes passés par la vérification B." },
      { status: 400 },
    );
  }

  const reviewedAt = new Date().toISOString();
  let adminClient;
  try {
    adminClient = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "La persistance de revue n’est pas configurée." },
      { status: 503 },
    );
  }

  const { error } = await adminClient
    .from("orientation_human_reviews")
    .update({
      review_status: decision,
      approved_selection: approvedSelection,
      counselor_note: note,
      reviewed_by: user.id,
      reviewed_at: reviewedAt,
      updated_at: reviewedAt,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Impossible d’enregistrer la décision." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    reviewStatus: decision,
    selectedCandidateKeys: approvedSelection,
  });
}
