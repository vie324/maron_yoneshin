import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Markdown } from "@/components/markdown";
import { formatDate } from "@/lib/utils";
import type { Question } from "@/types/db";

export const metadata = { title: "Q&A" };

interface ArchiveQuestion {
  id: string;
  title: string;
  body: string;
  created_at: string;
}
interface ArchiveAnswer {
  id: string;
  question_id: string;
  body: string;
  created_at: string;
}

export default async function QuestionsPage() {
  const supabase = createClient();
  const user = await getUser();

  const [{ data: mine }, { data: archive }, { data: archiveAnswers }] =
    await Promise.all([
      supabase
        .from("questions")
        .select("*")
        .eq("author_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
      supabase
        .from("qa_archive")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("qa_archive_answers").select("*"),
    ]);

  const myQuestions = (mine ?? []) as Question[];
  const archived = (archive ?? []) as ArchiveQuestion[];
  const answers = (archiveAnswers ?? []) as ArchiveAnswer[];

  const answersByQuestion = new Map<string, ArchiveAnswer[]>();
  for (const a of answers) {
    const arr = answersByQuestion.get(a.question_id) ?? [];
    arr.push(a);
    answersByQuestion.set(a.question_id, arr);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">質問とよくある回答</h1>
        <Button asChild size="sm">
          <Link href="/questions/new">
            <Plus className="h-4 w-4" />
            質問する
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="archive">
        <TabsList className="w-full">
          <TabsTrigger value="archive" className="flex-1">
            みんなのQ&A
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">
            自分の質問
          </TabsTrigger>
        </TabsList>

        {/* 回答済みの匿名アーカイブ */}
        <TabsContent value="archive" className="space-y-3">
          <p className="text-xs text-muted-foreground">
            回答済みの質問を匿名で掲載しています。同じ疑問の解決にお役立てください。
          </p>
          {archived.length === 0 ? (
            <EmptyBox>まだ回答済みの質問がありません。</EmptyBox>
          ) : (
            archived.map((q) => (
              <Card key={q.id}>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold text-primary">Q. 受講生からの質問</p>
                    <h3 className="font-semibold">{q.title}</h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <Markdown className="prose-sm">{q.body}</Markdown>
                    </div>
                  </div>
                  {(answersByQuestion.get(q.id) ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-md bg-muted/60 p-3 text-sm"
                    >
                      <p className="mb-1 text-xs font-semibold text-emerald-700">
                        A. 運営からの回答
                      </p>
                      <Markdown className="prose-sm">{a.body}</Markdown>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* 自分の質問 */}
        <TabsContent value="mine" className="space-y-2">
          {myQuestions.length === 0 ? (
            <EmptyBox>まだ質問を投稿していません。</EmptyBox>
          ) : (
            <ul className="space-y-2">
              {myQuestions.map((q) => (
                <li key={q.id}>
                  <Link href={`/questions/${q.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{q.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(q.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {q.status === "answered" ? (
                            <Badge variant="success">回答済み</Badge>
                          ) : (
                            <Badge variant="warning">未回答</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
