import { Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import type { Category } from "@/types/db";

export const metadata = { title: "カテゴリ" };

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  const categories = (data ?? []) as Category[];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold">カテゴリ</h1>
        <p className="text-sm text-muted-foreground">
          コンテンツを整理する分類です。並び順は数字が小さいほど上に表示されます。
        </p>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-end gap-2 p-4">
              <form
                action={updateCategory}
                className="flex flex-1 flex-wrap items-end gap-2"
              >
                <input type="hidden" name="id" value={c.id} />
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">名前</Label>
                  <Input name="name" defaultValue={c.name} required />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">並び順</Label>
                  <Input
                    name="sort_order"
                    type="number"
                    defaultValue={c.sort_order}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">
                  <Save className="h-4 w-4" />
                  保存
                </Button>
              </form>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            カテゴリがありません。下から追加してください。
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="flex flex-wrap items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">名前</Label>
              <Input name="name" placeholder="例: 症例集" required />
            </div>
            <div className="w-20 space-y-1">
              <Label className="text-xs">並び順</Label>
              <Input name="sort_order" type="number" defaultValue={0} />
            </div>
            <Button type="submit" size="sm">
              追加
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
