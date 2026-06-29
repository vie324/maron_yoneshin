"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth";

// ── 共通ヘルパー ────────────────────────────────────────────────────────────
async function ensureAdmin(): Promise<string | null> {
  const me = await getProfile();
  if (me?.role !== "admin") return "この操作を行う権限がありません。";
  return null;
}

function normalizeEmail(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (value.includes("@")) return value;
  const domain = process.env.NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN;
  return domain ? `${value}@${domain}` : value;
}

function generatePassword(): string {
  // 記号を避けた読みやすい12文字
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "x").slice(0, 12);
}

// ── 生徒を1名発行 ───────────────────────────────────────────────────────────
export interface CreateStudentState {
  error?: string;
  success?: string;
}

export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  const denied = await ensureAdmin();
  if (denied) return { error: denied };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!fullName) return { error: "氏名を入力してください。" };
  if (!email) return { error: "メールアドレス（またはユーザー名）を入力してください。" };
  if (password.length < 8)
    return { error: "初期パスワードは8文字以上で設定してください。" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 確認メールは送らずに即有効化
    user_metadata: { full_name: fullName, role: "member", status: "active" },
  });

  if (error) {
    const msg = /already been registered|already exists/i.test(error.message)
      ? "このメールアドレスは既に登録されています。"
      : `作成に失敗しました: ${error.message}`;
    return { error: msg };
  }

  revalidatePath("/admin/students");
  return { success: `${fullName} さん（${email}）を登録しました。` };
}

// ── 生徒の一括登録 ─────────────────────────────────────────────────────────
export interface BulkResultRow {
  line: string;
  status: "created" | "failed";
  email?: string;
  password?: string;
  message?: string;
}
export interface BulkState {
  error?: string;
  results?: BulkResultRow[];
}

export async function bulkCreateStudents(
  _prev: BulkState,
  formData: FormData,
): Promise<BulkState> {
  const denied = await ensureAdmin();
  if (denied) return { error: denied };

  const raw = String(formData.get("rows") ?? "").trim();
  if (!raw) return { error: "登録したい生徒を入力してください。" };

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { error: "有効な行がありません。" };
  if (lines.length > 200)
    return { error: "一度に登録できるのは200名までです。" };

  const admin = createAdminClient();
  const results: BulkResultRow[] = [];

  for (const line of lines) {
    const cols = line
      .split(/[,\t]/)
      .map((c) => c.trim());
    const fullName = cols[0] ?? "";
    const email = normalizeEmail(cols[1] ?? "");
    const password = cols[2] && cols[2].length >= 8 ? cols[2] : generatePassword();

    if (!fullName || !email) {
      results.push({
        line,
        status: "failed",
        message: "氏名とメール（ユーザー名）が必要です。",
      });
      continue;
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "member", status: "active" },
    });

    if (error) {
      results.push({
        line,
        status: "failed",
        email,
        message: /already/i.test(error.message)
          ? "既に登録済み"
          : error.message,
      });
    } else {
      results.push({ line, status: "created", email, password });
    }
  }

  revalidatePath("/admin/students");
  return { results };
}

// ── ステータス変更（有効 / 停止） ──────────────────────────────────────────
export async function setStudentStatus(formData: FormData): Promise<void> {
  const denied = await ensureAdmin();
  if (denied) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "suspended"].includes(status)) return;

  const admin = createAdminClient();
  await admin.from("profiles").update({ status }).eq("id", id);
  revalidatePath("/admin/students");
}

// ── 削除 ───────────────────────────────────────────────────────────────────
export async function deleteStudent(formData: FormData): Promise<void> {
  const denied = await ensureAdmin();
  if (denied) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  // auth.users を削除 → profiles は ON DELETE CASCADE で自動削除
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/admin/students");
}

// ── パスワード再設定 ───────────────────────────────────────────────────────
export interface ResetPasswordState {
  error?: string;
  success?: string;
}

export async function resetStudentPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const denied = await ensureAdmin();
  if (denied) return { error: denied };

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id) return { error: "対象が指定されていません。" };
  if (password.length < 8)
    return { error: "パスワードは8文字以上で設定してください。" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return { error: `変更に失敗しました: ${error.message}` };

  return { success: "パスワードを再設定しました。生徒にお伝えください。" };
}
