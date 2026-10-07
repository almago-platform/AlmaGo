import { randomUUID } from "node:crypto";
import { type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/security/csp";
import {
  mutationRejectionResponse,
  validateMutationPayload,
  validateMutationRequest,
} from "@/lib/security/request";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rejection = validateMutationRequest(request);
    if (rejection) return mutationRejectionResponse(rejection);
    const payloadRejection = await validateMutationPayload(request);
    if (payloadRejection) return mutationRejectionResponse(payloadRejection);
  }

  const nonce = randomUUID();
  const csp = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers();
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the incoming CSP to propagate the nonce onto framework scripts.
  // This header is forwarded only to the application render path, not the browser.
  requestHeaders.set("Content-Security-Policy", csp);

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Security-Policy-Report-Only", csp);

  return updateSession(request, { requestHeaders, responseHeaders });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
