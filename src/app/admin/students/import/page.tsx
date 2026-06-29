import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkImportForm } from "./bulk-import-form";

export const metadata = { title: "生徒を一括登録" };

export default function ImportStudentsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/admin/students"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        生徒管理へ戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>生徒を一括登録</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
