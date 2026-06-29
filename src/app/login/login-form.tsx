"use client";

import { useFormState } from "react-dom";
import { login, type LoginState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(login, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="例: tanaka@maron-course.jp"
          required
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="パスワード"
          required
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" pendingText="ログイン中…">
        ログイン
      </SubmitButton>
    </form>
  );
}
