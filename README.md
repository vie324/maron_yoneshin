# 講座コミュニティ（受講生向けクローズド会員サイト）

整骨院・鍼灸の技術講座の受講生だけがログインして閲覧できる、クローズドな
会員制コミュニティサイトです。運営者（非エンジニア）が画面上で生徒の追加・削除・
コンテンツ投稿まで完結できることを重視しています。

- **フレームワーク**: Next.js (App Router, TypeScript)
- **DB / 認証 / ストレージ**: Supabase (Postgres + Auth + Storage)
- **UI**: Tailwind CSS + shadcn/ui（スマホ最適化を優先）
- **動画**: YouTube 埋め込み / **資料**: PDF（Storage + 署名付きURL）
- **ホスティング**: Vercel

---

## 主な機能

| 区分 | 内容 |
|---|---|
| 認証 | Supabase Auth（メール＋パスワード）。自己サインアップは無効。未ログインは一切閲覧不可。 |
| 生徒管理（管理者） | 発行・停止/有効化・削除・パスワード再設定・**一括登録**（CSV/テキスト）。 |
| コンテンツ（汎用 posts） | 動画 / 資料(PDF) / セミナー(動画＋要約) / 記事 をカテゴリ別に投稿・編集・公開。 |
| Q&A 掲示板 | 生徒が質問、管理者が回答。**回答済みは匿名でアーカイブ公開**。未回答/回答済み管理。 |
| セキュリティ | 全テーブルで **RLS** を有効化。停止中の生徒は閲覧不可。質問の匿名化はDBビューで担保。 |

---

## ディレクトリ構成

```
src/
  app/
    login/                 ログイン
    suspended/             停止アカウント向け案内
    (member)/              受講生UI（要・有効会員）
      dashboard/ library/ posts/[id]/ questions/ account/
    admin/                 管理UI（要・admin）
      students/ posts/ categories/ questions/
  components/ui/           shadcn/ui コンポーネント
  lib/supabase/            client / server / admin(service role) / middleware
  lib/auth.ts              認証ガード
supabase/migrations/       0001_init / 0002_rls / 0003_seed
scripts/create-admin.mjs   最初の管理者作成
```

---

## セットアップ手順

### 1. Supabase プロジェクトを作成

1. <https://supabase.com> でプロジェクトを作成。
2. **Project Settings → API** から次を控える：
   - Project URL（`NEXT_PUBLIC_SUPABASE_URL`）
   - `anon` public key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
   - `service_role` secret key（`SUPABASE_SERVICE_ROLE_KEY`）
3. **Authentication → Providers → Email** を有効化し、
   **「Allow new users to sign up」を OFF**（自己サインアップ無効化）。
   メール確認はアプリ側で `email_confirm: true` を使うため不要です。

### 2. マイグレーションを適用（テーブル・RLS・初期データ）

`supabase/migrations/` の SQL を **番号順** に実行します。いずれかの方法で：

**A. Supabase ダッシュボードの SQL Editor**
`0001_init.sql` → `0002_rls.sql` → `0003_seed.sql` の順に貼り付けて実行。

**B. Supabase CLI**
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 3. 環境変数を設定

```bash
cp .env.example .env.local
# .env.local を編集して各キーを記入
```

`NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN` には生徒用の内部メールドメイン（例
`maron-course.jp`）を設定します。生徒のログイン名に「@」が無い場合、自動で
このドメインを補完します（受信できないアドレスでもログイン可能）。

### 4. 依存関係をインストールして起動

```bash
npm install
npm run dev
# http://localhost:3000 を開く
```

### 5. 最初の管理者を作成

```bash
npm run create-admin -- admin@maron-course.jp StrongPass123 "運営 太郎"
```

作成したメール／パスワードで `/login` からログインすると、管理画面
`/admin` に入れます。あとは画面から生徒の追加やコンテンツ投稿が可能です。

---

## ローカルでの動作確認の流れ

1. `npm run dev` で起動し `/login` へ。未ログインだと自動で `/login` に飛ぶことを確認。
2. 管理者でログイン → `/admin` ダッシュボード表示。
3. **生徒管理 → 生徒を追加** で生徒を1名発行（パスワードは自動生成可）。
4. 別ブラウザ（またはシークレット）でその生徒としてログイン →
   `/dashboard` が表示され、コンテンツのみ閲覧できることを確認。
5. **コンテンツ → 新規投稿** で動画/PDF/セミナー/記事を作成・公開 →
   生徒側で閲覧できることを確認。
6. 生徒側で **質問する** → 管理者側 **質問対応** で回答 →
   生徒側／「みんなのQ&A」に匿名で表示されることを確認。
7. 生徒を **停止** にすると閲覧できなくなる（`/suspended` 表示）ことを確認。

---

## Vercel へのデプロイ

1. GitHub リポジトリを Vercel に接続。
2. **Settings → Environment Variables** に以下を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（**Production/Preview のみ・秘匿**）
   - `NEXT_PUBLIC_SITE_NAME`（任意）
   - `NEXT_PUBLIC_MEMBER_EMAIL_DOMAIN`
3. デプロイ。ビルドは `next build`（デフォルト）でOK。

> `SUPABASE_SERVICE_ROLE_KEY` はサーバー側専用です。`NEXT_PUBLIC_` を付けず、
> ブラウザに露出させないでください（本リポジトリでもサーバー専用ファイルでのみ使用）。

---

## セキュリティ設計のポイント（RLS）

- `is_admin()` / `is_active_member()` を **SECURITY DEFINER** 関数にして、
  profiles ポリシー内での無限再帰を回避。
- **停止（suspended）中の生徒**は `is_active_member()` が false になり、
  カテゴリ・投稿・添付を一切読めません。
- **質問の匿名化**：基本テーブル `questions` は「自分の質問のみ」閲覧可。
  他生徒向けの回答済みアーカイブは、投稿者を含まない匿名ビュー
  `qa_archive` / `qa_archive_answers` 経由でのみ公開（`anon` には不可）。
- **PDF** は非公開バケットに保存し、サーバーが署名付きURLを発行して配信。

---

## 将来の拡張（マルチコース化）

全テーブルに `course_id` を用意し、初期は単一の「メイン講座」に紐付けています。
将来は `courses` に行を追加し、`profiles.course_id` / `posts.course_id` で
講座単位の出し分けに発展できます（UI 追加のみで、テーブル変更は不要）。
