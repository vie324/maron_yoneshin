import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { StudentRow } from "./student-row";
import type { Profile } from "@/types/db";

export const metadata = { title: "生徒管理" };

export default async function StudentsPage() {
  // service_role で一覧取得（管理者であることは layout の requireAdmin で担保済み）
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  const students = (data ?? []) as Profile[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">生徒管理</h1>
          <p className="text-sm text-muted-foreground">
            登録中の受講生: {students.length} 名
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/students/import">
              <Upload className="h-4 w-4" />
              一括登録
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/students/new">
              <Plus className="h-4 w-4" />
              生徒を追加
            </Link>
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          まだ生徒が登録されていません。「生徒を追加」から登録してください。
        </p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <StudentRow key={s.id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}
