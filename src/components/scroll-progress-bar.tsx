"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed bar at the very top of the viewport that fills left-to-right with
 * how far down the current page you've scrolled. Scroll position is read
 * on a passive listener and written directly to a ref's transform inside a
 * single rAF-throttled callback (no React state), so scrolling never
 * triggers a re-render.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, doc.scrollTop / maxScroll)) : 0;
      if (bar) bar.style.transform = `scaleX(${progress})`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] bg-(--color-border)/60"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-(--color-accent)"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
