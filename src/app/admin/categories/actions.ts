"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function ensureAdmin(): Promise<boolean> {
  const me = await getProfile();
  return me?.role === "admin";
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-ぁ-んァ-ヶ一-龠]/g, "");
  return base || `cat-${Date.now()}`;
}

export async function createCategory(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  if (!name) return;

  const supabase = createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    sort_order: sortOrder,
    course_id: course?.id ?? null,
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  if (!id || !name) return;

  const supabase = createClient();
  await supabase
    .from("categories")
    .update({ name, sort_order: sortOrder })
    .eq("id", id);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  if (!(await ensureAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
