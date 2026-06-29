"use client";

import { useFormState } from "react-dom";
import { answerQuestion, type AnswerState } from "../actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

const initial: AnswerState = {};

export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, formAction] = useFormState(answerQuestion, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="question_id" value={questionId} />
      <div className="space-y-2">
        <Label htmlFor="body">回答</Label>
        <Textarea
          id="body"
          name="body"
          className="min-h-[140px]"
          placeholder="生徒への回答を入力してください。"
          required
        />
      </div>
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="送信中…">回答を送信</SubmitButton>
    </form>
  );
}
