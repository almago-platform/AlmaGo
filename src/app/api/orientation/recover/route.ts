import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

export async function POST(request: Request) {
  const ipLimited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationAccountMutation,
  );
  if (ipLimited) return ipLimited;

  const { user } = await getAuthenticatedUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const accountLimited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationAccountMutation,
    { accountId: user.id },
  );
  if (accountLimited) return accountLimited;

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: "Confirmez d’abord votre adresse e-mail." },
      { status: 409 },
    );
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Récupération indisponible." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc(
    "service_recover_and_confirm_latest_orientation",
    {
      p_user_id: user.id,
      p_user_email: user.email,
    },
  );

  if (error || typeof data !== "string") {
    return NextResponse.json(
      { error: "Aucune orientation récupérable n’a été trouvée pour ce compte." },
      { status: 409 },
    );
  }

  return NextResponse.json({ recovered: true, orientationId: data }, { status: 200 });
}
