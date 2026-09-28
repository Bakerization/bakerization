import { C, FONTS } from "@/lib/theme";
import { CopyBlock, Kicker, Panel } from "@/components/research/ui";

const step: React.CSSProperties = { margin: "0 0 8px", fontSize: 14, lineHeight: 1.8 };

export default function ConnectorGuide({ appUrl }: { appUrl: string }) {
  const mcpUrl = `${appUrl}/api/mcp`;
  return (
    <Panel>
      <Kicker style={{ marginBottom: 6 }}>▍CONNECT CLAUDE</Kicker>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        Claude が作った HTML を、そのままここに公開するための接続方法です。
      </p>

      <h3 style={{ margin: "0 0 8px", fontFamily: FONTS.display, fontSize: 17, letterSpacing: -0.3 }}>A. Claude Cowork / claude.ai / Claude Desktop（カスタムコネクタ）</h3>
      <ol style={{ margin: "0 0 6px", paddingLeft: 20 }}>
        <li style={step}>Claude の「カスタマイズ → コネクタ → カスタムコネクタを追加」を開く。</li>
        <li style={step}>名前に <strong>Bakerization Research</strong>、URL に下記を入力して追加（OAuth の Client ID / Secret は空のまま）。</li>
        <li style={step}>「接続」→ このサイトのログイン → 「許可する」。以後は自動で認証されます。</li>
        <li style={step}>チャットで「このページを research の <em>inbox</em> に公開して」と頼むと、Claude が <code>publish_artifact</code> を呼び、URL を返します。</li>
      </ol>
      <CopyBlock text={mcpUrl} label="MCP サーバー URL" />
      <p style={{ margin: "0 0 22px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        Cowork のプロジェクト指示やスキルに「HTML 成果物は単一ファイルで作り、<code>publish_artifact</code> で Research に公開して URL を報告する」と書いておくと、毎回頼まなくても自動で公開されます。
        更新は <code>update_artifact</code>（同じ URL を維持）。150 KB を超えるページは下の REST か Web アップロードを使ってください。
      </p>

      <h3 style={{ margin: "0 0 8px", fontFamily: FONTS.display, fontSize: 17, letterSpacing: -0.3 }}>B. Claude Code</h3>
      <CopyBlock text={`claude mcp add --transport http bakerization ${mcpUrl}`} label="ターミナルで 1 回実行（その後 /mcp で認証）" />

      <h3 style={{ margin: "14px 0 8px", fontFamily: FONTS.display, fontSize: 17, letterSpacing: -0.3 }}>C. REST API（スクリプト / curl）</h3>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>上の「API キー」で発行したキーを <code>Authorization: Bearer</code> に入れます。</p>
      <CopyBlock
        text={`curl -X POST ${appUrl}/api/research/artifacts \\
  -H "Authorization: Bearer $BKZ_API_KEY" \\
  -F "file=@report.html" \\
  -F "projectSlug=inbox" \\
  -F "title=分析レポート"`}
        label="multipart（ファイル）"
      />
      <CopyBlock
        text={`curl -X POST ${appUrl}/api/research/artifacts \\
  -H "Authorization: Bearer $BKZ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectSlug":"inbox","title":"分析レポート","html":"<!doctype html>…"}'`}
        label="JSON"
      />
      <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        レスポンスの <code>url</code> がビューアの URL です。更新は <code>PATCH /api/research/artifacts/&lt;id&gt;</code>、削除は <code>DELETE</code>。
      </p>
    </Panel>
  );
}
