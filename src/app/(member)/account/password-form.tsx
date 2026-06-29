"use client";

import { useFormState } from "react-dom";
import { changePassword, type PasswordState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

const initial: PasswordState = {};

export function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">新しいパスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8文字以上"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">新しいパスワード（確認）</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="もう一度入力"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <SubmitButton pendingText="変更中…">パスワードを変更</SubmitButton>
    </form>
  );
}
