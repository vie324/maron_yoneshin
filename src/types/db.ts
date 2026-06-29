// アプリ全体で使うドメイン型（Supabase スキーマと対応）

export type Role = "admin" | "member";
export type UserStatus = "active" | "suspended";
export type PostType = "video" | "document" | "seminar" | "article";
export type QuestionStatus = "open" | "answered";

export interface Course {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  course_id: string | null;
  full_name: string;
  email: string | null;
  role: Role;
  status: UserStatus;
  created_at: string;
}

export interface Category {
  id: string;
  course_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  course_id: string | null;
  category_id: string | null;
  type: PostType;
  title: string;
  body: string;
  youtube_url: string | null;
  is_published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  post_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Question {
  id: string;
  course_id: string | null;
  author_id: string | null;
  title: string;
  body: string;
  status: QuestionStatus;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}
