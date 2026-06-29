import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, POST_TYPE_LABEL, formatDate } from "@/lib/utils";
import type { Category, Post } from "@/types/db";

export const metadata = { title: "コンテンツ" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string; type?: string };
}) {
  const supabase = createClient();
  const { category, type } = searchParams;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  let query = supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category_id", category);
  if (type) query = query.eq("type", type);

  const { data: posts } = await query;
  const cats = (categories ?? []) as Category[];
  const list = (posts ?? []) as Post[];
  const catName = cats.find((c) => c.id === category)?.name;

  function chipHref(catId?: string) {
    return catId ? `/library?category=${catId}` : "/library";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{catName ?? "コンテンツ一覧"}</h1>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        <FilterChip href={chipHref()} active={!category}>
          すべて
        </FilterChip>
        {cats.map((c) => (
          <FilterChip
            key={c.id}
            href={chipHref(c.id)}
            active={category === c.id}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          このカテゴリにはまだコンテンツがありません。
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/posts/${p.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{p.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(p.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">{POST_TYPE_LABEL[p.type]}</Badge>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}
