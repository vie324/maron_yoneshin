import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Markdown } from "@/components/markdown";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { POST_TYPE_LABEL, formatDate, youtubeId } from "@/lib/utils";
import type { Attachment, Post } from "@/types/db";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!post) notFound();
  const p = post as Post;

  const { data: attachmentRows } = await supabase
    .from("attachments")
    .select("*")
    .eq("post_id", p.id)
    .order("created_at", { ascending: true });

  const attachments = (attachmentRows ?? []) as Attachment[];

  // 署名付き URL を発行（閲覧用・ダウンロード用）。閲覧権限は RLS で既に担保済み。
  const admin = createAdminClient();
  const files = await Promise.all(
    attachments.map(async (a) => {
      const { data: view } = await admin.storage
        .from("attachments")
        .createSignedUrl(a.file_path, 60 * 60);
      const { data: dl } = await admin.storage
        .from("attachments")
        .createSignedUrl(a.file_path, 60 * 60, { download: a.file_name });
      return {
        ...a,
        viewUrl: view?.signedUrl ?? null,
        downloadUrl: dl?.signedUrl ?? null,
        isPdf: (a.mime_type ?? "").includes("pdf"),
      };
    }),
  );

  const hasVideo = !!youtubeId(p.youtube_url);

  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{POST_TYPE_LABEL[p.type]}</Badge>
          {!p.is_published && <Badge variant="warning">非公開（下書き）</Badge>}
        </div>
        <h1 className="text-xl font-bold leading-tight">{p.title}</h1>
        <p className="text-xs text-muted-foreground">
          {formatDate(p.created_at)}
        </p>
      </header>

      {hasVideo && (
        <section className="space-y-2">
          {p.type === "seminar" && (
            <h2 className="text-sm font-semibold text-muted-foreground">
              フル版動画
            </h2>
          )}
          <YouTubeEmbed url={p.youtube_url} />
        </section>
      )}

      {p.body.trim() && (
        <section>
          {p.type === "seminar" && (
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              要約
            </h2>
          )}
          <Markdown>{p.body}</Markdown>
        </section>
      )}

      {files.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">資料</h2>
          {files.map((f) => (
            <Card key={f.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium">
                      {f.file_name}
                    </span>
                  </div>
                  {f.downloadUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={f.downloadUrl}>
                        <Download className="h-4 w-4" />
                        保存
                      </a>
                    </Button>
                  )}
                </div>
                {f.isPdf && f.viewUrl && (
                  <iframe
                    src={f.viewUrl}
                    className="h-[70vh] w-full rounded-md border"
                    title={f.file_name}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!hasVideo && !p.body.trim() && files.length === 0 && (
        <p className="text-sm text-muted-foreground">
          このコンテンツにはまだ本文がありません。
        </p>
      )}
    </article>
  );
}
