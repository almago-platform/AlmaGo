import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const TARGET_DOCUMENT_ID = "ed88d0ab-7528-434a-925d-44778bea378d";

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

  const { data: document, error: readError } = await privileged
    .from("documents")
    .select("id,storage_path,original_filename")
    .eq("id", TARGET_DOCUMENT_ID)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "Unable to read target document." }, { status: 500 });
  }
  if (!document) {
    return NextResponse.json({ ok: true, already_deleted: true });
  }

  const { error: storageError } = await privileged.storage
    .from("student-documents")
    .remove([document.storage_path]);

  if (storageError) {
    return NextResponse.json({ error: "Storage deletion failed." }, { status: 500 });
  }

  const { error: deleteError } = await privileged
    .from("documents")
    .delete()
    .eq("id", TARGET_DOCUMENT_ID);

  if (deleteError) {
    return NextResponse.json({ error: "Database deletion failed after storage deletion." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: TARGET_DOCUMENT_ID });
}
