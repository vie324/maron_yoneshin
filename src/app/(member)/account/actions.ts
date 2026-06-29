"use server";

import { createClient } from "@/lib/supabase/server";

export interface PasswordState {
  error?: string;
  success?: string;
}

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で設定してください。" };
  }
  if (password !== confirm) {
    return { error: "確認用パスワードが一致しません。" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "変更に失敗しました。時間をおいて再度お試しください。" };
  }
  return { success: "パスワードを変更しました。" };
}
