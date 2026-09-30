/**
 * The app's one decorative visual system: flat, soft organic shapes in the
 * off-white / greige / charcoal palette, seen partly through a single
 * frosted-glass pane (a real CSS backdrop-filter, not a painted imitation),
 * with a large index number and the field's name set sharply on top.
 *
 * Every instance uses the same three-shape composition; only crop,
 * rotation and placement change with the seed, so rows read as one family
 * and differ by their label, not by unrelated 3D objects. Static: no
 * animation, and the only motion is the row-hover zoom on the shape layer
 * (disabled under prefers-reduced-motion, see globals.css).
 */

export type FieldVisualTone = "light" | "greige" | "dark";

const TONES: Record<
  FieldVisualTone,
  { bg: string; shapes: [string, string, string]; ink: string; glass: string; edge: string }
> = {
  light: {
    bg: "#ebe9e3",
    shapes: ["#d8d5ce", "#b5b2ac", "#3a3936"],
    ink: "#171614",
    glass: "rgba(255,255,255,0.16)",
    edge: "rgba(255,255,255,0.75)",
  },
  greige: {
    bg: "#dddbd6",
    shapes: ["#faf9f6", "#a6a39d", "#2e2d2b"],
    ink: "#171614",
    glass: "rgba(255,255,255,0.14)",
    edge: "rgba(255,255,255,0.7)",
  },
  dark: {
    bg: "#2a2928",
    shapes: ["#4a4946", "#86837e", "#ebe9e3"],
    ink: "#f4f2ed",
    glass: "rgba(255,255,255,0.06)",
    edge: "rgba(255,255,255,0.28)",
  },
};

const TONE_ORDER: FieldVisualTone[] = ["light", "greige", "dark"];

// Korean field names people commonly use -> the English label shown on the
// visual. Anything else is shown as typed, so the label always matches data.
const FIELD_LABELS: Record<string, string> = {
  음악: "MUSIC",
  개발: "DEVELOPMENT",
  프로그래밍: "PROGRAMMING",
  디자인: "DESIGN",
  교육: "EDUCATION",
  커머스: "COMMERCE",
  미술: "ART",
  예술: "ART",
  운동: "SPORTS",
  스포츠: "SPORTS",
  요리: "COOKING",
  글쓰기: "WRITING",
  마케팅: "MARKETING",
  영상: "VIDEO",
  사진: "PHOTOGRAPHY",
  경영: "BUSINESS",
  비즈니스: "BUSINESS",
  언어: "LANGUAGE",
  외국어: "LANGUAGE",
  연구: "RESEARCH",
  기획: "PLANNING",
  공연: "PERFORMANCE",
  봉사: "VOLUNTEERING",
  창업: "STARTUP",
  금융: "FINANCE",
  의료: "HEALTHCARE",
  건강: "HEALTH",
  여행: "TRAVEL",
  게임: "GAMES",
  데이터: "DATA",
};

export function fieldLabel(field: string): string {
  const key = field.trim();
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  // Latin input (e.g. "UX", "Marketing") reads best in the same uppercase set.
  if (/^[\x20-\x7e]+$/.test(key)) return key.toUpperCase();
  return key;
}

function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth closed blob: points on a slightly irregular circle joined with Catmull-Rom curves. */
function blob(cx: number, cy: number, r: number, jitter: number, rand: () => number, points = 7) {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - jitter / 2 + rand() * jitter);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.86];
  });
  const p = (i: number) => pts[(i + points) % points];
  let d = `M${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return `${d} Z`;
}

export function toneForIndex(index: number): FieldVisualTone {
  return TONE_ORDER[index % TONE_ORDER.length];
}

export function FieldVisual({
  seed,
  number,
  label,
  tone = "light",
  aspect = "aspect-[16/10]",
  className = "",
  compact = false,
}: {
  seed: string;
  /** Large index shown top-left, e.g. "01". Omit for an unnumbered visual. */
  number?: string;
  /** Name shown bottom-left, e.g. fieldLabel("음악") -> "MUSIC". */
  label?: string;
  tone?: FieldVisualTone;
  aspect?: string;
  className?: string;
  /** Smaller type for short banner crops. */
  compact?: boolean;
}) {
  const t = TONES[tone];
  const rand = rng(hash(seed));

  // One composition for every instance; the seed only moves the camera.
  const rotate = (rand() - 0.5) * 70;
  const shiftX = (rand() - 0.5) * 260;
  const shiftY = (rand() - 0.5) * 160;
  const scale = 0.9 + rand() * 0.35;
  const mirror = rand() > 0.5 ? -1 : 1;
  const big = blob(560, 330, 290, 0.28, rand);
  const mid = blob(300, 250, 170, 0.34, rand);
  // The small charcoal accent sits outside the rotated group, in the right
  // half near the glass edge, so it can never collide with the number.
  const small = blob(620 + rand() * 260, 110 + rand() * 400, 62, 0.4, rand, 6);

  // Glass pane: covers part of the shapes so depth shows through it. It stays
  // in the right half so it never sits under the number or the label.
  const paneStyle = {
    width: `${Math.round(30 + rand() * 8)}%`,
    top: `${Math.round(10 + rand() * 14)}%`,
    bottom: `${Math.round(10 + rand() * 14)}%`,
    right: `${Math.round(7 + rand() * 9)}%`,
    background: t.glass,
    borderColor: t.edge,
  } as const;

  return (
    <div className={`nl-visual-frame ${aspect} ${className}`} style={{ background: t.bg }}>
      <svg aria-hidden focusable="false" viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g transform={`translate(${500 + shiftX} ${312 + shiftY}) rotate(${rotate.toFixed(1)}) scale(${(scale * mirror).toFixed(3)} ${scale.toFixed(3)}) translate(-500 -312)`}>
          <path d={big} fill={t.shapes[0]} />
          <path d={mid} fill={t.shapes[1]} />
        </g>
        <path d={small} fill={t.shapes[2]} />
      </svg>

      <div
        aria-hidden
        className="absolute rounded-[26px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)]"
        style={paneStyle}
      />

      {number || label ? (
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col justify-between ${compact ? "p-5" : "p-6 sm:p-8 lg:p-10"}`}
          style={{ color: t.ink }}
        >
          {number ? (
            <span
              className={`font-(family-name:--font-display) font-semibold leading-none tracking-[-0.04em] ${
                compact ? "text-5xl" : "text-[clamp(3.5rem,7vw,6.5rem)]"
              }`}
            >
              {number}
            </span>
          ) : (
            <span />
          )}
          {label ? (
            <span
              className={`font-(family-name:--font-display) font-semibold uppercase tracking-[0.16em] ${compact ? "text-sm" : "text-base sm:text-lg"}`}
            >
              {label}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
