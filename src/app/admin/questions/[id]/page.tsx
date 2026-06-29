import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { ConfirmDelete } from "@/components/confirm-delete";
import { formatDate } from "@/lib/utils";
import { AnswerForm } from "./answer-form";
import { setQuestionStatus, deleteQuestion } from "../actions";
import type { Answer, Profile, Question } from "@/types/db";

export const metadata = { title: "質問の詳細" };

export default async function AdminQuestionDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string };
}) {
  const supabase = createClient();

  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!question) notFound();
  const q = question as Question;

  const [{ data: answerRows }, { data: author }] = await Promise.all([
    supabase
      .from("answers")
      .select("*")
      .eq("question_id", q.id)
      .order("created_at", { ascending: true }),
    q.author_id
      ? supabase
          .from("profiles")
          .select("*")
          .eq("id", q.author_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const answers = (answerRows ?? []) as Answer[];
  const authorProfile = author as Profile | null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/admin/questions"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        質問一覧へ戻る
      </Link>

      {searchParams.saved && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          回答を送信しました。
        </p>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {q.status === "answered" ? (
            <Badge variant="success">回答済み</Badge>
          ) : (
            <Badge variant="warning">未回答</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            投稿者: {authorProfile?.full_name ?? "（退会者）"} ・{" "}
            {formatDate(q.created_at)}
          </span>
        </div>
        <h1 className="text-xl font-bold">{q.title}</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <Markdown className="prose-sm">{q.body}</Markdown>
        </CardContent>
      </Card>

      {answers.map((a) => (
        <Card key={a.id} className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-semibold text-emerald-700">
              回答 ・ {formatDate(a.created_at)}
            </p>
            <Markdown className="prose-sm">{a.body}</Markdown>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {answers.length > 0 ? "追加で回答する" : "回答する"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnswerForm questionId={q.id} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        {q.status === "answered" ? (
          <form action={setQuestionStatus}>
            <input type="hidden" name="id" value={q.id} />
            <input type="hidden" name="status" value="open" />
            <Button type="submit" variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              未回答に戻す
            </Button>
          </form>
        ) : (
          <span className="text-xs text-muted-foreground">
            回答を送信すると自動で「回答済み」になります。
          </span>
        )}
        <ConfirmDelete
          action={deleteQuestion}
          hidden={{ id: q.id }}
          triggerLabel="この質問を削除"
          title="質問を削除しますか？"
          description="質問と回答をまとめて削除します。元に戻せません。"
        />
      </div>
    </div>
  );
}
