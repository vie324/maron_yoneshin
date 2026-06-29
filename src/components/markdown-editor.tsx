"use client";

import * as React from "react";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Link2,
  Eye,
  Pencil,
} from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * ボタン付き Markdown エディタ＋プレビュー。
 * 非エンジニアでも見出し・太字・リスト等をボタンで挿入でき、
 * 「プレビュー」タブで仕上がりを確認できる。
 * 値は hidden ではなく Textarea の name 属性でフォーム送信される。
 */
export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder = "本文を入力（要約・記事など）",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = "", placeholderText = "") {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholderText;
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    setValue(next);
    // カーソル位置を調整
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function prefixLine(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setValue(next);
    requestAnimationFrame(() => el.focus());
  }

  const tools = [
    { icon: Heading2, label: "見出し", onClick: () => prefixLine("## ") },
    { icon: Bold, label: "太字", onClick: () => wrap("**", "**", "太字") },
    { icon: Italic, label: "斜体", onClick: () => wrap("*", "*", "斜体") },
    { icon: List, label: "箇条書き", onClick: () => prefixLine("- ") },
    { icon: ListOrdered, label: "番号リスト", onClick: () => prefixLine("1. ") },
    {
      icon: Link2,
      label: "リンク",
      onClick: () => wrap("[", "](https://)", "リンク文字"),
    },
  ];

  return (
    <Tabs defaultValue="write" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {tools.map((t) => (
            <Button
              key={t.label}
              type="button"
              variant="outline"
              size="sm"
              title={t.label}
              onClick={t.onClick}
            >
              <t.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        <TabsList>
          <TabsTrigger value="write">
            <Pencil className="mr-1 h-4 w-4" />
            入力
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-1 h-4 w-4" />
            プレビュー
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="write">
        <Textarea
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="min-h-[260px] font-mono text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          ※ ボタンで装飾を挿入できます。「##」は見出し、「-」は箇条書きです。
        </p>
      </TabsContent>

      <TabsContent value="preview">
        <div className="min-h-[260px] rounded-md border p-4">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              （プレビューする本文がありません）
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
