"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, InlineError, Panel, fieldStyle } from "@/components/research/ui";
import { useResearchI18n } from "@/components/research/ResearchI18n";

export default function NewProjectForm() {
  const router = useRouter();
  const { t: copy } = useResearchI18n();
  const t = copy.newProject;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Button variant="accent" onClick={() => setOpen(true)}>
        {t.open}
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/research/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { project } = (await res.json()) as { project: { slug: string } };
      router.push(`/research/p/${project.slug}`);
      router.refresh();
    } catch {
      setError(t.failed);
      setBusy(false);
    }
  }

  return (
    <Panel strong style={{ maxWidth: 560 }}>
      <form onSubmit={submit}>
        <Field label={t.name} required>
          <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus required />
        </Field>
        <Field label={copy.common.descriptionOptional}>
          <textarea style={{ ...fieldStyle, minHeight: 80, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </Field>
        <InlineError>{error}</InlineError>
        <div style={{ display: "flex", gap: 10 }}>
          <Button type="submit" variant="accent" busy={busy}>
            {busy ? t.creating : t.create}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {copy.common.cancel}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
