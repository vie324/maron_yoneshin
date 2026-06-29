import { getProfile, getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { PasswordForm } from "./password-form";

export const metadata = { title: "アカウント" };

export default async function AccountPage() {
  const [profile, user] = await Promise.all([getProfile(), getUser()]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">アカウント</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">登録情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="お名前" value={profile?.full_name || "—"} />
          <Row label="メールアドレス" value={user?.email || "—"} />
          <Row
            label="種別"
            value={profile?.role === "admin" ? "運営者" : "受講生"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">パスワードの変更</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <div className="pt-2">
        <SignOutButton variant="outline" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
