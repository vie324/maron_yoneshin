import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { SubmitButton } from "@/components/submit-button";
import { PostForm } from "../../post-form";
import { updatePost, deletePost, deleteAttachment } from "../../actions";
import type { Attachment, Category, Post } from "@/types/db";

export const metadata = { title: "コンテンツ編集" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string };
}) {
  const supabase = createClient();

  const [{ data: post }, { data: cats }, { data: atts }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("attachments")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!post) notFound();
  const p = post as Post;
  const categories = (cats ?? []) as Category[];
  const attachments = (atts ?? []) as Attachment[];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center text-sm text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          一覧へ戻る
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/posts/${p.id}`} target="_blank">
            <Eye className="h-4 w-4" />
            プレビュー
          </Link>
        </Button>
      </div>

      {searchParams.saved && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          保存しました。
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>コンテンツを編集</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm action={updatePost} categories={categories} post={p} />
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">添付済みの PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-md border p-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm">{a.file_name}</span>
                </div>
                <form action={deleteAttachment}>
                  <input type="hidden" name="attachment_id" value={a.id} />
                  <input type="hidden" name="post_id" value={p.id} />
                  <SubmitButton
                    variant="ghost"
                    size="sm"
                    pendingText="削除中…"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    削除
                  </SubmitButton>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/30">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">このコンテンツを削除</p>
            <p className="text-xs text-muted-foreground">
              添付ファイルもまとめて削除されます。
            </p>
          </div>
          <ConfirmDelete
            action={deletePost}
            hidden={{ id: p.id }}
            triggerLabel="削除"
            title="コンテンツを削除しますか？"
            description={`「${p.title}」を完全に削除します。元に戻せません。`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
