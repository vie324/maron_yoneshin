import { youtubeId } from "@/lib/utils";

/** YouTube URL（限定公開/公開）をレスポンシブに埋め込み表示。 */
export function YouTubeEmbed({ url }: { url: string | null | undefined }) {
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black pt-[56.25%]">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
