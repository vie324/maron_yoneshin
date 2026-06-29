import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { MemberBottomNav } from "@/components/member-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "講座コミュニティ";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireMember();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link href="/dashboard" className="font-semibold">
          {siteName}
        </Link>
        <div className="flex items-center gap-1">
          {profile.role === "admin" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <Shield className="h-4 w-4" />
                管理画面
              </Link>
            </Button>
          )}
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <MemberBottomNav />
    </div>
  );
}
