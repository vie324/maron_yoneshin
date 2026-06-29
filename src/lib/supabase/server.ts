import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo/mode";
import { createMockServerClient } from "@/lib/demo/mock-client";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * サーバー（Server Component / Server Action / Route Handler）用クライアント。
 * ログイン中ユーザーのセッションで動作し、RLS が適用される。
 * デモモードでは Supabase を使わず擬似クライアント（インメモリ）を返す。
 */
export function createClient() {
  if (isDemoMode()) {
    return createMockServerClient() as unknown as ReturnType<
      typeof createServerClient
    >;
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からの呼び出しでは set 不可（middleware が更新を担当）。
          }
        },
      },
    },
  );
}
