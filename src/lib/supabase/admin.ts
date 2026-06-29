import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーを使う管理用クライアント（サーバー専用 / RLS を迂回）。
 * 生徒アカウントの発行・削除、PDF の保存、署名付き URL 発行などに使用。
 * ※ "server-only" により誤ってブラウザへバンドルされるとビルドエラーになる。
 */
export function createAdminClient() {
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
