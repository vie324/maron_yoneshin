import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo/mode";
import { createMockServerClient } from "@/lib/demo/mock-client";

/**
 * service_role キーを使う管理用クライアント（サーバー専用 / RLS を迂回）。
 * 生徒アカウントの発行・削除、PDF の保存、署名付き URL 発行などに使用。
 * ※ "server-only" により誤ってブラウザへバンドルされるとビルドエラーになる。
 * デモモードでは擬似クライアント（インメモリ）を返す。
 */
export function createAdminClient() {
  if (isDemoMode()) {
    return createMockServerClient() as unknown as ReturnType<
      typeof createClient
    >;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
