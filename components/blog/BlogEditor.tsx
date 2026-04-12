"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/blog-types";
import { toSlug, toLinkSafeUrl } from "@/lib/slug";

type Props = {
  initialPost?: BlogPost;
};

type LinkPreview = {
  title: string;
  description: string;
  image: string;
  url: string;
};

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-amber-200 px-3 py-1 text-sm text-amber-900 hover:bg-amber-50"
    >
      {label}
    </button>
  );
}

export default function BlogEditor({ initialPost }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [titleEn, setTitleEn] = useState(initialPost?.titleEn || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [excerptEn, setExcerptEn] = useState(initialPost?.excerptEn || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialPost?.heroImageUrl || "");
  const [contentHtml, setContentHtml] = useState(initialPost?.contentHtml || "");
  const [contentHtmlEn, setContentHtmlEn] = useState(initialPost?.contentHtmlEn || "");
  const [editingLocale, setEditingLocale] = useState<"ja" | "en">("ja");
  const [published, setPublished] = useState(initialPost?.published || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const generatedSlug = useMemo(
    () => toSlug(title || titleEn || "post"),
    [title, titleEn]
  );

  function runCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    syncEditorHtml();
  }

  function syncEditorHtml() {
    const value = editorRef.current?.innerHTML || "";
    if (editingLocale === "ja") {
      setContentHtml(value);
    } else {
      setContentHtmlEn(value);
    }
  }

  function switchEditorLanguage(next: "ja" | "en") {
    if (next === editingLocale) return;
    const currentValue = editorRef.current?.innerHTML || "";
    if (editingLocale === "ja") {
      setContentHtml(currentValue);
    } else {
      setContentHtmlEn(currentValue);
    }
    setEditingLocale(next);
  }

  async function uploadFile(file: File, prefix: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    const response = await fetch("/api/blog/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("画像アップロードに失敗しました。");
    }

    const data = (await response.json()) as { url: string };
    return data.url;
  }

  async function onUploadInlineImage(file: File) {
    const url = await uploadFile(file, "blog-assets/inline/");
    runCommand("insertImage", url);
  }

  async function onUploadHeroImage(file: File) {
    const url = await uploadFile(file, "blog-assets/hero/");
    setHeroImageUrl(url);
  }

  async function insertLinkPreview() {
    const rawUrl = window.prompt("URLを入力してください");
    if (!rawUrl) {
      return;
    }

    const safeUrl = toLinkSafeUrl(rawUrl);
    const response = await fetch(
      `/api/link-preview?url=${encodeURIComponent(safeUrl)}`
    );
    if (!response.ok) {
      setMessage("リンク情報の取得に失敗しました。");
      return;
    }

    const preview = (await response.json()) as LinkPreview;
    const card = `
      <a href="${preview.url}" target="_blank" rel="noopener noreferrer" style="display:block;border:1px solid #ead5b7;border-radius:12px;overflow:hidden;text-decoration:none;color:#3b3128;margin:16px 0;background:#fffdf9;">
        ${
          preview.image
            ? `<img src="${preview.image}" alt="${preview.title}" style="width:100%;max-height:220px;object-fit:cover;" />`
            : ""
        }
        <div style="padding:12px 14px;">
          <strong style="display:block;font-size:16px;line-height:1.4;">${preview.title}</strong>
          <p style="margin:6px 0 0;color:#6f5f4f;font-size:14px;line-height:1.5;">${preview.description || ""}</p>
        </div>
      </a>
    `;
    runCommand("insertHTML", card);
  }

  function insertLink() {
    const rawUrl = window.prompt("リンクURLを入力してください");
    if (!rawUrl) {
      return;
    }
    runCommand("createLink", toLinkSafeUrl(rawUrl));
  }

  async function savePost(nextPublished: boolean) {
    setSaving(true);
    setMessage("");
    const latestEditorHtml = editorRef.current?.innerHTML || "";
    const latestJaHtml = editingLocale === "ja" ? latestEditorHtml : contentHtml;
    const latestEnHtml =
      editingLocale === "en" ? latestEditorHtml : contentHtmlEn;

    const response = await fetch("/api/blog/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug || generatedSlug,
        title,
        titleEn,
        excerpt,
        excerptEn,
        heroImageUrl,
        contentHtml: latestJaHtml,
        contentHtmlEn: latestEnHtml,
        published: nextPublished,
        createdAt: initialPost?.createdAt,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setMessage("保存に失敗しました。");
      return;
    }

    const data = (await response.json()) as { post: BlogPost };
    setSlug(data.post.slug);
    setPublished(data.post.published);
    setMessage(nextPublished ? "公開しました。" : "下書きを保存しました。");
    router.push(`/blog/${data.post.slug}`);
  }

  return (
    <main className="min-h-screen bg-[#fffcf7] px-6 py-24">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold text-amber-950">
          {initialPost ? "ブログ編集" : "新規ブログ作成"}
        </h1>

        <section className="rounded-2xl border border-amber-100 bg-white p-6">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-amber-900">タイトル</span>
              <input
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事タイトル"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-amber-900">Title (English)</span>
              <input
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Post title"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-amber-900">スラッグ</span>
              <input
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder={generatedSlug}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-amber-900">概要</span>
              <textarea
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-amber-900">Excerpt (English)</span>
              <textarea
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
                rows={3}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-950">ヒーロー画像</h2>
            <button
              type="button"
              className="rounded border border-amber-200 px-3 py-1 text-sm text-amber-900 hover:bg-amber-50"
              onClick={() => heroImageInputRef.current?.click()}
            >
              画像アップロード
            </button>
          </div>
          <input
            ref={heroImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              await onUploadHeroImage(file);
              input.value = "";
            }}
          />
          <input
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="https://..."
          />
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt="Hero preview"
              className="mt-4 h-48 w-full rounded-xl object-cover"
            />
          )}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchEditorLanguage("ja")}
              className={`rounded-md border px-3 py-1 text-sm font-semibold ${
                editingLocale === "ja"
                  ? "border-amber-400 bg-amber-200 text-amber-900"
                  : "border-amber-200 text-amber-900 hover:bg-amber-50"
              }`}
            >
              本文 (日本語)
            </button>
            <button
              type="button"
              onClick={() => switchEditorLanguage("en")}
              className={`rounded-md border px-3 py-1 text-sm font-semibold ${
                editingLocale === "en"
                  ? "border-amber-400 bg-amber-200 text-amber-900"
                  : "border-amber-200 text-amber-900 hover:bg-amber-50"
              }`}
            >
              Body (English)
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <ToolbarButton label="太字" onClick={() => runCommand("bold")} />
            <ToolbarButton label="斜体" onClick={() => runCommand("italic")} />
            <ToolbarButton
              label="下線"
              onClick={() => runCommand("underline")}
            />
            <ToolbarButton
              label="見出し2"
              onClick={() => runCommand("formatBlock", "h2")}
            />
            <ToolbarButton
              label="見出し3"
              onClick={() => runCommand("formatBlock", "h3")}
            />
            <ToolbarButton
              label="箇条書き"
              onClick={() => runCommand("insertUnorderedList")}
            />
            <ToolbarButton label="リンク" onClick={insertLink} />
            <ToolbarButton
              label="色テキスト"
              onClick={() =>
                runCommand("foreColor", window.prompt("色コード", "#d97706") || "#d97706")
              }
            />
            <ToolbarButton
              label="リンク内容取得"
              onClick={insertLinkPreview}
            />
            <ToolbarButton
              label="本文画像"
              onClick={() => inlineImageInputRef.current?.click()}
            />
          </div>

          <input
            ref={inlineImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              await onUploadInlineImage(file);
              input.value = "";
            }}
          />

          <div
            key={editingLocale}
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditorHtml}
            className="blog-editor min-h-[360px] rounded-xl border border-amber-200 p-4 outline-none focus:border-amber-400"
            dangerouslySetInnerHTML={{
              __html: editingLocale === "ja" ? contentHtml : contentHtmlEn,
            }}
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost(false)}
            className="rounded-lg border border-amber-200 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-60"
          >
            下書き保存
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost(true)}
            className="rounded-lg bg-amber-200 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-300 disabled:opacity-60"
          >
            公開する
          </button>
          {initialPost?.slug && (
            <a
              href={`/blog/${initialPost.slug}`}
              className="rounded-lg border border-amber-200 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-50"
            >
              記事を表示
            </a>
          )}
        </div>

        {message && <p className="text-sm text-amber-800">{message}</p>}
        <p className="text-xs text-amber-900/60">
          現在の状態: {published ? "公開中" : "下書き"}
        </p>
      </div>
    </main>
  );
}
