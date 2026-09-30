"use client";

import { useEffect, useRef } from "react";

const MAX_OFFSET = 26; // px -- keeps the liquid shape from roaming into the title
const EASE = 0.055; // lower = more lag/inertia

/**
 * The hero's liquid metaball background: 2-3 solid warm-gray/charcoal
 * blobs run through an SVG "goo" filter (feGaussianBlur -> feColorMatrix
 * -> feComposite, defined below) so that when their CSS keyframes bring
 * them close together, they visibly fuse into one shape with a soft neck,
 * and cleanly separate again as they drift apart. A frosted-glass layer
 * (backdrop-filter + a static noise filter) sits on top, softening
 * surface detail without erasing the silhouette; the title and buttons
 * render in a later, unblurred layer.
 *
 * The autonomous merge/separate motion is pure CSS (keeps playing even if
 * this component's effect never runs). This component only adds a gentle
 * mouse-parallax on the whole group, via a single rAF loop writing
 * directly to a ref's style (no React state), so pointer movement never
 * triggers a re-render. Decorative only: brand flourish, not a claim that
 * anything about the research or the app's effectiveness is "shown" here.
 */
export function LiquidBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !hasFinePointer) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let running = true;

    function onPointerMove(e: PointerEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      targetX = ((e.clientX / w) * 2 - 1) * MAX_OFFSET;
      targetY = ((e.clientY / h) * 2 - 1) * MAX_OFFSET;
    }

    function tick() {
      if (!running) return;
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      if (wrapper) {
        wrapper.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Hidden filter defs: referenced via CSS filter:url(#nl-goo) / url(#nl-noise). */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="nl-goo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="nl-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          </filter>
        </defs>
      </svg>

      <div ref={wrapperRef} className="nl-liquid-wrapper absolute inset-0 flex items-center justify-center">
        <div className="nl-liquid-scale relative h-[22rem] w-[22rem] sm:h-[26rem] sm:w-[26rem]">
          {/* Liquid metaball group */}
          <div className="nl-liquid-group absolute inset-0">
            <div
              className="nl-liquid-blob nl-liquid-a h-[14rem] w-[14rem]"
              style={{
                left: "4rem",
                top: "4rem",
                background:
                  "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--color-surface) 55%, var(--color-text) 45%) 0%, var(--color-text) 60%)",
                opacity: 0.9,
              }}
            />
            <div
              className="nl-liquid-blob nl-liquid-b h-[9rem] w-[9rem]"
              style={{
                left: "15.3rem",
                top: "15.3rem",
                background:
                  "radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--color-surface) 50%, var(--color-text-muted) 50%) 0%, var(--color-text-muted) 65%)",
                opacity: 0.85,
              }}
            />
            <div
              className="nl-liquid-blob nl-liquid-c h-[5.5rem] w-[5.5rem]"
              style={{
                left: "0.5rem",
                top: "16rem",
                background:
                  "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-surface) 55%, var(--color-text) 45%) 0%, var(--color-text) 70%)",
                opacity: 0.8,
              }}
            />
          </div>

          {/* Frosted glass on top of the liquid group -- softens surface detail,
              never hides the silhouette or the connecting necks. */}
          <div
            className="nl-frost absolute inset-[-3rem]"
            style={{
              backdropFilter: "blur(7px)",
              WebkitBackdropFilter: "blur(7px)",
              background: "color-mix(in srgb, var(--color-surface) 32%, transparent)",
              maskImage: "radial-gradient(circle, black 52%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(circle, black 52%, transparent 78%)",
            }}
          >
            <div
              className="nl-glow-spot absolute left-[28%] top-[22%] h-24 w-24 rounded-full blur-2xl"
              style={{ background: "color-mix(in srgb, var(--color-surface) 70%, transparent)" }}
            />
            <div
              className="nl-glow-spot absolute right-[24%] top-[46%] h-16 w-16 rounded-full blur-xl"
              style={{ background: "color-mix(in srgb, var(--color-surface) 60%, transparent)", animationDelay: "-4s" }}
            />
            <div
              className="nl-noise absolute inset-0"
              style={{ filter: "url(#nl-noise)", mixBlendMode: "overlay" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
