import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = { title: "アカウント停止中" };

export default function SuspendedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>アカウントが停止されています</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            現在このアカウントではコンテンツを閲覧できません。
            ご不明な点は運営者にお問い合わせください。
          </p>
          <SignOutButton variant="outline" />
        </CardContent>
      </Card>
    </main>
  );
}
