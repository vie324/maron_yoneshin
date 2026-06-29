import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { Profile, Question } from "@/types/db";

export const metadata = { title: "質問対応" };

const FILTERS = [
  { key: "open", label: "未回答" },
  { key: "answered", label: "回答済み" },
  { key: "all", label: "すべて" },
];

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "open";
  const supabase = createClient();

  let query = supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });
  if (status === "open" || status === "answered") {
    query = query.eq("status", status);
  }

  const { data: questionsData } = await query;
  const questions = (questionsData ?? []) as Question[];

  // 投稿者名のマップ（管理者は profiles を閲覧可）
  const authorIds = Array.from(
    new Set(questions.map((q) => q.author_id).filter(Boolean)),
  ) as string[];
  const nameById = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);
    for (const p of (profs ?? []) as Profile[]) {
      nameById.set(p.id, p.full_name || "（無名）");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">質問対応</h1>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/questions?status=${f.key}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
              status === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {questions.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {status === "open"
            ? "未回答の質問はありません。"
            : "該当する質問はありません。"}
        </p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Link key={q.id} href={`/admin/questions/${q.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{q.title}</span>
                      {q.status === "answered" ? (
                        <Badge variant="success">回答済み</Badge>
                      ) : (
                        <Badge variant="warning">未回答</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {q.author_id ? nameById.get(q.author_id) ?? "—" : "（退会者）"}{" "}
                      ・ {formatDate(q.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
