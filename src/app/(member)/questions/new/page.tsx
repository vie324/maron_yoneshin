import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionForm } from "./question-form";

export const metadata = { title: "質問する" };

export default function NewQuestionPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/questions"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Q&A へ戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>質問を投稿する</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm />
        </CardContent>
      </Card>
    </div>
  );
}
