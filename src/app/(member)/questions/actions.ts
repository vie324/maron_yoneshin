"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface QuestionFormState {
  error?: string;
}

export async function createQuestion(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) {
    return { error: "件名と質問内容を入力してください。" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  // 自分の course_id を引き継ぐ
  const { data: profile } = await supabase
    .from("profiles")
    .select("course_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("questions").insert({
    author_id: user.id,
    course_id: profile?.course_id ?? null,
    title,
    body,
    status: "open",
  });

  if (error) {
    return { error: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/questions");
  redirect("/questions?posted=1");
}
