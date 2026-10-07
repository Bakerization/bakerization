"use client";

import { useEffect, useId, useRef, useState } from "react";
import { C, FONTS } from "@/lib/theme";
import { registerThumb } from "@/components/research/thumbSlots";
import { versionedArtifactHref } from "@/lib/research-url";

type Props = {
  id: string;
  title: string;
  /** artifact.sha256: the raw URL is content-addressed, so browsers and the CDN cache it. */
  version: string;
  /** Small label on the placeholder (e.g. the project slug). */
  kicker?: string;
  /** Above the fold: mount right away instead of waiting for IntersectionObserver. */
  eager?: boolean;
  /** false = static placeholder only (cards far down a long list). */
  live?: boolean;
  /** Fixed box size (px). Ignored when `fluid`. */
  width?: number;
  height?: number;
  /** Fill the container width, keep the frame's aspect ratio. */
  fluid?: boolean;
  frameW?: number;
  frameH?: number;
};

/**
 * Live, scaled-down preview of an artifact. Mounting is driven by
 * thumbSlots.ts (viewport + concurrency caps); once loaded the iframe stays
 * mounted so scrolling back never reloads it. The iframe is sandboxed
 * (scripts only, opaque origin) and ignores pointer events so drags and
 * clicks fall through to the card.
 */
export default function ArtifactThumb({
  id,
  title,
  version,
  kicker,
  eager = false,
  live = true,
  width = 160,
  height = 100,
  fluid,
  frameW = 1024,
  frameH = 640,
}: Props) {
  const key = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<ReturnType<typeof registerThumb> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [boxWidth, setBoxWidth] = useState(fluid ? 0 : width);

  useEffect(() => {
    if (!live) return;
    const ctl = registerThumb(
      key,
      {
        mount: () => setMounted(true),
        unmount: () => {
          setMounted(false);
          setLoaded(false);
        },
      },
      eager
    );
    ctlRef.current = ctl;

    const el = boxRef.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => ctl.setInView(entries.some((e) => e.isIntersecting)),
        { rootMargin: "300px 0px" }
      );
      io.observe(el);
    } else {
      ctl.setInView(true);
    }
    return () => {
      io?.disconnect();
      ctl.release();
      ctlRef.current = null;
    };
  }, [key, eager, live]);

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

  // A hung frame must not hold a loading slot forever.
  useEffect(() => {
    if (!mounted || loaded) return;
    const t = window.setTimeout(() => {
      setLoaded(true);
      ctlRef.current?.setLoaded();
    }, 8000);
    return () => window.clearTimeout(t);
  }, [mounted, loaded]);

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
      {/* Server-rendered placeholder: visible until the frame has painted. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "10% 9%",
          display: "grid",
          alignContent: "center",
          gap: 6,
          opacity: loaded ? 0 : 1,
          transition: "opacity .25s",
        }}
      >
        <span style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.24em", color: C.sub, textTransform: "uppercase" }}>
          {kicker ?? "PREVIEW"}
        </span>
        <span
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.35,
            color: C.ink,
            opacity: 0.55,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </span>
      </div>
      {live && mounted && k > 0 ? (
        <iframe
          src={versionedArtifactHref(id, version)}
          title={title}
          sandbox="allow-scripts"
          loading={eager ? "eager" : undefined}
          tabIndex={-1}
          referrerPolicy="no-referrer"
          onLoad={() => {
            setLoaded(true);
            ctlRef.current?.setLoaded();
          }}
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
