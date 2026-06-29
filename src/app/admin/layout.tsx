import Link from "next/link";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "講座コミュニティ";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-background">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="font-semibold">
              {siteName}
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                管理画面
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <Eye className="h-4 w-4" />
                  受講生の画面
                </Link>
              </Button>
              <SignOutButton />
            </div>
          </div>
          <div className="mt-3">
            <AdminNav />
          </div>
        </div>
      </header>

      <main className="container py-6">{children}</main>
    </div>
  );
}
