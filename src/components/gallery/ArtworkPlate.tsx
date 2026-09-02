/**
 * Renders a stand-in for the artwork itself as inline SVG.
 *
 * The catalogue has no photography yet, and hotlinking someone's images to fill
 * a gallery is not an option. Palette and composition are derived entirely from
 * the slug, so a work looks identical on every render, on server and client,
 * and across reloads — no data field carries "what this should look like".
 *
 * Replaced by <Image> against the media bucket as soon as ArtworkMedia rows
 * exist: the API already returns primaryImageStorageKey, and this becomes the
 * fallback for works that have no photograph yet.
 */

const PALETTES: [string, string, string][] = [
  ["#c2410c", "#1c1917", "#e8c77a"],
  ["#a8a29e", "#57534e", "#fbbf24"],
  ["#1e40af", "#0c0a09", "#f0abfc"],
  ["#0e7490", "#082f49", "#67e8f9"],
  ["#292524", "#57534e", "#d6d3d1"],
  ["#be123c", "#4c0519", "#fda4af"],
  ["#78350f", "#1c1917", "#fcd34d"],
  ["#4338ca", "#020617", "#a5b4fc"],
  ["#0f766e", "#134e4a", "#5eead4"],
  ["#dc2626", "#450a0a", "#fecaca"],
];

const MOTIFS = ["strata", "orbit", "veil", "current", "monolith", "bloom"] as const;

type Motif = (typeof MOTIFS)[number];

function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Small deterministic PRNG so compositions differ but never flicker. */
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

interface Props {
  slug: string;
  title: string;
  artistName: string;
  className?: string;
}

export function ArtworkPlate({ slug, title, artistName, className }: Props) {
  const seed = seedFrom(slug);
  const [c1, c2, accent] = PALETTES[seed % PALETTES.length]!;
  const motif: Motif = MOTIFS[(seed >>> 8) % MOTIFS.length]!;
  const id = `p-${slug}`;
  const next = rng(seed);

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${title} by ${artistName}`}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        {/* Canvas tooth. Without it the flat fills read as a UI panel rather
            than as a painted surface. */}
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed={seed % 100} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.14" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="400" height="500" fill={`url(#${id}-bg)`} />

      {motif === "strata" && (
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={-20}
              y={60 + i * 58 + next() * 22}
              width={440}
              height={6 + next() * 26}
              fill={i % 3 === 0 ? accent : c1}
              opacity={0.18 + next() * 0.5}
            />
          ))}
        </g>
      )}

      {motif === "orbit" && (
        <g>
          {Array.from({ length: 5 }, (_, i) => (
            <circle
              key={i}
              cx={200 + (next() - 0.5) * 60}
              cy={250 + (next() - 0.5) * 60}
              r={40 + i * 34}
              fill="none"
              stroke={i % 2 === 0 ? accent : c1}
              strokeWidth={1 + next() * 5}
              opacity={0.25 + next() * 0.5}
            />
          ))}
        </g>
      )}

      {motif === "veil" && (
        <g>
          {Array.from({ length: 4 }, (_, i) => {
            const y = 120 + i * 90;
            return (
              <path
                key={i}
                d={`M -20 ${y} Q 120 ${y - 50 + next() * 100}, 200 ${y} T 420 ${y}`}
                fill="none"
                stroke={i % 2 === 0 ? accent : c1}
                strokeWidth={20 + next() * 40}
                opacity={0.16 + next() * 0.24}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {motif === "current" && (
        <g>
          {Array.from({ length: 22 }, (_, i) => (
            <path
              key={i}
              d={`M ${-20 + next() * 60} ${20 + i * 22} C 140 ${i * 22 + next() * 70}, 260 ${
                i * 22 - next() * 70
              }, 420 ${30 + i * 21}`}
              fill="none"
              stroke={i % 4 === 0 ? accent : c1}
              strokeWidth={0.8 + next() * 2.2}
              opacity={0.3 + next() * 0.45}
            />
          ))}
        </g>
      )}

      {motif === "monolith" && (
        <g>
          <rect
            x={110 + next() * 30}
            y={70 + next() * 40}
            width={150 + next() * 40}
            height={330}
            fill={c1}
            opacity={0.85}
          />
          <rect x={130} y={100} width={30} height={280} fill={accent} opacity={0.35} />
        </g>
      )}

      {motif === "bloom" && (
        <g>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={200 + Math.cos(a) * (50 + next() * 70)}
                cy={250 + Math.sin(a) * (60 + next() * 80)}
                rx={20 + next() * 55}
                ry={14 + next() * 40}
                fill={i % 3 === 0 ? accent : c1}
                opacity={0.16 + next() * 0.34}
                transform={`rotate(${(a * 180) / Math.PI} 200 250)`}
              />
            );
          })}
        </g>
      )}

      <rect width="400" height="500" fill={`url(#${id}-glow)`} style={{ mixBlendMode: "screen" }} />
      <rect width="400" height="500" filter={`url(#${id}-grain)`} opacity="0.5" />
    </svg>
  );
}
