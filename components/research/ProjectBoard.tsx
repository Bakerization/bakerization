"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { C, FONTS } from "@/lib/theme";
import type { ResearchArtifactMeta, ResearchProject } from "@/lib/research-types";
import { Button, InlineError, Kicker, Panel, SectionRule, TwoStepDelete, fieldStyle, monoSmall } from "@/components/research/ui";
import { useStoredView } from "@/components/research/useStoredView";
import SortableItem from "@/components/research/SortableItem";
import ArtifactItem, { type ItemActions } from "@/components/research/ArtifactItem";
import UploadPanel from "@/components/research/UploadPanel";

type Props = {
  project: ResearchProject;
  projects: ResearchProject[];
  initialArtifacts: ResearchArtifactMeta[];
  viewer: { id: string; role: string };
};

async function api(path: string, init: RequestInit) {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
  return res.ok;
}

export default function ProjectBoard({ project, projects, initialArtifacts, viewer }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ResearchArtifactMeta[]>(initialArtifacts);
  const savedOrder = useRef<string[]>(initialArtifacts.map((a) => a.id));
  const [view, setView] = useStoredView();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [projectBusy, setProjectBusy] = useState(false);

  const isAdmin = viewer.role === "admin";
  const canManageProject = isAdmin || (project.ownerId !== null && project.ownerId === viewer.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const setBusy = useCallback((id: string, on: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  function restoreSavedOrder() {
    const index = new Map(savedOrder.current.map((id, i) => [id, i]));
    setItems((prev) => [...prev].sort((a, b) => (index.get(a.id) ?? 1e9) - (index.get(b.id) ?? 1e9)));
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((a) => a.id === active.id);
    const newIndex = items.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setError("");
    const orderedIds = next.map((a) => a.id);
    const ok = await api(`/api/research/projects/${project.slug}/order`, { method: "PUT", body: JSON.stringify({ orderedIds }) });
    if (ok) {
      savedOrder.current = orderedIds;
    } else {
      restoreSavedOrder();
      setError("並び替えの保存に失敗しました。元の順序に戻しました。");
    }
  }

  const actions: ItemActions = {
    onRename: async (id, title, desc) => {
      setBusy(id, true);
      const snapshot = items;
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, title, description: desc } : a)));
      const ok = await api(`/api/research/artifacts/${id}`, { method: "PATCH", body: JSON.stringify({ title, description: desc }) });
      if (!ok) setItems(snapshot);
      setBusy(id, false);
      return ok;
    },
    onMove: async (id, projectSlug) => {
      setBusy(id, true);
      const snapshot = items;
      setItems((prev) => prev.filter((a) => a.id !== id));
      const ok = await api(`/api/research/artifacts/${id}`, { method: "PATCH", body: JSON.stringify({ projectSlug }) });
      if (!ok) setItems(snapshot);
      else savedOrder.current = savedOrder.current.filter((x) => x !== id);
      setBusy(id, false);
      return ok;
    },
    onDelete: async (id) => {
      setBusy(id, true);
      const snapshot = items;
      setItems((prev) => prev.filter((a) => a.id !== id));
      const ok = await api(`/api/research/artifacts/${id}`, { method: "DELETE" });
      if (!ok) setItems(snapshot);
      else savedOrder.current = savedOrder.current.filter((x) => x !== id);
      setBusy(id, false);
      return ok;
    },
  };

  async function saveProject() {
    setProjectBusy(true);
    const ok = await api(`/api/research/projects/${project.slug}`, { method: "PATCH", body: JSON.stringify({ name: name.trim(), description: description.trim() }) });
    setProjectBusy(false);
    if (!ok) setError("プロジェクトの更新に失敗しました。");
    else { setSettingsOpen(false); router.refresh(); }
  }

  async function deleteProject() {
    setProjectBusy(true);
    const ok = await api(`/api/research/projects/${project.slug}`, { method: "DELETE" });
    if (!ok) { setProjectBusy(false); setError("プロジェクトの削除に失敗しました。"); return; }
    router.push("/research");
    router.refresh();
  }

  const ids = items.map((a) => a.id);
  const toggleStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "8px 12px",
    border: `1px solid ${active ? C.accent : C.line}`,
    background: active ? C.accent : "transparent",
    color: active ? C.bg : C.sub,
    cursor: "pointer",
  });

  return (
    <div>
      <SectionRule left={`▍PROJECT — /${project.slug}`} right={`${items.length} ARTIFACTS`} />

      <div className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="mob-h2" style={{ margin: 0, fontFamily: FONTS.display, fontSize: 36, letterSpacing: -1, fontWeight: 700 }}>{project.name}</h1>
          {project.description ? <p style={{ margin: "8px 0 0", color: C.sub, fontSize: 14, lineHeight: 1.7, maxWidth: 720 }}>{project.description}</p> : null}
        </div>
        <div className="mob-flex-wrap" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div role="group" aria-label="表示切替" style={{ display: "inline-flex" }}>
            <button type="button" style={toggleStyle(view === "table")} onClick={() => setView("table")} aria-pressed={view === "table"}>リスト</button>
            <button type="button" style={{ ...toggleStyle(view === "grid"), marginLeft: -1 }} onClick={() => setView("grid")} aria-pressed={view === "grid"}>グリッド</button>
          </div>
          {canManageProject ? <Button size="sm" onClick={() => setSettingsOpen((v) => !v)}>プロジェクト設定</Button> : null}
          <Button variant="accent" onClick={() => setUploadOpen((v) => !v)}>＋ アップロード</Button>
        </div>
      </div>

      {settingsOpen ? (
        <Panel strong style={{ marginBottom: 24, maxWidth: 640 }}>
          <Kicker style={{ marginBottom: 14 }}>▍PROJECT SETTINGS</Kicker>
          <div style={{ display: "grid", gap: 12 }}>
            <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} aria-label="プロジェクト名" />
            <textarea style={{ ...fieldStyle, minHeight: 72, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} aria-label="説明" />
            <div className="mob-flex-wrap" style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="accent" busy={projectBusy} onClick={() => void saveProject()}>保存</Button>
                <Button variant="ghost" onClick={() => setSettingsOpen(false)}>閉じる</Button>
              </div>
              {!project.isDefault ? (
                <TwoStepDelete label="プロジェクトを削除" confirmLabel="本当に削除する（中身は Inbox へ）" size="md" busy={projectBusy} onConfirm={deleteProject} />
              ) : null}
            </div>
          </div>
        </Panel>
      ) : null}

      {uploadOpen ? (
        <UploadPanel
          projectSlug={project.slug}
          onClose={() => setUploadOpen(false)}
          onUploaded={(artifact) => {
            setItems((prev) => [...prev, artifact]);
            savedOrder.current = [...savedOrder.current, artifact.id];
            setUploadOpen(false);
          }}
        />
      ) : null}

      <InlineError onClose={() => setError("")}>{error}</InlineError>

      {items.length === 0 ? (
        <p style={{ border: `1px solid ${C.line}`, padding: 24, color: C.sub, fontSize: 14, lineHeight: 1.8 }}>
          アーティファクトはまだありません。「アップロード」、または Claude（MCP コネクタ）/ API から追加してください。
        </p>
      ) : (
        <>
          <p style={{ ...monoSmall, margin: "0 0 12px" }}>
            ⋮⋮ をドラッグして並び替え（キーボード: ハンドルにフォーカス → Space → 矢印 → Space）
          </p>
          <DndContext id="research-artifacts" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={view === "table" ? verticalListSortingStrategy : rectSortingStrategy}>
              {view === "table" ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="mob-hide" style={{ display: "grid", gridTemplateColumns: "28px 160px minmax(0, 1fr) auto", gap: 16, padding: "0 12px", ...monoSmall }}>
                    <span />
                    <span>プレビュー</span>
                    <span>タイトル · ソース · 作成者 · 更新日</span>
                    <span style={{ textAlign: "right" }}>操作</span>
                  </div>
                  {items.map((a) => (
                    <SortableItem key={a.id} id={a.id}>
                      {(handle) => (
                        <ArtifactItem
                          layout="row"
                          artifact={a}
                          projects={projects}
                          currentProjectId={project.id}
                          canDelete={isAdmin || a.ownerId === viewer.id}
                          busy={busyIds.has(a.id)}
                          handle={handle}
                          actions={actions}
                        />
                      )}
                    </SortableItem>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 18 }}>
                  {items.map((a) => (
                    <SortableItem key={a.id} id={a.id}>
                      {(handle) => (
                        <ArtifactItem
                          layout="card"
                          artifact={a}
                          projects={projects}
                          currentProjectId={project.id}
                          canDelete={isAdmin || a.ownerId === viewer.id}
                          busy={busyIds.has(a.id)}
                          handle={handle}
                          actions={actions}
                        />
                      )}
                    </SortableItem>
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
