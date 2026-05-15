"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { BlogPost } from "@/lib/blog-types";
import { toSlug, toLinkSafeUrl } from "@/lib/slug";
import { C, FONTS } from "@/lib/theme";

type Props = {
  initialPost?: BlogPost;
};

type Locale = "ja" | "en";

const TOOLBAR_BUTTON_STYLE: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "8px 12px",
  background: "transparent",
  color: C.sub,
  border: `1px solid ${C.line}`,
  cursor: "pointer",
};

function tbStyle(active: boolean): React.CSSProperties {
  return {
    ...TOOLBAR_BUTTON_STYLE,
    color: active ? C.bg : C.sub,
    background: active ? C.accent : "transparent",
    borderColor: active ? C.accent : C.line,
  };
}

function Toolbar({
  editor,
  onImage,
}: {
  editor: Editor | null;
  onImage: () => void;
}) {
  if (!editor) return null;

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("リンクURL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    editor!
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: toLinkSafeUrl(url) })
      .run();
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 10,
        borderBottom: `1px solid ${C.line}`,
        background: C.bg,
      }}
    >
      <button
        type="button"
        style={tbStyle(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (⌘B)"
      >
        B
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (⌘I)"
      >
        I
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("strike"))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </button>
      <span style={{ width: 1, background: C.line, margin: "0 4px" }} />
      <button
        type="button"
        style={tbStyle(editor.isActive("heading", { level: 2 }))}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("heading", { level: 3 }))}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </button>
      <span style={{ width: 1, background: C.line, margin: "0 4px" }} />
      <button
        type="button"
        style={tbStyle(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “ Quote
      </button>
      <button
        type="button"
        style={tbStyle(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </button>
      <span style={{ width: 1, background: C.line, margin: "0 4px" }} />
      <button
        type="button"
        style={tbStyle(editor.isActive("link"))}
        onClick={setLink}
      >
        🔗 Link
      </button>
      <button type="button" style={tbStyle(false)} onClick={onImage}>
        🖼 Image
      </button>
      <span style={{ flex: 1 }} />
      <button
        type="button"
        style={tbStyle(false)}
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (⌘Z)"
      >
        ↶
      </button>
      <button
        type="button"
        style={tbStyle(false)}
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (⌘⇧Z)"
      >
        ↷
      </button>
    </div>
  );
}

export default function BlogEditor({ initialPost }: Props) {
  const router = useRouter();
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [titleEn, setTitleEn] = useState(initialPost?.titleEn || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [excerptEn, setExcerptEn] = useState(initialPost?.excerptEn || "");
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialPost?.heroImageUrl || ""
  );
  const [editingLocale, setEditingLocale] = useState<Locale>("ja");
  const [published, setPublished] = useState(initialPost?.published || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const generatedSlug = useMemo(
    () => toSlug(title || titleEn || "post"),
    [title, titleEn]
  );

  const editorJa = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "本文をここに書く…" }),
    ],
    content: initialPost?.contentHtml || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-content-rich tiptap",
        style: `min-height: 420px; padding: 24px; outline: none;`,
      },
    },
  });

  const editorEn = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Write the English version…" }),
    ],
    content: initialPost?.contentHtmlEn || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-content-rich tiptap",
        style: `min-height: 420px; padding: 24px; outline: none;`,
      },
    },
  });

  const activeEditor = editingLocale === "ja" ? editorJa : editorEn;

  async function uploadFile(file: File, prefix: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    const response = await fetch("/api/blog/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("画像アップロードに失敗しました。");
    const data = (await response.json()) as { url: string };
    return data.url;
  }

  async function onPickInlineImage(file: File) {
    const url = await uploadFile(file, "blog-assets/inline/");
    activeEditor?.chain().focus().setImage({ src: url }).run();
  }

  async function onPickHeroImage(file: File) {
    const url = await uploadFile(file, "blog-assets/hero/");
    setHeroImageUrl(url);
  }

  async function savePost(nextPublished: boolean) {
    setSaving(true);
    setMessage("");

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
        contentHtml: editorJa?.getHTML() || "",
        contentHtmlEn: editorEn?.getHTML() || "",
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

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: C.fieldBg,
    color: C.ink,
    border: `1.5px solid ${C.fieldBorder}`,
    padding: "12px 14px",
    fontFamily: FONTS.body,
    fontSize: 15,
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: C.sub,
    marginBottom: 8,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        paddingTop: 96,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 48px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            padding: "16px 0",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            ▍ADMEN — {initialPost ? "Edit Entry" : "New Entry"}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: published ? C.accent : C.sub,
            }}
          >
            {published ? "公開中" : "下書き"}
          </span>
        </div>

        {/* Meta block */}
        <section
          style={{
            background: C.card,
            border: `1.5px solid ${C.line}`,
            padding: 32,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={labelStyle}>▎タイトル (JA)</span>
            <input
              style={fieldStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事タイトル"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={labelStyle}>▎Title (EN)</span>
            <input
              style={fieldStyle}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div>
            <span style={labelStyle}>▎スラッグ</span>
            <input
              style={fieldStyle}
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              placeholder={generatedSlug}
            />
          </div>
          <div>
            <span style={labelStyle}>▎ヒーロー画像</span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={fieldStyle}
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => heroImageInputRef.current?.click()}
                style={{
                  background: C.accent,
                  color: C.bg,
                  border: "none",
                  padding: "0 16px",
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Upload
              </button>
            </div>
            <input
              ref={heroImageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                await onPickHeroImage(file);
                input.value = "";
              }}
            />
            {heroImageUrl && (
              <img
                src={heroImageUrl}
                alt="hero preview"
                style={{
                  marginTop: 12,
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  border: `1px solid ${C.line}`,
                }}
              />
            )}
          </div>
          <div>
            <span style={labelStyle}>▎概要 (JA)</span>
            <textarea
              style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
          <div>
            <span style={labelStyle}>▎Excerpt (EN)</span>
            <textarea
              style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
              rows={3}
              value={excerptEn}
              onChange={(e) => setExcerptEn(e.target.value)}
            />
          </div>
        </section>

        {/* Editor */}
        <section
          style={{
            background: C.card,
            border: `1.5px solid ${C.line}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${C.line}`,
              background: C.bg,
            }}
          >
            {(["ja", "en"] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setEditingLocale(loc)}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  background:
                    editingLocale === loc ? C.card : "transparent",
                  color: editingLocale === loc ? C.accent : C.sub,
                  border: "none",
                  borderRight: loc === "ja" ? `1px solid ${C.line}` : "none",
                  cursor: "pointer",
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {loc === "ja" ? "本文 (日本語)" : "Body (English)"}
              </button>
            ))}
          </div>

          <Toolbar
            editor={activeEditor}
            onImage={() => inlineImageInputRef.current?.click()}
          />
          <input
            ref={inlineImageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              await onPickInlineImage(file);
              input.value = "";
            }}
          />

          <div style={{ background: C.bg }}>
            <div style={{ display: editingLocale === "ja" ? "block" : "none" }}>
              <EditorContent editor={editorJa} />
            </div>
            <div style={{ display: editingLocale === "en" ? "block" : "none" }}>
              <EditorContent editor={editorEn} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost(false)}
            style={{
              padding: "14px 22px",
              background: "transparent",
              color: C.ink,
              border: `1.5px solid ${C.line}`,
              fontFamily: FONTS.body,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            下書き保存
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost(true)}
            style={{
              padding: "14px 22px",
              background: C.accent,
              color: C.bg,
              border: "none",
              fontFamily: FONTS.body,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.4,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            公開する →
          </button>
          {initialPost?.slug && (
            <a
              href={`/blog/${initialPost.slug}`}
              style={{
                padding: "14px 22px",
                background: "transparent",
                color: C.sub,
                border: `1.5px solid ${C.line}`,
                fontFamily: FONTS.body,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 0.3,
                textDecoration: "none",
              }}
            >
              記事を表示
            </a>
          )}
        </div>

        {message && (
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.accent,
              margin: 0,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
