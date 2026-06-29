import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode, DEMO_COOKIE } from "@/lib/demo/mode";

/** ブラウザ（クライアントコンポーネント）用の Supabase クライアント。 */
export function createClient() {
  if (isDemoMode()) {
    // デモモード: ブラウザで使うのはログアウトのみ。Cookie を消すだけの擬似実装。
    return {
      auth: {
        async signOut() {
          document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`;
          return { error: null };
        },
      },
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
