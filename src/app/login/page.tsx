import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo/mode";
import { LoginForm } from "./login-form";
import { DemoLogin } from "./demo-login";

export const metadata: Metadata = { title: "ログイン" };

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "講座コミュニティ";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">{siteName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            受講生・運営者の方はこちらからログインしてください。
          </p>
        </CardHeader>
        <CardContent>
          {isDemoMode() ? (
            <DemoLogin />
          ) : (
            <>
              <LoginForm />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                ログイン情報がわからない場合は運営者にお問い合わせください。
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
