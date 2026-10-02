import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/auth/access";

function providerState(
  requested: string | undefined,
  expected: string,
  keyPresent: boolean,
) {
  return {
    requested: requested || "deterministic",
    apiKeyPresent: keyPresent,
    configured: requested === expected && keyPresent,
  };
}

export async function GET() {
  const { user, isAdmin } = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const supabaseUrlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseSecretKeyPresent = Boolean(process.env.SUPABASE_SECRET_KEY);
  const supabaseServiceRoleKeyPresent = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const openAiKeyPresent = Boolean(process.env.OPENAI_API_KEY);
  const geminiKeyPresent = Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json({
    supabase: {
      urlPresent: supabaseUrlPresent,
      secretKeyPresent: supabaseSecretKeyPresent,
      serviceRoleKeyPresent: supabaseServiceRoleKeyPresent,
      configured: supabaseUrlPresent && supabaseSecretKeyPresent,
    },
    discovery: providerState(
      process.env.ALMAGO_ORIENTATION_DISCOVERY_PROVIDER,
      "openai",
      openAiKeyPresent,
    ),
    verification: providerState(
      process.env.ALMAGO_ORIENTATION_VERIFICATION_PROVIDER,
      "openai",
      openAiKeyPresent,
    ),
    writer: providerState(
      process.env.ALMAGO_ORIENTATION_WRITER_PROVIDER,
      "gemini",
      geminiKeyPresent,
    ),
  });
}
