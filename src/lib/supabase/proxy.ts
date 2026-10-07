import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type ProxyHeaderOptions = {
  requestHeaders?: Headers;
  responseHeaders?: Headers;
};

export async function updateSession(
  request: NextRequest,
  options: ProxyHeaderOptions = {},
) {
  const makeResponse = () => {
    const headers = new Headers(request.headers);
    options.requestHeaders?.forEach((value, key) => headers.set(key, value));
    return NextResponse.next({ request: { headers } });
  };

  let response = makeResponse();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getClaims();
  options.responseHeaders?.forEach((value, key) => response.headers.set(key, value));
  return response;
}
