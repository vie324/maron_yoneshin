"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
  className,
}: {
  variant?: "ghost" | "outline";
  className?: string;
}) {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <Button variant={variant} size="sm" onClick={signOut} className={className}>
      <LogOut className="h-4 w-4" />
      ログアウト
    </Button>
  );
}
