import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { DEMO_COOKIE } from "./mode";
import { store, tableData } from "./data";

// ============================================================================
// 擬似 Supabase クライアント（デモ用）
//   * 各ページが使う supabase-js のサブセット（from/select/eq/in/order/limit/
//     single/maybeSingle/insert/update/delete、auth、storage）を実装。
//   * これによりページ側のコードは一切変更せずにインメモリで動作する。
// ============================================================================

// デモ環境の「資料プレビュー」用に表示するサンプルドキュメント（data URL）
const DEMO_DOC_URL =
  "data:text/html;charset=utf-8," +
  encodeURIComponent(
    "<!doctype html><html lang='ja'><meta charset='utf-8'>" +
      "<body style='font-family:sans-serif;padding:24px;color:#0f172a'>" +
      "<h2>デモ用サンプル資料</h2>" +
      "<p>本番環境では、ここに Supabase Storage に保存した実際の PDF が表示されます。</p>" +
      "<p>（デモモードのためサンプル表示です）</p></body></html>",
  );

type Filter =
  | { t: "eq"; col: string; val: unknown }
  | { t: "in"; col: string; vals: unknown[] };

type Row = Record<string, unknown>;

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

class MockQuery {
  private filters: Filter[] = [];
  private sort: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private selectOpts: { count?: string; head?: boolean } | null = null;
  private isSingle = false;
  private isMaybe = false;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts) this.selectOpts = opts;
    return this;
  }
  insert(payload: Row | Row[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ t: "eq", col, val });
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push({ t: "in", col, vals });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.sort = { col, ascending: opts?.ascending !== false };
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.isSingle = true;
    return this;
  }
  maybeSingle() {
    this.isMaybe = true;
    return this;
  }

  then<TResult1 = unknown, TResult2 = never>(
    resolve?:
      | ((value: { data: unknown; error: unknown; count?: number }) => TResult1)
      | null,
    reject?: ((reason: unknown) => TResult2) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.run()).then(resolve as never, reject as never);
  }

  private liveArray(): Row[] {
    return tableData(this.table) as Row[];
  }

  private applyFilters(rows: Row[]): Row[] {
    return rows.filter((r) =>
      this.filters.every((f) =>
        f.t === "eq" ? r[f.col] === f.val : f.vals.includes(r[f.col]),
      ),
    );
  }

  private run(): { data: unknown; error: unknown; count?: number } {
    if (this.mode === "insert") return this.runInsert();
    if (this.mode === "update") return this.runUpdate();
    if (this.mode === "delete") return this.runDelete();

    let rows = this.applyFilters(this.liveArray());
    const count = rows.length;

    if (this.selectOpts?.head) return { data: null, error: null, count };

    if (this.sort) {
      const { col, ascending } = this.sort;
      rows = [...rows].sort(
        (a, b) => (ascending ? 1 : -1) * compare(a[col], b[col]),
      );
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    if (this.isSingle) {
      return {
        data: rows[0] ?? null,
        error: rows.length ? null : { message: "No rows found", code: "PGRST116" },
        count,
      };
    }
    if (this.isMaybe) return { data: rows[0] ?? null, error: null, count };
    return { data: rows, error: null, count };
  }

  private runInsert() {
    const arr = this.liveArray();
    const list = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
    const now = new Date().toISOString();
    const inserted: Row[] = list.map((p) => {
      const row: Row = { id: randomUUID(), created_at: now, ...p };
      if (this.table === "posts" && row.updated_at == null) row.updated_at = now;
      return row;
    });
    arr.push(...inserted);
    if (this.isSingle) return { data: inserted[0] ?? null, error: null };
    return { data: inserted, error: null };
  }

  private runUpdate() {
    const matched = this.applyFilters(this.liveArray());
    const now = new Date().toISOString();
    for (const row of matched) {
      Object.assign(row, this.payload);
      if (this.table === "posts") row.updated_at = now;
    }
    return { data: matched, error: null };
  }

  private runDelete() {
    const arr = this.liveArray();
    const matched = this.applyFilters(arr);
    const ids = new Set(matched.map((r) => r.id));
    for (let i = arr.length - 1; i >= 0; i--) {
      if (ids.has(arr[i].id)) arr.splice(i, 1);
    }
    // 簡易カスケード
    if (this.table === "posts") {
      removeWhere(store.attachments, (a) => ids.has(a.post_id));
    }
    if (this.table === "questions") {
      removeWhere(store.answers, (a) => ids.has(a.question_id));
    }
    return { data: null, error: null };
  }
}

function removeWhere<T>(arr: T[], pred: (item: T) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) arr.splice(i, 1);
  }
}

interface UserMeta {
  full_name?: string;
  role?: string;
  status?: string;
}

function currentUser() {
  const id = cookies().get(DEMO_COOKIE)?.value;
  const p = id ? store.profiles.find((x) => x.id === id) : null;
  return p ? { id: p.id, email: p.email } : null;
}

const auth = {
  async getUser() {
    return { data: { user: currentUser() }, error: null };
  },
  async signInWithPassword() {
    return { data: { user: null, session: null }, error: { message: "demo" } };
  },
  async signOut() {
    return { error: null };
  },
  async updateUser() {
    return { data: { user: currentUser() }, error: null };
  },
  admin: {
    async createUser(params: { email: string; user_metadata?: UserMeta }) {
      const { email, user_metadata } = params;
      if (store.profiles.some((p) => p.email === email)) {
        return {
          data: { user: null },
          error: { message: "already been registered" },
        };
      }
      const id = randomUUID();
      store.profiles.push({
        id,
        course_id: store.courses[0]?.id ?? null,
        full_name: user_metadata?.full_name ?? "",
        email,
        role: (user_metadata?.role as "admin" | "member") ?? "member",
        status: (user_metadata?.status as "active" | "suspended") ?? "active",
        created_at: new Date().toISOString(),
      });
      return { data: { user: { id, email } }, error: null };
    },
    async updateUserById() {
      return { data: { user: null }, error: null };
    },
    async deleteUser(id: string) {
      removeWhere(store.profiles, (p) => p.id === id);
      const qIds = new Set(
        store.questions.filter((q) => q.author_id === id).map((q) => q.id),
      );
      removeWhere(store.questions, (q) => q.author_id === id);
      removeWhere(store.answers, (a) => qIds.has(a.question_id));
      return { data: { user: null }, error: null };
    },
  },
};

function storageBucket() {
  return {
    async upload(path: string) {
      return { data: { path }, error: null };
    },
    async createSignedUrl() {
      return { data: { signedUrl: DEMO_DOC_URL }, error: null };
    },
    async remove() {
      return { data: [], error: null };
    },
  };
}

/** デモ用の擬似 Supabase クライアント（サーバー）。 */
export function createMockServerClient() {
  return {
    auth,
    storage: { from: () => storageBucket() },
    from: (table: string) => new MockQuery(table),
  };
}
