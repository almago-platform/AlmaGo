import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export async function POST() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Confirmation indisponible." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc("service_confirm_proposed_route", {
    p_user_id: user.id,
  });

  if (error || typeof data !== "string") {
    return NextResponse.json(
      { error: "Le parcours ne peut pas être confirmé pour le moment." },
      { status: 409 },
    );
  }

  return NextResponse.json({ confirmed: true, procedureId: data }, { status: 200 });
}
