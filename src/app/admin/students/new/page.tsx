import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentCreateForm } from "./student-create-form";

export const metadata = { title: "生徒を追加" };

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link
        href="/admin/students"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        生徒管理へ戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>生徒を1名追加</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
