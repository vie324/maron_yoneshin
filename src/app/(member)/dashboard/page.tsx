import Link from "next/link";
import {
  Video,
  FileText,
  PlaySquare,
  BookOpen,
  Megaphone,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POST_TYPE_LABEL, formatDate } from "@/lib/utils";
import type { Category, Post } from "@/types/db";

const ICONS: Record<string, typeof Video> = {
  videos: Video,
  documents: FileText,
  seminars: PlaySquare,
  learning: BookOpen,
  marketing: Megaphone,
};

export default async function DashboardPage() {
  const supabase = createClient();
  const profile = await getProfile();

  const [{ data: categories }, { data: recent }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const cats = (categories ?? []) as Category[];
  const posts = (recent ?? []) as Post[];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-lg font-bold">
          ようこそ、{profile?.full_name || "受講生"} さん
        </h1>
        <p className="text-sm text-muted-foreground">
          カテゴリを選んでコンテンツを閲覧できます。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {cats.map((c) => {
          const Icon = ICONS[c.slug] ?? FolderOpen;
          return (
            <Link key={c.id} href={`/library?category=${c.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardContent className="flex flex-col gap-2 p-4">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-semibold leading-snug">
                    {c.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">最近の更新</h2>
          <Link
            href="/library"
            className="flex items-center text-sm text-primary"
          >
            すべて見る <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            まだ公開されたコンテンツがありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/posts/${p.id}`}>
                  <Card className="transition-colors hover:bg-accent">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {POST_TYPE_LABEL[p.type]}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
