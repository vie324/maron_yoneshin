-- ============================================================================
-- 0002_rls.sql  —  Row Level Security（行レベルセキュリティ）＋ 匿名化ビュー
-- ============================================================================
-- ポイント:
--   1. profiles を参照するヘルパー関数は SECURITY DEFINER にして RLS を回避し、
--      「profiles ポリシー内で profiles を参照する」典型的な無限再帰を防ぐ。
--   2. 停止中（suspended）の生徒はコンテンツを一切読めない。
--   3. 質問の匿名化:
--        - 基本テーブル questions は「自分の質問のみ」読める（生徒）。
--        - 他生徒向けの回答済みアーカイブは投稿者を含まない匿名ビュー経由のみ公開。
-- ============================================================================

-- ── ヘルパー関数（SECURITY DEFINER で profiles を安全に参照） ──────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- 有効な生徒、または管理者（管理者も閲覧可能）
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role in ('member', 'admin')
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_active_member() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_member() to authenticated;

-- ── RLS 有効化 ────────────────────────────────────────────────────────────
alter table public.courses     enable row level security;
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.posts       enable row level security;
alter table public.attachments enable row level security;
alter table public.questions   enable row level security;
alter table public.answers     enable row level security;

-- ── courses ───────────────────────────────────────────────────────────────
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
  for select using (auth.uid() is not null);

drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- ── profiles ──────────────────────────────────────────────────────────────
-- 自分のプロフィールは閲覧可。管理者は全件閲覧可。
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- 書き込み（発行・停止・削除・氏名変更）は管理者のみ。
-- ※ 生徒の自己サインアップは無効。新規 profiles は handle_new_user
--    （SECURITY DEFINER トリガー）が RLS を迂回して作成する。
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── categories ────────────────────────────────────────────────────────────
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (public.is_active_member());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── posts ─────────────────────────────────────────────────────────────────
-- 生徒: 公開済みのみ閲覧（停止中は不可）。管理者: 全件閲覧。
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts
  for select using (
    public.is_admin()
    or (public.is_active_member() and is_published = true)
  );

drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── attachments ───────────────────────────────────────────────────────────
drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.posts p
      where p.id = attachments.post_id
        and p.is_published = true
        and public.is_active_member()
    )
  );

drop policy if exists attachments_admin_write on public.attachments;
create policy attachments_admin_write on public.attachments
  for all using (public.is_admin()) with check (public.is_admin());

-- ── questions ─────────────────────────────────────────────────────────────
-- 生徒は「自分の質問だけ」閲覧できる（他人の質問は匿名ビュー経由のみ）。
drop policy if exists questions_select_own_or_admin on public.questions;
create policy questions_select_own_or_admin on public.questions
  for select using (author_id = auth.uid() or public.is_admin());

-- 有効な生徒は自分名義で質問を投稿できる。
drop policy if exists questions_insert_self on public.questions;
create policy questions_insert_self on public.questions
  for insert with check (author_id = auth.uid() and public.is_active_member());

-- 更新・削除（ステータス変更含む）は管理者のみ。
drop policy if exists questions_admin_update on public.questions;
create policy questions_admin_update on public.questions
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists questions_admin_delete on public.questions;
create policy questions_admin_delete on public.questions
  for delete using (public.is_admin());

-- ── answers ───────────────────────────────────────────────────────────────
-- 回答は「自分の質問への回答」または管理者のみ基本テーブルから読める。
-- 他生徒向けの匿名アーカイブはビュー経由（下記）。
drop policy if exists answers_select on public.answers;
create policy answers_select on public.answers
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.questions q
      where q.id = answers.question_id
        and q.author_id = auth.uid()
    )
  );

drop policy if exists answers_admin_write on public.answers;
create policy answers_admin_write on public.answers
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 匿名 Q&A アーカイブ（回答済みの質問を、投稿者を伏せて全有効生徒に公開）
-- ----------------------------------------------------------------------------
--   security_invoker = false … ビューは所有者(postgres)権限で実行され、
--   questions/answers の RLS を迂回する。代わりに author_id を一切返さず、
--   WHERE 句で is_active_member() を評価して「有効な生徒のみ・回答済みのみ」に限定。
--   anon には権限を与えない（authenticated のみ）。
-- ============================================================================
drop view if exists public.qa_archive;
create view public.qa_archive
  with (security_invoker = false)
as
  select q.id, q.title, q.body, q.status, q.created_at
  from public.questions q
  where q.status = 'answered'
    and public.is_active_member();

drop view if exists public.qa_archive_answers;
create view public.qa_archive_answers
  with (security_invoker = false)
as
  select a.id, a.question_id, a.body, a.created_at
  from public.answers a
  join public.questions q on q.id = a.question_id
  where q.status = 'answered'
    and public.is_active_member();

revoke all on public.qa_archive          from anon, authenticated, public;
revoke all on public.qa_archive_answers  from anon, authenticated, public;
grant select on public.qa_archive          to authenticated;
grant select on public.qa_archive_answers  to authenticated;

-- ============================================================================
-- Storage: 非公開バケット attachments
--   * 生徒は直接アクセス不可。サーバーが署名付き URL を発行して閲覧/DL させる。
--   * 管理者（authenticated かつ is_admin）は直接の読み書きを許可。
--     （実装ではサーバー側 service_role 経由でアップロードするが、保険として付与）
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists attachments_storage_admin_all on storage.objects;
create policy attachments_storage_admin_all on storage.objects
  for all to authenticated
  using (bucket_id = 'attachments' and public.is_admin())
  with check (bucket_id = 'attachments' and public.is_admin());
