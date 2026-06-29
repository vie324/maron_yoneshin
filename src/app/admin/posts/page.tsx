import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { POST_TYPE_LABEL, formatDate } from "@/lib/utils";
import type { Category, Post } from "@/types/db";

export const metadata = { title: "コンテンツ" };

export default async function AdminPostsPage() {
  const supabase = createClient();
  const [{ data: postsData }, { data: catsData }] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*"),
  ]);

  const posts = (postsData ?? []) as Post[];
  const cats = (catsData ?? []) as Category[];
  const catName = (id: string | null) =>
    cats.find((c) => c.id === id)?.name ?? "未分類";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">コンテンツ</h1>
          <p className="text-sm text-muted-foreground">
            登録数: {posts.length} 件
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            新規投稿
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          まだコンテンツがありません。「新規投稿」から作成してください。
        </p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{p.title}</span>
                    {p.is_published ? (
                      <Badge variant="success">公開中</Badge>
                    ) : (
                      <Badge variant="secondary">下書き</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {POST_TYPE_LABEL[p.type]} ・ {catName(p.category_id)} ・{" "}
                    {formatDate(p.updated_at)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/posts/${p.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    編集
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
