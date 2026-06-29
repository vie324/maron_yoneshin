"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth";
import type { PostType } from "@/types/db";

const VALID_TYPES: PostType[] = ["video", "document", "seminar", "article"];

async function ensureAdmin(): Promise<boolean> {
  const me = await getProfile();
  return me?.role === "admin";
}

export interface PostFormState {
  error?: string;
}

function parseFields(formData: FormData) {
  const type = String(formData.get("type") ?? "article") as PostType;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const categoryId = String(formData.get("category_id") ?? "");
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  return {
    type: VALID_TYPES.includes(type) ? type : "article",
    title,
    body,
    category_id: categoryId || null,
    youtube_url: youtubeUrl || null,
    is_published: isPublished,
  };
}

/** FormData の files をストレージへ保存し attachments に記録。 */
async function saveAttachments(postId: string, formData: FormData) {
  const admin = createAdminClient();
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    const path = `${postId}/${randomUUID()}_${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: upErr } = await admin.storage
      .from("attachments")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (upErr) continue;
    await admin.from("attachments").insert({
      post_id: postId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    });
  }
}

// ── 作成 ───────────────────────────────────────────────────────────────────
export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  if (!(await ensureAdmin())) return { error: "権限がありません。" };

  const fields = parseFields(formData);
  if (!fields.title) return { error: "タイトルを入力してください。" };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({ ...fields, author_id: user?.id ?? null, course_id: course?.id ?? null })
    .select("id")
    .single();

  if (error || !post) {
    return { error: `保存に失敗しました: ${error?.message ?? ""}` };
  }

  await saveAttachments(post.id, formData);

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}/edit?saved=1`);
}

// ── 更新 ───────────────────────────────────────────────────────────────────
export async function updatePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  if (!(await ensureAdmin())) return { error: "権限がありません。" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "対象が指定されていません。" };

  const fields = parseFields(formData);
  if (!fields.title) return { error: "タイトルを入力してください。" };

  const supabase = createClient();
  const { error } = await supabase.from("posts").update(fields).eq("id", id);
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  await saveAttachments(id, formData);

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}/edit`);
  redirect(`/admin/posts/${id}/edit?saved=1`);
}

// ── 削除 ───────────────────────────────────────────────────────────────────
export async function deletePost(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  // 先にストレージ上のファイルを削除
  const { data: atts } = await admin
    .from("attachments")
    .select("file_path")
    .eq("post_id", id);
  const paths = (atts ?? []).map((a) => a.file_path);
  if (paths.length > 0) {
    await admin.storage.from("attachments").remove(paths);
  }
  await admin.from("posts").delete().eq("id", id); // attachments は CASCADE

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

// ── 添付の個別削除 ─────────────────────────────────────────────────────────
export async function deleteAttachment(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("attachment_id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  const { data: att } = await admin
    .from("attachments")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();
  if (att?.file_path) {
    await admin.storage.from("attachments").remove([att.file_path]);
  }
  await admin.from("attachments").delete().eq("id", id);

  if (postId) revalidatePath(`/admin/posts/${postId}/edit`);
}
