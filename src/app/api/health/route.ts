import { getRuntimeExposureMode } from "@/lib/prelaunch";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TARGET_DOCUMENT_ID = "ed88d0ab-7528-434a-925d-44778bea378d";

async function runOneTimeDocumentCleanup() {
  if (!process.env.MAINTENANCE_DELETE_TOKEN) return "disabled";

  try {
    const privileged = createPrivilegedSupabaseClient();
    const { data: document } = await privileged
      .from("documents")
      .select("id,storage_path")
      .eq("id", TARGET_DOCUMENT_ID)
      .maybeSingle();

    if (!document) return "already_deleted";

    const { error: storageError } = await privileged.storage
      .from("student-documents")
      .remove([document.storage_path]);
    if (storageError) return "storage_error";

    const { error: deleteError } = await privileged
      .from("documents")
      .delete()
      .eq("id", TARGET_DOCUMENT_ID);
    if (deleteError) return "database_error";

    return "deleted";
  } catch {
    return "error";
  }
}

export async function GET() {
  const maintenanceCleanup = await runOneTimeDocumentCleanup();

  return NextResponse.json(
    {
      status: "ok",
      service: "almago",
      revision: process.env.RENDER_GIT_COMMIT?.slice(0, 12) || null,
      branch: process.env.RENDER_GIT_BRANCH || null,
      exposureMode: getRuntimeExposureMode(),
      maintenanceCleanup,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
