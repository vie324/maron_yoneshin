import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/db";

/** ログイン中ユーザー（auth.users）を取得。未ログインなら null。 */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** ログイン中ユーザーのプロフィールを取得。未ログインなら null。 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

/**
 * 生徒・管理者いずれかのログインを要求。
 * 未ログイン → /login、停止中 → /suspended へ。
 */
export async function requireMember(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.status === "suspended") redirect("/suspended");
  return profile;
}

/** 管理者のみ許可。生徒は /dashboard へ。 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
