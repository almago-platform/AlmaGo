import { NextResponse } from "next/server";
import { publishableLanguageCoursesQuery } from "@/lib/language-courses";
import { createClient } from "@/lib/supabase/server";

const studentCourseFields = [
  "id",
  "title",
  "provider_name",
  "city",
  "language",
  "purpose",
  "level_from",
  "level_to",
  "hours_per_week",
  "starts_on",
  "ends_on",
  "price_cents",
  "currency",
  "source_url",
  "application_url",
  "verified_at",
].join(",");

type StudentLanguageCourse = {
  id: string;
  title: string;
  provider_name: string;
  city: string | null;
  language: string;
  purpose: string;
  level_from: string | null;
  level_to: string | null;
  hours_per_week: number | null;
  starts_on: string | null;
  ends_on: string | null;
  price_cents: number | null;
  currency: string | null;
  source_url: string | null;
  application_url: string | null;
  verified_at: string | null;
};

type StudentLanguageCourseQueryResult = {
  data: StudentLanguageCourse[] | null;
  error: { message?: string | null } | null;
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawFilters = Object.fromEntries(url.searchParams.entries());

  const baseQuery = supabase
    .from("language_courses")
    .select(studentCourseFields);

  const scopedQuery = publishableLanguageCoursesQuery(
    baseQuery as unknown as Parameters<typeof publishableLanguageCoursesQuery>[0],
    rawFilters,
  );

  if (!scopedQuery) {
    return NextResponse.json(
      { error: "Filtres de cours de langue invalides." },
      { status: 400 },
    );
  }

  const { data, error } = await (
    scopedQuery as unknown as PromiseLike<StudentLanguageCourseQueryResult>
  );

  if (error) {
    return NextResponse.json(
      { error: "Impossible de charger les cours de langue vérifiés." },
      { status: 500 },
    );
  }

  return NextResponse.json({ courses: data ?? [] });
}
