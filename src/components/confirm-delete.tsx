"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
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

/** サーバーアクションを確認ダイアログ付きで実行する削除ボタン。 */
export function ConfirmDelete({
  action,
  hidden,
  triggerLabel = "削除",
  title = "本当に削除しますか？",
  description = "この操作は取り消せません。",
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
  triggerLabel?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              キャンセル
            </Button>
          </DialogClose>
          <form action={action}>
            {Object.entries(hidden).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <SubmitButton variant="destructive" size="sm" pendingText="削除中…">
              削除する
            </SubmitButton>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
