import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { formatDate } from "@/lib/utils";
import type { Answer, Question } from "@/types/db";

export default async function MyQuestionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // RLS により「自分の質問」または管理者のみ取得できる
  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!question) notFound();
  const q = question as Question;

  const { data: answerRows } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", q.id)
    .order("created_at", { ascending: true });

  const answers = (answerRows ?? []) as Answer[];

  return (
    <div className="space-y-4">
      <Link
        href="/questions"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Q&A へ戻る
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {q.status === "answered" ? (
            <Badge variant="success">回答済み</Badge>
          ) : (
            <Badge variant="warning">未回答</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(q.created_at)}
          </span>
        </div>
        <h1 className="text-xl font-bold">{q.title}</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-1 text-xs font-semibold text-primary">
            あなたの質問
          </p>
          <Markdown className="prose-sm">{q.body}</Markdown>
        </CardContent>
      </Card>

      {answers.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          回答をお待ちください。回答が付くと、ここに表示されます。
        </p>
      ) : (
        answers.map((a) => (
          <Card key={a.id} className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <p className="mb-1 text-xs font-semibold text-emerald-700">
                運営からの回答 ・ {formatDate(a.created_at)}
              </p>
              <Markdown className="prose-sm">{a.body}</Markdown>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
