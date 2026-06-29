import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostForm } from "../post-form";
import { createPost } from "../actions";
import type { Category } from "@/types/db";

export const metadata = { title: "新規投稿" };

export default async function NewPostPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  const categories = (data ?? []) as Category[];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/admin/posts"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        コンテンツ一覧へ戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>新しいコンテンツを作成</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm action={createPost} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
