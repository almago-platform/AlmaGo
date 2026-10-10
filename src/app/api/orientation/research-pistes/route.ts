import { NextResponse } from "next/server";
import { buildOrientationGeographicScopes } from "@/lib/orientation-engine/geography";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  chooseDocumentedResearchPistes,
  researchFamiliesFor,
  type ResearchPisteCriteria,
  type ResearchPisteRow,
} from "@/lib/orientation-engine/discovery/research-pistes";
import {
  enforceRequestRateLimit,
  acquireRequestConcurrency,
  concurrencyLimitedResponse,
  PUBLIC_ABUSE_POLICIES,
} from "@/lib/security/abuse";

const MAX_BODY_BYTES = 1_600;

function parseCriteria(value: unknown): ResearchPisteCriteria | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const targetDegree = input.targetDegree;
  const targetField = input.targetField;
  const preferredCities = input.preferredCities;
  const studyLanguage = input.studyLanguage;
  const bacStatus = input.bacStatus;
  if ((targetDegree !== "Bachelor" && targetDegree !== "Master")
    || typeof targetField !== "string" || targetField.length > 50
    || !Array.isArray(preferredCities) || preferredCities.length > 3
    || preferredCities.some((city) => typeof city !== "string" || city.length > 80)
    || typeof studyLanguage !== "string" || studyLanguage.length > 40
    || !["obtained", "preparing", "no_bac"].includes(String(bacStatus))
  ) return null;
  const optional = (key: string) => {
    const item = input[key];
    return typeof item === "string" && item.length <= 120 ? item : null;
  };
  return {
    targetDegree,
    targetField,
    preferredCities: [...new Set(preferredCities)],
    studyLanguage,
    bacStatus: String(bacStatus),
    targetSpecialization: optional("targetSpecialization"),
    engineeringSpecialty: optional("engineeringSpecialty"),
    scienceSpecialty: optional("scienceSpecialty"),
  };
}

/**
 * Public, limited, read-only projection of *already documented* programmes.
 * Does not assert eligibility or alter university records. Unlike OpenAI discovery,
 * this endpoint never starts a provider search and is fast even when AI is down.
 */
export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationResearchPistes);
  if (limited) return limited;
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const criteria = parseCriteria(body);
  if (!criteria) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  if (criteria.bacStatus === "no_bac" || researchFamiliesFor(criteria).length === 0) {
    return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  const lease = acquireRequestConcurrency("orientation_research_pistes", 5);
  if (!lease) return concurrencyLimitedResponse("orientation_research_pistes");
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase.from("orientation_research_programs")
      .select("institution,programme,degree,city,teaching_language,official_programme_url,family_ids,verification_status,research_status")
      .overlaps("family_ids", researchFamiliesFor(criteria))
      .not("official_programme_url", "is", null)
      .limit(180);
    if (error) throw error;
    const rows: ResearchPisteRow[] = (data || []).map((row) => ({
      institution: row.institution,
      programme: row.programme,
      degree: row.degree,
      city: row.city,
      teachingLanguage: row.teaching_language,
      officialUrl: row.official_programme_url,
      familyIds: row.family_ids || [],
      verificationStatus: row.verification_status,
      researchStatus: row.research_status,
    }));
    const scopes = buildOrientationGeographicScopes(criteria.preferredCities);
    return NextResponse.json(
      { items: chooseDocumentedResearchPistes(rows, {
        ...criteria,
        preferredCities: scopes[0]?.cities || [],
      }, 12, {
        nearbyCities: scopes.find((scope) => scope.tier === "nearby")?.cities || [],
        regionCities: scopes.find((scope) => scope.tier === "land")?.cities || [],
      }) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // The free orientation remains available when the documented cache is offline.
    return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
  } finally {
    lease.release();
  }
}
