"use client";

import * as React from "react";
import { useFormState } from "react-dom";
import { Shuffle } from "lucide-react";
import { createStudent, type CreateStudentState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

const initial: CreateStudentState = {};
const domain = process.env.NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN;

export function StudentCreateForm() {
  const [state, formAction] = useFormState(createStudent, initial);
  const [password, setPassword] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  function generate() {
    const chars =
      "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) out += chars[arr[i] % chars.length];
    setPassword(out);
  }

  // 登録成功時にフォームをクリア
  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPassword("");
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">氏名</Label>
        <Input
          id="full_name"
          name="full_name"
          placeholder="例: 山田 太郎"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          メールアドレス（またはユーザー名）
        </Label>
        <Input
          id="email"
          name="email"
          placeholder={domain ? `例: yamada（→ yamada@${domain}）` : "例: yamada@example.com"}
          required
        />
        {domain && (
          <p className="text-xs text-muted-foreground">
            「@」を含めない場合は自動で <code>@{domain}</code> を付けます。
            生徒はこのメールアドレスでログインします。
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">初期パスワード</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            name="password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8文字以上"
            required
          />
          <Button type="button" variant="outline" onClick={generate}>
            <Shuffle className="h-4 w-4" />
            自動生成
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          登録後、このパスワードを生徒にお伝えください。
        </p>
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

      <SubmitButton pendingText="登録中…">この内容で登録</SubmitButton>
    </form>
  );
}
