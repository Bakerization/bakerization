"use client";

import { useEffect, useRef, useState } from "react";
import { C, FONTS } from "@/lib/theme";
import { acquireThumbSlot } from "@/components/research/thumbSlots";

type Props = {
  id: string;
  title: string;
  /** Fixed box size (px). Ignored when `fluid`. */
  width?: number;
  height?: number;
  /** Fill the container width, keep the frame's aspect ratio. */
  fluid?: boolean;
  frameW?: number;
  frameH?: number;
};

/**
 * Live, scaled-down preview of an artifact. Mounted only while near the
 * viewport and while a global slot is free. The iframe is sandboxed
 * (scripts only, opaque origin) and ignores pointer events so drags and
 * clicks fall through to the row.
 */
export default function ArtifactThumb({ id, title, width = 160, height = 100, fluid, frameW = 1280, frameH = 800 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [granted, setGranted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [boxWidth, setBoxWidth] = useState(fluid ? 0 : width);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!fluid) return;
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setBoxWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fluid]);

  useEffect(() => {
    if (!inView) {
      setGranted(false);
      setLoaded(false);
      return;
    }
    const release = acquireThumbSlot(id, () => setGranted(true));
    return () => {
      release();
    };
  }, [inView, id]);

  const k = boxWidth > 0 ? boxWidth / frameW : 0;
  const boxStyle: React.CSSProperties = fluid
    ? { width: "100%", aspectRatio: `${frameW} / ${frameH}` }
    : { width, height };

  return (
    <div
      ref={boxRef}
      aria-hidden
      style={{
        ...boxStyle,
        position: "relative",
        overflow: "hidden",
        background: C.paper,
        border: `1px solid ${C.line}`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.mono,
          fontSize: 10,
          letterSpacing: "0.24em",
          color: C.line,
          opacity: loaded ? 0 : 1,
          transition: "opacity .25s",
        }}
      >
        PREVIEW
      </div>
      {granted && inView && k > 0 ? (
        <iframe
          src={`/research/raw/${id}`}
          title={title}
          sandbox="allow-scripts"
          loading="lazy"
          tabIndex={-1}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: frameW,
            height: frameH,
            border: 0,
            transform: `scale(${k})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
            background: "#fff",
            opacity: loaded ? 1 : 0,
            transition: "opacity .25s",
          }}
        />
      ) : null}
    </div>
  );
}
