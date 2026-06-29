// 最初の管理者ユーザーを作成するスクリプト。
// 使い方:
//   1) .env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定
//   2) npm run create-admin -- <email> <password> "<氏名>"
//      例: npm run create-admin -- admin@maron-course.jp StrongPass123 "運営 太郎"
//
// package.json の create-admin スクリプトが `node --env-file=.env.local` で
// 環境変数を読み込みます。

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✗ NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください。",
  );
  process.exit(1);
}

const [, , email, password, ...nameParts] = process.argv;
const fullName = nameParts.join(" ") || "運営者";

if (!email || !password) {
  console.error(
    'Usage: npm run create-admin -- <email> <password> "<氏名>"',
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error("✗ パスワードは8文字以上にしてください。");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName, role: "admin", status: "active" },
});

if (error) {
  console.error("✗ 作成に失敗しました:", error.message);
  process.exit(1);
}

console.log(`✓ 管理者を作成しました: ${data.user.email}`);
console.log("  このメールアドレスとパスワードでログインしてください。");
