import { type NextRequest } from "next/server";
import {
  mutationRejectionResponse,
  validateMutationRequest,
} from "@/lib/security/request";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rejection = validateMutationRequest(request);
    if (rejection) return mutationRejectionResponse(rejection);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
