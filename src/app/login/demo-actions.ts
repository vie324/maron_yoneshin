"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE } from "@/lib/demo/mode";
import { DEMO_ADMIN_ID, DEMO_MEMBER_ID } from "@/lib/demo/data";

/** デモモードのワンクリックログイン（運営者 / 受講生）。 */
export async function demoLogin(formData: FormData) {
  const role = String(formData.get("role") ?? "member");
  const id = role === "admin" ? DEMO_ADMIN_ID : DEMO_MEMBER_ID;

  cookies().set(DEMO_COOKIE, id, {
    path: "/",
    httpOnly: false, // ブラウザ側のログアウトで消せるように
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(role === "admin" ? "/admin" : "/dashboard");
}
