import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const TARGET_STORAGE_PATH =
  "0993fa10-3544-47c0-a255-2f123c09ccca/ed88d0ab-7528-434a-925d-44778bea378d/ilef-.png";

export async function GET(request: Request) {
  const maintenanceToken = process.env.MAINTENANCE_DELETE_TOKEN;
  const providedToken = new URL(request.url).searchParams.get("token");

  if (!maintenanceToken || !providedToken || providedToken !== maintenanceToken) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Privileged client unavailable." }, { status: 503 });
  }

  const { error: storageError } = await privileged.storage
    .from("student-documents")
    .remove([TARGET_STORAGE_PATH]);

  if (storageError) {
    console.error("[maintenance] target storage deletion failed", storageError.message);
    return NextResponse.json({ error: "Storage deletion failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, storage_deleted: true });
}
