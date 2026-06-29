import Link from "next/link";
import { Users, FileText, MessageCircleQuestion, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "ダッシュボード" };

export default async function AdminDashboard() {
  const supabase = createClient();

  const [students, posts, openQuestions] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "member"),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  const openCount = openQuestions.count ?? 0;

  const stats = [
    {
      label: "受講生",
      value: students.count ?? 0,
      icon: Users,
      href: "/admin/students",
    },
    {
      label: "コンテンツ",
      value: posts.count ?? 0,
      icon: FileText,
      href: "/admin/posts",
    },
    {
      label: "未回答の質問",
      value: openCount,
      icon: MessageCircleQuestion,
      href: "/admin/questions",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ダッシュボード</h1>

      {openCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                未回答の質問が {openCount} 件あります
              </span>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/questions">対応する</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-primary/10 p-3">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="font-semibold">よく使う操作</h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/students/new">生徒を追加</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/students/import">生徒を一括登録</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/posts/new">コンテンツを投稿</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
