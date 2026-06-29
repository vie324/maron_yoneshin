"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "生徒管理", icon: Users },
  { href: "/admin/posts", label: "コンテンツ", icon: FileText },
  { href: "/admin/categories", label: "カテゴリ", icon: FolderTree },
  { href: "/admin/questions", label: "質問対応", icon: MessageCircleQuestion },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
