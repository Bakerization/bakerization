import type { EmailMessage } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const FOOT = "Bakerization Research · https://www.bakerization.com/research";

export function inviteEmail(input: { to: string; name: string; url: string; appUrl: string; days: number }): EmailMessage {
  const { to, name, url, appUrl, days } = input;
  const mcpUrl = `${appUrl}/api/mcp`;
  const text = `${name} 様

Bakerization Research（Claude が作った HTML レポートをメンバーで共有する場所）に招待されました。
下のリンクを開いてパスワードを設定すると、すぐに使えるようになります。

${url}

（リンクの有効期限は ${days} 日です）

■ ログイン後にできること
- ${appUrl}/research でプロジェクトとアーティファクトを閲覧・整理
- Claude / Claude Cowork の「カスタムコネクタ」に ${mcpUrl} を追加すると、
  Claude が作った HTML をそのまま Research に公開できます（接続時にこのアカウントでログイン）

このメールに心当たりがない場合は、そのまま破棄してください。

${FOOT}`;
  const html = `
<p>${escapeHtml(name)} 様</p>
<p>Bakerization Research（Claude が作った HTML レポートをメンバーで共有する場所）に招待されました。<br/>
下のボタンからパスワードを設定すると、すぐに使えるようになります。</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#2f5340;color:#fbd26b;text-decoration:none;font-weight:700">パスワードを設定する</a></p>
<p style="color:#5c6660;font-size:13px">リンクの有効期限は ${days} 日です。ボタンが開けない場合はこの URL を開いてください:<br/>${escapeHtml(url)}</p>
<h3 style="margin:24px 0 8px">ログイン後にできること</h3>
<ul>
<li><a href="${escapeHtml(appUrl)}/research">${escapeHtml(appUrl)}/research</a> でプロジェクトとアーティファクトを閲覧・整理</li>
<li>Claude / Claude Cowork の「カスタムコネクタ」に <code>${escapeHtml(mcpUrl)}</code> を追加すると、Claude が作った HTML をそのまま Research に公開できます（接続時にこのアカウントでログイン）</li>
</ul>
<p style="color:#5c6660;font-size:13px">このメールに心当たりがない場合は、そのまま破棄してください。</p>
<p style="color:#5c6660;font-size:12px">${escapeHtml(FOOT)}</p>`;
  return { to, subject: "【Bakerization Research】招待のお知らせ", text, html };
}

export function resetPasswordEmail(input: { to: string; name: string; url: string; days: number }): EmailMessage {
  const { to, name, url, days } = input;
  const text = `${name} 様

Bakerization Research のパスワード再設定リンクです。

${url}

（有効期限は ${days} 日です。心当たりがない場合は破棄してください）

${FOOT}`;
  const html = `
<p>${escapeHtml(name)} 様</p>
<p>Bakerization Research のパスワード再設定リンクです。</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#2f5340;color:#fbd26b;text-decoration:none;font-weight:700">パスワードを再設定する</a></p>
<p style="color:#5c6660;font-size:13px">有効期限は ${days} 日です。心当たりがない場合は破棄してください。<br/>${escapeHtml(url)}</p>
<p style="color:#5c6660;font-size:12px">${escapeHtml(FOOT)}</p>`;
  return { to, subject: "【Bakerization Research】パスワード再設定", text, html };
}
