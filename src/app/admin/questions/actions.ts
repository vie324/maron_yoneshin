"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function ensureAdmin(): Promise<boolean> {
  const me = await getProfile();
  return me?.role === "admin";
}

export interface AnswerState {
  error?: string;
}

export async function answerQuestion(
  _prev: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  if (!(await ensureAdmin())) return { error: "権限がありません。" };

  const questionId = String(formData.get("question_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!questionId) return { error: "対象が指定されていません。" };
  if (!body) return { error: "回答内容を入力してください。" };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("answers")
    .insert({ question_id: questionId, author_id: user?.id ?? null, body });
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  // 回答が付いたので「回答済み」に
  await supabase
    .from("questions")
    .update({ status: "answered" })
    .eq("id", questionId);

  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}`);
  redirect(`/admin/questions/${questionId}?saved=1`);
}

/** 回答済み ⇄ 未回答 の切替（必要に応じて手動で戻す） */
export async function setQuestionStatus(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["open", "answered"].includes(status)) return;

  const supabase = createClient();
  await supabase.from("questions").update({ status }).eq("id", id);
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${id}`);
}

export async function deleteQuestion(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("questions").delete().eq("id", id); // answers は CASCADE
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
