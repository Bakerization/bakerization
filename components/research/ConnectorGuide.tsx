import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import { CopyBlock, Kicker, Panel } from "@/components/research/ui";

const step: React.CSSProperties = { margin: "0 0 8px", fontSize: 14, lineHeight: 1.8 };
const lead: React.CSSProperties = { margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 };
const note: React.CSSProperties = { margin: "0 0 22px", fontSize: 13, color: C.sub, lineHeight: 1.7 };
const h3: React.CSSProperties = { margin: "0 0 8px", fontFamily: FONTS.display, fontSize: 17, letterSpacing: -0.3 };

export default function ConnectorGuide({ appUrl, locale = "ja" }: { appUrl: string; locale?: Locale }) {
  const mcpUrl = `${appUrl}/api/mcp`;
  const en = locale === "en";
  const sampleTitle = en ? "Analysis report" : "分析レポート";
  return (
    <Panel>
      <Kicker style={{ marginBottom: 6 }}>▍CONNECT CLAUDE</Kicker>
      <p style={lead}>
        {en ? "How to publish HTML made by Claude straight to this site." : "Claude が作った HTML を、そのままここに公開するための接続方法です。"}
      </p>

      <h3 style={h3}>
        {en ? "A. Claude Cowork / claude.ai / Claude Desktop (custom connector)" : "A. Claude Cowork / claude.ai / Claude Desktop（カスタムコネクタ）"}
      </h3>
      {en ? (
        <ol style={{ margin: "0 0 6px", paddingLeft: 20 }}>
          <li style={step}>In Claude, open Customize → Connectors → Add custom connector.</li>
          <li style={step}>Name it <strong>Bakerization Research</strong> and enter the URL below (leave the OAuth Client ID / Secret empty).</li>
          <li style={step}>Click Connect → sign in to this site → Allow. From then on it authenticates automatically.</li>
          <li style={step}>Ask in chat: “publish this page to the research <em>inbox</em>”. Claude calls <code>publish_artifact</code> and returns the URL.</li>
        </ol>
      ) : (
        <ol style={{ margin: "0 0 6px", paddingLeft: 20 }}>
          <li style={step}>Claude の「カスタマイズ → コネクタ → カスタムコネクタを追加」を開く。</li>
          <li style={step}>名前に <strong>Bakerization Research</strong>、URL に下記を入力して追加（OAuth の Client ID / Secret は空のまま）。</li>
          <li style={step}>「接続」→ このサイトのログイン → 「許可する」。以後は自動で認証されます。</li>
          <li style={step}>チャットで「このページを research の <em>inbox</em> に公開して」と頼むと、Claude が <code>publish_artifact</code> を呼び、URL を返します。</li>
        </ol>
      )}
      <CopyBlock text={mcpUrl} label={en ? "MCP server URL" : "MCP サーバー URL"} />
      {en ? (
        <p style={note}>
          Add “build HTML deliverables as a single file, publish them to Research with <code>publish_artifact</code> and report the URL” to your Cowork project instructions or a skill, and pages get published without asking each time.
          Use <code>update_artifact</code> to revise (the URL stays the same). With <code>visibility: &quot;public&quot;</code> anyone can view it without signing in, and search engines index it. For pages over 200 KB, use the REST API below or the web upload.
        </p>
      ) : (
        <p style={note}>
          Cowork のプロジェクト指示やスキルに「HTML 成果物は単一ファイルで作り、<code>publish_artifact</code> で Research に公開して URL を報告する」と書いておくと、毎回頼まなくても自動で公開されます。
          更新は <code>update_artifact</code>（同じ URL を維持）。<code>visibility: &quot;public&quot;</code> を付けるとログイン不要で誰でも見られ、検索エンジンにも載ります。200 KB を超えるページは下の REST か Web アップロードを使ってください。
        </p>
      )}

      <h3 style={h3}>B. Claude Code</h3>
      <CopyBlock
        text={`claude mcp add --transport http bakerization ${mcpUrl}`}
        label={en ? "Run once in a terminal (then authenticate with /mcp)" : "ターミナルで 1 回実行（その後 /mcp で認証）"}
      />

      <h3 style={{ ...h3, margin: "14px 0 8px" }}>{en ? "C. REST API (scripts / curl)" : "C. REST API（スクリプト / curl）"}</h3>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        {en ? (
          <>Put a key created under “API keys” below in <code>Authorization: Bearer</code>.</>
        ) : (
          <>上の「API キー」で発行したキーを <code>Authorization: Bearer</code> に入れます。</>
        )}
      </p>
      <CopyBlock
        text={`curl -X POST ${appUrl}/api/research/artifacts \\
  -H "Authorization: Bearer $BKZ_API_KEY" \\
  -F "file=@report.html" \\
  -F "projectSlug=inbox" \\
  -F "title=${sampleTitle}"`}
        label={en ? "multipart (file)" : "multipart（ファイル）"}
      />
      <CopyBlock
        text={`curl -X POST ${appUrl}/api/research/artifacts \\
  -H "Authorization: Bearer $BKZ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectSlug":"inbox","title":"${sampleTitle}","html":"<!doctype html>…"}'`}
        label="JSON"
      />
      <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        {en ? (
          <>The <code>url</code> in the response is the viewer URL. Update with <code>PATCH /api/research/artifacts/&lt;id&gt;</code>, delete with <code>DELETE</code>.</>
        ) : (
          <>レスポンスの <code>url</code> がビューアの URL です。更新は <code>PATCH /api/research/artifacts/&lt;id&gt;</code>、削除は <code>DELETE</code>。</>
        )}
      </p>
    </Panel>
  );
}
