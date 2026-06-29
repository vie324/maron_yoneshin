import { Shield, GraduationCap } from "lucide-react";
import { demoLogin } from "./demo-actions";
import { SubmitButton } from "@/components/submit-button";

/** デモモード時のログイン画面（ワンクリックで役割を選んで入る）。 */
export function DemoLogin() {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        デモモードで動作中です。Supabase の設定なしで全画面・全操作をお試しいただけます。
        （データはサーバー稼働中のみ保持され、再起動で初期状態に戻ります）
      </div>

      <form action={demoLogin}>
        <input type="hidden" name="role" value="admin" />
        <SubmitButton className="w-full" pendingText="入室中…">
          <Shield className="h-4 w-4" />
          運営者（管理画面）として入る
        </SubmitButton>
      </form>

      <form action={demoLogin}>
        <input type="hidden" name="role" value="member" />
        <SubmitButton
          className="w-full"
          variant="outline"
          pendingText="入室中…"
        >
          <GraduationCap className="h-4 w-4" />
          受講生として入る
        </SubmitButton>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        運営者は生徒管理・コンテンツ投稿・質問回答ができます。<br />
        受講生はコンテンツ閲覧と質問投稿ができます。
      </p>
    </div>
  );
}
