"use client";

import { useFormState } from "react-dom";
import { bulkCreateStudents, type BulkState } from "../actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";

const initial: BulkState = {};
const domain = process.env.NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN;

export function BulkImportForm() {
  const [state, formAction] = useFormState(bulkCreateStudents, initial);

  const created = state?.results?.filter((r) => r.status === "created") ?? [];
  const failed = state?.results?.filter((r) => r.status === "failed") ?? [];

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rows">生徒リスト（1行に1名）</Label>
          <Textarea
            id="rows"
            name="rows"
            className="min-h-[200px] font-mono text-sm"
            placeholder={
              "氏名, メール(またはユーザー名), 初期パスワード(省略可)\n" +
              "山田太郎, yamada, \n" +
              "佐藤花子, sato, hanako2025\n" +
              "鈴木一郎, suzuki@example.com, "
            }
          />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              各行を「<b>氏名, メール, パスワード</b>」の順でカンマ区切りで入力します。
            </p>
            <p>
              ・メールに「@」が無い場合は自動で
              {domain ? <code> @{domain}</code> : " 設定済みドメイン"} を付けます。
            </p>
            <p>
              ・パスワードを空欄にすると自動生成し、下に表示します（生徒へ伝達用）。
            </p>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="登録中…">一括登録する</SubmitButton>
      </form>

      {state?.results && (
        <div className="space-y-4">
          <div className="flex gap-2 text-sm">
            <Badge variant="success">成功 {created.length}</Badge>
            {failed.length > 0 && (
              <Badge variant="destructive">失敗 {failed.length}</Badge>
            )}
          </div>

          {created.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="p-2">行</th>
                    <th className="p-2">メール</th>
                    <th className="p-2">パスワード</th>
                  </tr>
                </thead>
                <tbody>
                  {created.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.line.split(/[,\t]/)[0]}</td>
                      <td className="p-2 font-mono">{r.email}</td>
                      <td className="p-2 font-mono">{r.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t bg-amber-50 p-2 text-xs text-amber-800">
                ※ パスワードはこの画面でしか確認できません。必要に応じて控えてから生徒へお伝えください。
              </p>
            </div>
          )}

          {failed.length > 0 && (
            <div className="rounded-md border border-destructive/30">
              <table className="w-full text-sm">
                <thead className="bg-destructive/10 text-left">
                  <tr>
                    <th className="p-2">行</th>
                    <th className="p-2">理由</th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.line}</td>
                      <td className="p-2 text-destructive">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
