import "server-only";
import type {
  Answer,
  Attachment,
  Category,
  Course,
  Post,
  Profile,
  Question,
} from "@/types/db";

// ============================================================================
// デモ用インメモリ・データストア
//   * Supabase を構築せずに全画面・全操作を試せるようにするための擬似DB。
//   * dev サーバー（単一プロセス）の起動中はミューテーションが保持される。
//   * globalThis に保持して HMR でリセットされないようにする。
//   * サーバー再起動 / サーバーレスのコールドスタートで初期データに戻る（デモ用途）。
// ============================================================================

export interface DemoStore {
  courses: Course[];
  profiles: Profile[];
  categories: Category[];
  posts: Post[];
  attachments: Attachment[];
  questions: Question[];
  answers: Answer[];
}

const COURSE_ID = "course-1";

// デモのログインユーザー
export const DEMO_ADMIN_ID = "demo-admin";
export const DEMO_MEMBER_ID = "demo-member";

function seed(): DemoStore {
  const courses: Course[] = [
    {
      id: COURSE_ID,
      name: "メイン講座",
      slug: "main",
      created_at: "2026-01-10T09:00:00.000Z",
    },
  ];

  const profiles: Profile[] = [
    {
      id: DEMO_ADMIN_ID,
      course_id: COURSE_ID,
      full_name: "運営 太郎",
      email: "admin@maron-course.jp",
      role: "admin",
      status: "active",
      created_at: "2026-01-10T09:00:00.000Z",
    },
    {
      id: DEMO_MEMBER_ID,
      course_id: COURSE_ID,
      full_name: "山田 太郎",
      email: "yamada@maron-course.jp",
      role: "member",
      status: "active",
      created_at: "2026-02-01T09:00:00.000Z",
    },
    {
      id: "member-2",
      course_id: COURSE_ID,
      full_name: "佐藤 花子",
      email: "sato@maron-course.jp",
      role: "member",
      status: "active",
      created_at: "2026-02-02T09:00:00.000Z",
    },
    {
      id: "member-3",
      course_id: COURSE_ID,
      full_name: "鈴木 一郎",
      email: "suzuki@maron-course.jp",
      role: "member",
      status: "active",
      created_at: "2026-02-03T09:00:00.000Z",
    },
    {
      id: "member-4",
      course_id: COURSE_ID,
      full_name: "高橋 美咲",
      email: "takahashi@maron-course.jp",
      role: "member",
      status: "active",
      created_at: "2026-02-04T09:00:00.000Z",
    },
    {
      id: "member-5",
      course_id: COURSE_ID,
      full_name: "田中 健",
      email: "tanaka@maron-course.jp",
      role: "member",
      status: "suspended",
      created_at: "2026-02-05T09:00:00.000Z",
    },
  ];

  const categories: Category[] = [
    { id: "cat-1", course_id: COURSE_ID, name: "動画ライブラリ", slug: "videos", sort_order: 1, created_at: "2026-01-10T09:00:00.000Z" },
    { id: "cat-2", course_id: COURSE_ID, name: "資料（PDF）", slug: "documents", sort_order: 2, created_at: "2026-01-10T09:00:00.000Z" },
    { id: "cat-3", course_id: COURSE_ID, name: "セミナーアーカイブ", slug: "seminars", sort_order: 3, created_at: "2026-01-10T09:00:00.000Z" },
    { id: "cat-4", course_id: COURSE_ID, name: "学習コンテンツ", slug: "learning", sort_order: 4, created_at: "2026-01-10T09:00:00.000Z" },
    { id: "cat-5", course_id: COURSE_ID, name: "マーケティング／集客", slug: "marketing", sort_order: 5, created_at: "2026-01-10T09:00:00.000Z" },
  ];

  const posts: Post[] = [
    {
      id: "post-1",
      course_id: COURSE_ID,
      category_id: "cat-1",
      type: "video",
      title: "問診の基本フロー（10分）",
      body: "初診時の問診の流れを解説します。\n\n- 主訴の確認\n- 既往歴・生活習慣\n- 評価への橋渡し\n\nまずはこの順番を体に覚えさせましょう。",
      youtube_url: "https://youtu.be/aqz-KE-bpKQ",
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-20T10:00:00.000Z",
      updated_at: "2026-06-20T10:00:00.000Z",
    },
    {
      id: "post-2",
      course_id: COURSE_ID,
      category_id: "cat-1",
      type: "video",
      title: "肩関節の可動域評価デモ",
      body: "肩関節の評価手順を実演でまとめました。左右差の見方に注目してください。",
      youtube_url: "https://youtu.be/ScMzIvxBSi4",
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-18T10:00:00.000Z",
      updated_at: "2026-06-18T10:00:00.000Z",
    },
    {
      id: "post-3",
      course_id: COURSE_ID,
      category_id: "cat-2",
      type: "document",
      title: "問診票テンプレート 一式",
      body: "院でそのまま使える問診票のテンプレートです。印刷して使うか、内容を自院に合わせて調整してください。",
      youtube_url: null,
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-15T10:00:00.000Z",
      updated_at: "2026-06-15T10:00:00.000Z",
    },
    {
      id: "post-4",
      course_id: COURSE_ID,
      category_id: "cat-2",
      type: "document",
      title: "施術同意書サンプル",
      body: "トラブル予防のための同意書サンプルです。",
      youtube_url: null,
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-14T10:00:00.000Z",
      updated_at: "2026-06-14T10:00:00.000Z",
    },
    {
      id: "post-5",
      course_id: COURSE_ID,
      category_id: "cat-3",
      type: "seminar",
      title: "2026年5月セミナー：地域一番院の集患設計",
      body: "## セミナー要約\n\n動画を見る時間がない方向けの要約です。\n\n### 1. 商圏の考え方\n半径2kmの人口構成を把握し、ターゲットを1つに絞る。\n\n### 2. 口コミ導線\n施術後の声かけテンプレートで Google 口コミを依頼する。\n\n### 3. リピート設計\n次回予約をその場で取る運用に変えるだけで離脱が大きく減る。\n\n> フル版動画では各項目の具体例を解説しています。",
      youtube_url: "https://youtu.be/aqz-KE-bpKQ",
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-10T10:00:00.000Z",
      updated_at: "2026-06-10T10:00:00.000Z",
    },
    {
      id: "post-6",
      course_id: COURSE_ID,
      category_id: "cat-4",
      type: "article",
      title: "症例：五十肩の3ヶ月経過とアプローチ",
      body: "## 症例概要\n\n50代女性、右肩の挙上時痛で来院。\n\n## 評価\n- 自動挙上 90°、他動 110°\n- 夜間痛あり\n\n## アプローチ\n1. 急性期は炎症管理を優先\n2. 回復期に可動域訓練を段階的に追加\n\n## 経過\n3ヶ月で挙上 160° まで改善。**焦らず病期に合わせる**のがポイント。",
      youtube_url: null,
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-08T10:00:00.000Z",
      updated_at: "2026-06-08T10:00:00.000Z",
    },
    {
      id: "post-7",
      course_id: COURSE_ID,
      category_id: "cat-4",
      type: "article",
      title: "学習問題：神経学的検査のチェックリスト",
      body: "次の症状から考えられる絞扼部位を答えてください。\n\n- [ ] 母指〜中指のしびれ\n- [ ] 小指側のしびれ\n- [ ] 下肢の SLR 陽性\n\n解答は次回の動画で解説します。",
      youtube_url: null,
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-05T10:00:00.000Z",
      updated_at: "2026-06-05T10:00:00.000Z",
    },
    {
      id: "post-8",
      course_id: COURSE_ID,
      category_id: "cat-5",
      type: "article",
      title: "口コミを増やす施術後の導線設計",
      body: "## ねらい\n施術満足度が高い瞬間に、自然に口コミを依頼する導線をつくる。\n\n## 具体策\n1. 会計前に「お変わりありましたか？」と確認\n2. 改善を実感している方にだけ QR を提示\n3. その場で書いてもらうのではなく、後日リマインド\n\n押し売り感を出さないのがコツです。",
      youtube_url: null,
      is_published: true,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-02T10:00:00.000Z",
      updated_at: "2026-06-02T10:00:00.000Z",
    },
    {
      id: "post-9",
      course_id: COURSE_ID,
      category_id: "cat-4",
      type: "article",
      title: "【下書き】ロープレ台本：初診カウンセリング",
      body: "（作成中）初診カウンセリングのロールプレイ台本です。公開前の下書き例として表示しています。",
      youtube_url: null,
      is_published: false,
      author_id: DEMO_ADMIN_ID,
      created_at: "2026-06-25T10:00:00.000Z",
      updated_at: "2026-06-25T10:00:00.000Z",
    },
  ];

  const attachments: Attachment[] = [
    {
      id: "att-1",
      post_id: "post-3",
      file_path: "post-3/monshin-template.pdf",
      file_name: "問診票テンプレート.pdf",
      mime_type: "application/pdf",
      size_bytes: 84213,
      created_at: "2026-06-15T10:00:00.000Z",
    },
    {
      id: "att-2",
      post_id: "post-3",
      file_path: "post-3/karte-howto.pdf",
      file_name: "カルテの書き方ガイド.pdf",
      mime_type: "application/pdf",
      size_bytes: 121544,
      created_at: "2026-06-15T10:05:00.000Z",
    },
    {
      id: "att-3",
      post_id: "post-4",
      file_path: "post-4/consent.pdf",
      file_name: "施術同意書サンプル.pdf",
      mime_type: "application/pdf",
      size_bytes: 65210,
      created_at: "2026-06-14T10:00:00.000Z",
    },
  ];

  const questions: Question[] = [
    {
      id: "q-1",
      course_id: COURSE_ID,
      author_id: DEMO_MEMBER_ID,
      title: "問診票の保管期間はどれくらいが目安ですか？",
      body: "問診票やカルテの保管期間の目安を教えてください。",
      status: "answered",
      created_at: "2026-06-21T08:00:00.000Z",
    },
    {
      id: "q-2",
      course_id: COURSE_ID,
      author_id: DEMO_MEMBER_ID,
      title: "予約システムのおすすめはありますか？",
      body: "個人院でも導入しやすい予約システムがあれば知りたいです。",
      status: "open",
      created_at: "2026-06-26T08:00:00.000Z",
    },
    {
      id: "q-3",
      course_id: COURSE_ID,
      author_id: "member-2",
      title: "施術後の好転反応はどう説明していますか？",
      body: "好転反応について、患者さんへの伝え方に悩んでいます。",
      status: "answered",
      created_at: "2026-06-19T08:00:00.000Z",
    },
    {
      id: "q-4",
      course_id: COURSE_ID,
      author_id: "member-3",
      title: "回数券の価格設定の考え方を教えてください",
      body: "回数券を導入したいのですが、価格と枚数の決め方が分かりません。",
      status: "answered",
      created_at: "2026-06-17T08:00:00.000Z",
    },
    {
      id: "q-5",
      course_id: COURSE_ID,
      author_id: "member-4",
      title: "肩こりが主訴の方への問診のコツ",
      body: "肩こり主訴の方に、どこまで問診を掘り下げるべきでしょうか。",
      status: "open",
      created_at: "2026-06-27T08:00:00.000Z",
    },
  ];

  const answers: Answer[] = [
    {
      id: "a-1",
      question_id: "q-1",
      author_id: DEMO_ADMIN_ID,
      body: "法令上の保管期間は、施術録（カルテ）は最終施術日から**5年**が一つの目安です。院の運用ルールとして揃えておくと安心です。",
      created_at: "2026-06-21T12:00:00.000Z",
    },
    {
      id: "a-2",
      question_id: "q-3",
      author_id: DEMO_ADMIN_ID,
      body: "「一時的に反応が出ることがあります」と**事前に**伝えておくのがポイントです。事後の説明よりも信頼を損ねません。具体的な声かけ例はセミナーアーカイブにもあります。",
      created_at: "2026-06-19T12:00:00.000Z",
    },
    {
      id: "a-3",
      question_id: "q-4",
      author_id: DEMO_ADMIN_ID,
      body: "まずは「1回単価 × 想定来院回数」で総額を出し、そこから**継続の動機づけ**になる割引幅（5〜10%程度）を設計します。値引きしすぎないことが大切です。",
      created_at: "2026-06-17T12:00:00.000Z",
    },
  ];

  return { courses, profiles, categories, posts, attachments, questions, answers };
}

const g = globalThis as unknown as { __demoStore?: DemoStore };
export const store: DemoStore = g.__demoStore ?? (g.__demoStore = seed());

export function tableData(name: string): unknown[] {
  switch (name) {
    case "courses":
      return store.courses;
    case "profiles":
      return store.profiles;
    case "categories":
      return store.categories;
    case "posts":
      return store.posts;
    case "attachments":
      return store.attachments;
    case "questions":
      return store.questions;
    case "answers":
      return store.answers;
    // 匿名アーカイブ（ビュー相当・投稿者を含めない）
    case "qa_archive":
      return store.questions
        .filter((q) => q.status === "answered")
        .map((q) => ({
          id: q.id,
          title: q.title,
          body: q.body,
          status: q.status,
          created_at: q.created_at,
        }));
    case "qa_archive_answers": {
      const answeredIds = new Set(
        store.questions.filter((q) => q.status === "answered").map((q) => q.id),
      );
      return store.answers
        .filter((a) => answeredIds.has(a.question_id))
        .map((a) => ({
          id: a.id,
          question_id: a.question_id,
          body: a.body,
          created_at: a.created_at,
        }));
    }
    default:
      return [];
  }
}
