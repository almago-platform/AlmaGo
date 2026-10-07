import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

const MAX_REPORT_BYTES = 16_384;
const DIRECTIVE_RE = /^[a-z][a-z0-9-]{0,63}$/;

function reportDirective(body: unknown) {
  const record = body && typeof body === "object"
    ? body as Record<string, unknown>
    : null;
  const legacy = record?.["csp-report"];
  const reportingApiBody = record?.body;
  const report = legacy && typeof legacy === "object"
    ? legacy as Record<string, unknown>
    : reportingApiBody && typeof reportingApiBody === "object"
      ? reportingApiBody as Record<string, unknown>
      : record;
  const value = report?.["effective-directive"] ?? report?.effectiveDirective;
  return typeof value === "string" && DIRECTIVE_RE.test(value) ? value : "unknown";
}

export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.cspReport);
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (!Number.isSafeInteger(contentLength) || contentLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }

  try {
    const text = await request.text();
    if (text.length > MAX_REPORT_BYTES) return new Response(null, { status: 413 });

    const parsed = JSON.parse(text) as unknown;
    const reports = Array.isArray(parsed) ? parsed.slice(0, 10) : [parsed];
    for (const report of reports) {
      console.warn("security_csp_report", JSON.stringify({
        directive: reportDirective(report),
      }));
    }
  } catch {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 204 });
}
