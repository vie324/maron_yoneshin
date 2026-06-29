-- ============================================================================
-- 0001_init.sql  —  テーブル定義（スキーマ）
-- 講座生向けクローズドコミュニティサイト
-- ============================================================================
-- 設計方針:
--   * 単一講座でスタートしつつ、将来のマルチコース化に備え全テーブルに
--     nullable な course_id を持たせる（UI は単一講座固定）。
--   * 動画/資料/セミナー/記事は posts.type フラグで汎用化（テーブル乱立を回避）。
--   * RLS（Row Level Security）は 0002_rls.sql で定義する。
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── 講座（将来のマルチコース用 / 初期は1件 seed） ──────────────────────────
create table if not exists public.courses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ── プロフィール（auth.users と 1:1） ─────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  course_id  uuid references public.courses(id) on delete set null,
  full_name  text not null default '',
  email      text,                                 -- 表示用にメールを冗長保持
  role       text not null default 'member' check (role in ('admin', 'member')),
  status     text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'ユーザー情報。role=admin は運営者、member は生徒。status=suspended は停止中（閲覧不可）。';

-- ── カテゴリ ──────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid references public.courses(id) on delete cascade,
  name       text not null,
  slug       text not null,
  sort_order int  not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

-- ── 投稿（汎用コンテンツ） ────────────────────────────────────────────────
--   type:
--     video     … 動画ライブラリ（YouTube 埋め込み）
--     document  … 資料（PDF 添付）
--     seminar   … セミナーアーカイブ（フル版動画 youtube_url ＋ 要約 body）
--     article   … 学習コンテンツ / マーケティング（テキスト＋PDF＋動画の汎用記事）
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,
  type         text not null default 'article' check (type in ('video', 'document', 'seminar', 'article')),
  title        text not null,
  body         text not null default '',          -- Markdown
  youtube_url  text,                               -- nullable（動画/セミナーで使用）
  is_published boolean not null default false,
  author_id    uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 添付ファイル（PDF 等 / Supabase Storage） ────────────────────────────
create table if not exists public.attachments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  file_path  text not null,                        -- Storage 内のパス（バケット attachments）
  file_name  text not null,                        -- 表示名
  mime_type  text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ── 質問 ──────────────────────────────────────────────────────────────────
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid references public.courses(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  title      text not null,
  body       text not null,
  status     text not null default 'open' check (status in ('open', 'answered')),
  created_at timestamptz not null default now()
);

-- ── 回答（管理者のみ作成） ────────────────────────────────────────────────
create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ── インデックス ──────────────────────────────────────────────────────────
create index if not exists idx_posts_category   on public.posts (category_id);
create index if not exists idx_posts_type        on public.posts (type);
create index if not exists idx_posts_published   on public.posts (is_published);
create index if not exists idx_attachments_post  on public.attachments (post_id);
create index if not exists idx_questions_author  on public.questions (author_id);
create index if not exists idx_questions_status  on public.questions (status);
create index if not exists idx_answers_question  on public.answers (question_id);

-- ── updated_at 自動更新トリガー ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ── auth.users 作成時に profiles を自動生成 ───────────────────────────────
--   管理者が service_role の Admin API でユーザーを作成し、
--   user_metadata に full_name / role / status / course_id を渡す想定。
--   course_id 未指定なら既定（最初に作られた）講座へ自動で紐付け。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, status, course_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'member'),
    coalesce(new.raw_user_meta_data ->> 'status', 'active'),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'course_id', '')::uuid,
      (select id from public.courses order by created_at limit 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
