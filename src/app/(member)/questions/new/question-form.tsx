"use client";

import { useFormState } from "react-dom";
import { createQuestion, type QuestionFormState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

const initial: QuestionFormState = {};

export function QuestionForm() {
  const [state, formAction] = useFormState(createQuestion, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">件名</Label>
        <Input
          id="title"
          name="title"
          placeholder="例: 問診票の書き方について"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">質問内容</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="質問の内容をできるだけ具体的に入力してください。"
          className="min-h-[160px]"
          required
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        ※ 回答が付くと、お名前を伏せた状態で「みんなのQ&A」に掲載される場合があります。
      </p>

      <SubmitButton className="w-full" pendingText="送信中…">
        質問を送信する
      </SubmitButton>
    </form>
  );
}
