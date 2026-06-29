"use client";

import { useFormState } from "react-dom";
import type { PostFormState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/markdown-editor";
import { SubmitButton } from "@/components/submit-button";
import type { Category, Post } from "@/types/db";

type Action = (
  prev: PostFormState,
  formData: FormData,
) => Promise<PostFormState>;

const initial: PostFormState = {};

const TYPE_OPTIONS = [
  { value: "video", label: "動画（YouTube）" },
  { value: "document", label: "資料（PDF）" },
  { value: "seminar", label: "セミナー（動画＋要約）" },
  { value: "article", label: "記事（テキスト中心）" },
];

export function PostForm({
  action,
  categories,
  post,
}: {
  action: Action;
  categories: Category[];
  post?: Post;
}) {
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>種別</Label>
          <Select name="type" defaultValue={post?.type ?? "article"}>
            <SelectTrigger>
              <SelectValue placeholder="種別を選択" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <Select
            name="category_id"
            defaultValue={post?.category_id ?? categories[0]?.id ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title ?? ""}
          placeholder="例: 問診の基本フロー"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube_url">YouTube の URL（任意）</Label>
        <Input
          id="youtube_url"
          name="youtube_url"
          defaultValue={post?.youtube_url ?? ""}
          placeholder="https://youtu.be/xxxxxxxxxxx"
        />
        <p className="text-xs text-muted-foreground">
          動画・セミナーで使用します。限定公開の URL でも埋め込めます。
        </p>
      </div>

      <div className="space-y-2">
        <Label>本文 / 要約</Label>
        <MarkdownEditor name="body" defaultValue={post?.body ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">PDF を追加（任意・複数可）</Label>
        <Input id="files" name="files" type="file" accept="application/pdf" multiple />
        <p className="text-xs text-muted-foreground">
          資料・レジュメ等の PDF をアップロードできます。
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={post?.is_published ?? false}
          className="h-4 w-4 rounded border-input"
        />
        公開する（チェックを外すと下書きとして保存されます）
      </label>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="保存中…">保存する</SubmitButton>
    </form>
  );
}
