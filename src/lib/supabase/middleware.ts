import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode, DEMO_COOKIE } from "@/lib/demo/mode";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** デモモード用のログインガード（Cookie の有無だけで判定）。 */
function demoGuard(request: NextRequest) {
  const hasUser = !!request.cookies.get(DEMO_COOKIE)?.value;
  const isLogin = request.nextUrl.pathname === "/login";

  if (!hasUser && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (hasUser && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request });
}

/**
 * セッションの更新とログインガードを行う。
 *   * 未ログインで /login 以外にアクセス → /login へリダイレクト
 *   * ログイン済みで /login にアクセス → /dashboard へリダイレクト
 * ロール（admin）/ ステータス（suspended）の細かい制御は各レイアウトで行う。
 */
export async function updateSession(request: NextRequest) {
  if (isDemoMode()) return demoGuard(request);

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === "/login";

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
