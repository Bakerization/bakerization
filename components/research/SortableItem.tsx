"use client";

import type { ReactNode } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type HandleProps = {
  ref: (el: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
};

/** Wraps a row/card; drag listeners go on the handle only, never on the whole item. */
export default function SortableItem({ id, children }: { id: string; children: (handle: HandleProps) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        position: "relative",
        zIndex: isDragging ? 2 : undefined,
      }}
    >
      {children({ ref: setActivatorNodeRef, attributes, listeners, isDragging })}
    </div>
  );
}
