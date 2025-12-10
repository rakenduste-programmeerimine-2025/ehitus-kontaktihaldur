import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const INACTIVITY_LIMIT = 30 * 60 * 1000;

export async function updateSession(request: NextRequest) { 
  const response = NextResponse.next();

  if (!hasEnvVars) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/auth") ||
    path.startsWith("/login");

  if (!user && path !== "/" && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  const lastActive = request.cookies.get("lastActive")?.value;
  const now = Date.now();

  if (user) {
    if (lastActive) {
      const diff = now - Number(lastActive);

      if (diff > INACTIVITY_LIMIT) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("expired", "1");

        const redirectRes = NextResponse.redirect(url);

        redirectRes.cookies.set("lastActive", "", { maxAge: 0 });
        redirectRes.cookies.set("sb-access-token", "", { maxAge: 0 });
        redirectRes.cookies.set("sb-refresh-token", "", { maxAge: 0 });

        return redirectRes;
      }
    }
    
    response.cookies.set("lastActive", now.toString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  return response;
}
