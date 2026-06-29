"use client";

import { useFormState } from "react-dom";
import { Ban, CheckCircle2, KeyRound, Trash2 } from "lucide-react";
import {
  setStudentStatus,
  deleteStudent,
  resetStudentPassword,
  type ResetPasswordState,
} from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/submit-button";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/db";

const resetInitial: ResetPasswordState = {};

export function StudentRow({ student }: { student: Profile }) {
  const [resetState, resetAction] = useFormState(
    resetStudentPassword,
    resetInitial,
  );

  const suspended = student.status === "suspended";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{student.full_name || "（無名）"}</span>
            {suspended ? (
              <Badge variant="destructive">停止中</Badge>
            ) : (
              <Badge variant="success">有効</Badge>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {student.email}
          </p>
          <p className="text-xs text-muted-foreground">
            登録: {formatDate(student.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 有効 / 停止 切替 */}
          <form action={setStudentStatus}>
            <input type="hidden" name="id" value={student.id} />
            <input
              type="hidden"
              name="status"
              value={suspended ? "active" : "suspended"}
            />
            <Button type="submit" variant="outline" size="sm">
              {suspended ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  有効化
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  停止
                </>
              )}
            </Button>
          </form>

          {/* パスワード再設定 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <KeyRound className="h-4 w-4" />
                パスワード
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>パスワードの再設定</DialogTitle>
                <DialogDescription>
                  {student.full_name} さんの新しいパスワードを設定します。
                  設定後、生徒本人にお伝えください。
                </DialogDescription>
              </DialogHeader>
              <form action={resetAction} className="space-y-3">
                <input type="hidden" name="id" value={student.id} />
                <div className="space-y-2">
                  <Label htmlFor={`pw-${student.id}`}>新しいパスワード</Label>
                  <Input
                    id={`pw-${student.id}`}
                    name="password"
                    type="text"
                    placeholder="8文字以上"
                    required
                  />
                </div>
                {resetState?.error && (
                  <p className="text-sm text-destructive">{resetState.error}</p>
                )}
                {resetState?.success && (
                  <p className="text-sm text-emerald-700">
                    {resetState.success}
                  </p>
                )}
                <DialogFooter>
                  <SubmitButton size="sm" pendingText="設定中…">
                    再設定する
                  </SubmitButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* 削除 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>本当に削除しますか？</DialogTitle>
                <DialogDescription>
                  {student.full_name} さんのアカウントを完全に削除します。
                  この操作は取り消せません。投稿された質問も削除されます。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    キャンセル
                  </Button>
                </DialogClose>
                <form action={deleteStudent}>
                  <input type="hidden" name="id" value={student.id} />
                  <SubmitButton
                    variant="destructive"
                    size="sm"
                    pendingText="削除中…"
                  >
                    削除する
                  </SubmitButton>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
