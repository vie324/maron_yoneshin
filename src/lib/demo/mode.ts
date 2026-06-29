// デモモードの判定（Supabase 未設定でもアプリを一通り触れるようにする仕組み）。
//
// 優先順位:
//   1) NEXT_PUBLIC_DEMO_MODE=true  → 強制的にデモ
//   2) NEXT_PUBLIC_DEMO_MODE=false → 強制的に本番（Supabase）
//   3) どちらでもなければ、Supabase URL が未設定/プレースホルダのときデモ
//
// ※ NEXT_PUBLIC_ 変数はクライアント/Edge(middleware) でも参照できるよう inline される。

export const DEMO_COOKIE = "demo_user";

export function isDemoMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (flag === "true") return true;
  if (flag === "false") return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return true;
  return url.includes("placeholder") || url.includes("example");
}
