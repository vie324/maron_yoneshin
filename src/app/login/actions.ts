"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

/** ログインに使うメールへ正規化（@ が無ければ既定ドメインを補完）。 */
function normalizeEmail(input: string): string {
  const value = input.trim();
  if (value.includes("@")) return value;
  const domain = process.env.NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN;
  if (domain && value) return `${value}@${domain}`;
  return value;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  // ステータス・ロールに応じて遷移先を決定
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "suspended") {
      await supabase.auth.signOut();
      return {
        error:
          "このアカウントは停止されています。運営者にお問い合わせください。",
      };
    }
    if (profile?.role === "admin") destination = "/admin";
  }

  redirect(destination);
}
